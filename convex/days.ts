import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Day CRUD operations
export const createDay = mutation({
  args: {
    tripId: v.id("trips"),
    dayNumber: v.number(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("days", {
      tripId: args.tripId,
      dayNumber: args.dayNumber,
      title: args.title,
      description: args.description,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getDaysByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.query("days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .collect();
  },
});

export const getDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.dayId);
  },
});

export const getDayWithEntries = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    const day = await ctx.db.get(args.dayId);
    if (!day) return null;

    const entries = await ctx.db.query("entries")
      .withIndex("by_day_order", (q) => q.eq("dayId", args.dayId))
      .order("asc")
      .collect();

    return { ...day, entries };
  },
});

export const updateDay = mutation({
  args: {
    dayId: v.id("days"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { dayId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(dayId, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

export const deleteDay = mutation({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    // Delete all entries for this day
    const entries = await ctx.db.query("entries")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete the day
    return await ctx.db.delete(args.dayId);
  },
});

// Get or create day by trip and day number
export const getOrCreateDay = mutation({
  args: {
    tripId: v.id("trips"),
    dayNumber: v.number(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing day
    const existingDay = await ctx.db.query("days")
      .withIndex("by_trip_day", (q) => q.eq("tripId", args.tripId).eq("dayNumber", args.dayNumber))
      .first();
    
    if (existingDay) {
      return existingDay._id;
    }
    
    // Create new day if it doesn't exist
    const now = Date.now();
    return await ctx.db.insert("days", {
      tripId: args.tripId,
      dayNumber: args.dayNumber,
      title: args.title || `Day ${args.dayNumber}`,
      description: undefined,
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});