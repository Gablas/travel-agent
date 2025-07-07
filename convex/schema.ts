import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Simplified trips table with basic information
  trips: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("planning"), v.literal("active"), v.literal("completed")),
    budget: v.optional(v.number()),
    travelers: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Days table linked to trips
  days: defineTable({
    tripId: v.id("trips"), // Foreign key to trips
    dayNumber: v.number(), // Day 1, Day 2, Day 3, etc.
    title: v.optional(v.string()), // Optional day title like "Exploring Downtown"
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]).index("by_trip_day", ["tripId", "dayNumber"]),

  // Entries table linked to days - rich activity data
  entries: defineTable({
    dayId: v.id("days"), // Foreign key to days
    name: v.string(), // Activity name: "Visit the City Museum"
    description: v.optional(v.string()), // Detailed description
    timestamp: v.string(), // Time of day: "9:00 AM", "2:30 PM"
    googleMapsUrl: v.string(), // Required Google Maps link
    websiteUrl: v.optional(v.string()), // Official website
    additionalLinks: v.optional(v.array(v.string())), // Other relevant URLs
    images: v.optional(v.array(v.string())), // Image URLs
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
    duration: v.optional(v.number()), // Estimated time in minutes
    cost: v.optional(v.number()), // Estimated cost
    order: v.number(), // Order within the day
    status: v.union(v.literal("planned"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_day", ["dayId"]).index("by_day_order", ["dayId", "order"]),
});