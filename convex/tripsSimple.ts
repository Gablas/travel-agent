import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple trip CRUD operations with single document approach

export const createTrip = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
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
        trip: v.object({
            name: v.string(),
            description: v.optional(v.string()),
            startDate: v.optional(v.string()),
            endDate: v.optional(v.string()),
            status: v.union(v.literal("planning"), v.literal("active"), v.literal("completed")),
            budget: v.optional(v.number()),
            travelers: v.optional(v.number()),
            notes: v.optional(v.string()),
            days: v.array(v.object({
                date: v.string(),
                dayNumber: v.number(),
                title: v.optional(v.string()),
                description: v.optional(v.string()),
                notes: v.optional(v.string()),
                visits: v.array(v.object({
                    place: v.object({
                        name: v.string(),
                        description: v.optional(v.string()),
                        address: v.optional(v.string()),
                        city: v.optional(v.string()),
                        country: v.optional(v.string()),
                        latitude: v.optional(v.number()),
                        longitude: v.optional(v.number()),
                        placeType: v.union(
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
                        priceLevel: v.optional(v.union(v.literal("$"), v.literal("$$"), v.literal("$$$"), v.literal("$$$$"))),
                        rating: v.optional(v.number()),
                        openingHours: v.optional(v.string()),
                        phone: v.optional(v.string()),
                        website: v.optional(v.string()),
                        googleMapsUrl: v.string(),
                        googlePlaceId: v.optional(v.string()),
                        images: v.optional(v.array(v.string())),
                        tags: v.optional(v.array(v.string())),
                        notes: v.optional(v.string()),
                    }),
                    startTime: v.optional(v.string()),
                    endTime: v.optional(v.string()),
                    duration: v.optional(v.number()),
                    order: v.number(),
                    status: v.union(v.literal("planned"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
                    notes: v.optional(v.string()),
                    estimatedCost: v.optional(v.number()),
                    actualCost: v.optional(v.number()),
                })),
                transportation: v.array(v.object({
                    type: v.union(
                        v.literal("walk"),
                        v.literal("taxi"),
                        v.literal("uber"),
                        v.literal("public_transport"),
                        v.literal("car"),
                        v.literal("bike"),
                        v.literal("flight"),
                        v.literal("train"),
                        v.literal("bus"),
                        v.literal("other")
                    ),
                    duration: v.optional(v.number()),
                    distance: v.optional(v.number()),
                    cost: v.optional(v.number()),
                    notes: v.optional(v.string()),
                    bookingUrl: v.optional(v.string()),
                    fromPlace: v.optional(v.string()),
                    toPlace: v.optional(v.string()),
                })),
            })),
            links: v.array(v.object({
                title: v.string(),
                url: v.string(),
                type: v.union(
                    v.literal("booking"),
                    v.literal("info"),
                    v.literal("map"),
                    v.literal("review"),
                    v.literal("ticket"),
                    v.literal("transport"),
                    v.literal("other")
                ),
                description: v.optional(v.string()),
            })),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.tripId, {
            ...args.trip,
            updatedAt: Date.now(),
        });
    },
});

export const deleteTrip = mutation({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.tripId);
    },
});