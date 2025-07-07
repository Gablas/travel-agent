import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Entry CRUD operations
export const createEntry = mutation({
  args: {
    dayId: v.id("days"),
    name: v.string(),
    description: v.optional(v.string()),
    timestamp: v.string(),
    googleMapsUrl: v.string(),
    websiteUrl: v.optional(v.string()),
    additionalLinks: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.union(
      v.literal("restaurant"),
      v.literal("hotel"),
      v.literal("attraction"),
      v.literal("museum"),
      v.literal("park"),
      v.literal("shopping"),
      v.literal("nightlife"),
      v.literal("transport"),
      v.literal("activity"),
      v.literal("landmark"),
      v.literal("other")
    )),
    duration: v.optional(v.number()),
    cost: v.optional(v.number()),
    order: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If no order specified, get the next order number for this day
    let order = args.order;
    if (order === undefined) {
      const lastEntry = await ctx.db.query("entries")
        .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
        .order("desc")
        .first();
      order = lastEntry ? lastEntry.order + 1 : 1;
    }

    const now = Date.now();
    return await ctx.db.insert("entries", {
      dayId: args.dayId,
      name: args.name,
      description: args.description,
      timestamp: args.timestamp,
      googleMapsUrl: args.googleMapsUrl,
      websiteUrl: args.websiteUrl,
      additionalLinks: args.additionalLinks,
      images: args.images,
      category: args.category,
      duration: args.duration,
      cost: args.cost,
      order: order,
      status: "planned",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getEntriesByDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db.query("entries")
      .withIndex("by_day_order", (q) => q.eq("dayId", args.dayId))
      .order("asc")
      .collect();
  },
});

export const getEntry = query({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.entryId);
  },
});

export const updateEntry = mutation({
  args: {
    entryId: v.id("entries"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    timestamp: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    additionalLinks: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.union(
      v.literal("restaurant"),
      v.literal("hotel"),
      v.literal("attraction"),
      v.literal("museum"),
      v.literal("park"),
      v.literal("shopping"),
      v.literal("nightlife"),
      v.literal("transport"),
      v.literal("activity"),
      v.literal("landmark"),
      v.literal("other")
    )),
    duration: v.optional(v.number()),
    cost: v.optional(v.number()),
    order: v.optional(v.number()),
    status: v.optional(v.union(v.literal("planned"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { entryId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(entryId, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEntry = mutation({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.entryId);
  },
});

export const reorderEntries = mutation({
  args: {
    entryUpdates: v.array(v.object({
      entryId: v.id("entries"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const promises = args.entryUpdates.map(({ entryId, order }) =>
      ctx.db.patch(entryId, { 
        order,
        updatedAt: Date.now(),
      })
    );
    
    return await Promise.all(promises);
  },
});

// Delete multiple entries by ID
export const deleteMultipleEntries = mutation({
  args: {
    entryIds: v.array(v.id("entries")),
  },
  handler: async (ctx, args) => {
    const promises = args.entryIds.map((entryId) =>
      ctx.db.delete(entryId)
    );
    
    return await Promise.all(promises);
  },
});

// Clear all entries from a day
export const clearDay = mutation({
  args: {
    dayId: v.id("days"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db.query("entries")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    
    const promises = entries.map((entry) => ctx.db.delete(entry._id));
    
    return await Promise.all(promises);
  },
});

// Find entries by name within a trip (for AI to locate entries to delete)
export const findEntriesByName = query({
  args: {
    tripId: v.id("trips"),
    entryName: v.string(),
    exactMatch: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // First get all days for this trip
    const days = await ctx.db.query("days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    
    const dayIds = days.map(day => day._id);
    
    // Get all entries for these days
    const allEntries = await Promise.all(
      dayIds.map(dayId =>
        ctx.db.query("entries")
          .withIndex("by_day", (q) => q.eq("dayId", dayId))
          .collect()
      )
    );
    
    const flatEntries = allEntries.flat();
    
    // Filter by name (case-insensitive)
    const searchName = args.entryName.toLowerCase();
    const matchingEntries = flatEntries.filter(entry => {
      const entryName = entry.name.toLowerCase();
      return args.exactMatch 
        ? entryName === searchName
        : entryName.includes(searchName);
    });
    
    // Include day information for context
    const entriesWithDayInfo = await Promise.all(
      matchingEntries.map(async (entry) => {
        const day = await ctx.db.get(entry.dayId);
        return {
          ...entry,
          dayNumber: day?.dayNumber,
          dayTitle: day?.title,
        };
      })
    );
    
    return entriesWithDayInfo;
  },
});

// Find entries by category within a trip
export const findEntriesByCategory = query({
  args: {
    tripId: v.id("trips"),
    category: v.union(
      v.literal("restaurant"),
      v.literal("hotel"),
      v.literal("attraction"),
      v.literal("museum"),
      v.literal("park"),
      v.literal("shopping"),
      v.literal("nightlife"),
      v.literal("transport"),
      v.literal("activity"),
      v.literal("landmark"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    // First get all days for this trip
    const days = await ctx.db.query("days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    
    const dayIds = days.map(day => day._id);
    
    // Get all entries for these days
    const allEntries = await Promise.all(
      dayIds.map(dayId =>
        ctx.db.query("entries")
          .withIndex("by_day", (q) => q.eq("dayId", dayId))
          .collect()
      )
    );
    
    const flatEntries = allEntries.flat();
    
    // Filter by category
    const matchingEntries = flatEntries.filter(entry => 
      entry.category === args.category
    );
    
    // Include day information for context
    const entriesWithDayInfo = await Promise.all(
      matchingEntries.map(async (entry) => {
        const day = await ctx.db.get(entry.dayId);
        return {
          ...entry,
          dayNumber: day?.dayNumber,
          dayTitle: day?.title,
        };
      })
    );
    
    return entriesWithDayInfo;
  },
});

// Find entries by day number within a trip
export const findEntriesByDay = query({
  args: {
    tripId: v.id("trips"),
    dayNumber: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the day by trip and day number
    const day = await ctx.db.query("days")
      .withIndex("by_trip_day", (q) => q.eq("tripId", args.tripId).eq("dayNumber", args.dayNumber))
      .first();
    
    if (!day) {
      return [];
    }
    
    // Get all entries for this day
    const entries = await ctx.db.query("entries")
      .withIndex("by_day_order", (q) => q.eq("dayId", day._id))
      .order("asc")
      .collect();
    
    return entries.map(entry => ({
      ...entry,
      dayNumber: day.dayNumber,
      dayTitle: day.title,
    }));
  },
});

// Bulk create entries (useful for AI generation)
export const createMultipleEntries = mutation({
  args: {
    entries: v.array(v.object({
      dayId: v.id("days"),
      name: v.string(),
      description: v.optional(v.string()),
      timestamp: v.string(),
      googleMapsUrl: v.string(),
      websiteUrl: v.optional(v.string()),
      additionalLinks: v.optional(v.array(v.string())),
      images: v.optional(v.array(v.string())),
      category: v.optional(v.union(
        v.literal("restaurant"),
        v.literal("hotel"),
        v.literal("attraction"),
        v.literal("museum"),
        v.literal("park"),
        v.literal("shopping"),
        v.literal("nightlife"),
        v.literal("transport"),
        v.literal("activity"),
        v.literal("landmark"),
        v.literal("other")
      )),
      duration: v.optional(v.number()),
      cost: v.optional(v.number()),
      order: v.number(),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const promises = args.entries.map((entry) =>
      ctx.db.insert("entries", {
        ...entry,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      })
    );
    
    return await Promise.all(promises);
  },
});