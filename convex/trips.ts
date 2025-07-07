import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Trip CRUD operations
export const createTrip = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
    travelers: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("trips", {
      name: args.name,
      description: args.description,
      status: "planning",
      budget: args.budget,
      travelers: args.travelers,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTrips = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trips").order("desc").collect();
  },
});

export const getTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("planning"), v.literal("active"), v.literal("completed"))),
    budget: v.optional(v.number()),
    travelers: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tripId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(tripId, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTrip = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    // Also delete all associated days and entries
    const days = await ctx.db.query("days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    
    for (const day of days) {
      // Delete all entries for this day
      const entries = await ctx.db.query("entries")
        .withIndex("by_day", (q) => q.eq("dayId", day._id))
        .collect();
      
      for (const entry of entries) {
        await ctx.db.delete(entry._id);
      }
      
      // Delete the day
      await ctx.db.delete(day._id);
    }
    
    // Finally delete the trip
    return await ctx.db.delete(args.tripId);
  },
});

// Get trip with all days and entries
export const getTripWithDaysAndEntries = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    const days = await ctx.db.query("days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .collect();

    const daysWithEntries = await Promise.all(
      days.map(async (day) => {
        const entries = await ctx.db.query("entries")
          .withIndex("by_day_order", (q) => q.eq("dayId", day._id))
          .order("asc")
          .collect();
        return { ...day, entries };
      })
    );

    return { ...trip, days: daysWithEntries };
  },
});