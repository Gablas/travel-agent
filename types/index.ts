import type { Id } from "@/convex/_generated/dataModel";

// Trip types
export interface Trip {
  _id: Id<"trips">;
  name: string;
  description?: string;
  status: "planning" | "active" | "completed";
  budget?: number;
  travelers?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TripWithDays extends Trip {
  days: DayWithEntries[];
}

// Day types
export interface Day {
  _id: Id<"days">;
  tripId: Id<"trips">;
  dayNumber: number;
  title?: string;
  description?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DayWithEntries extends Day {
  entries: Entry[];
}

// Entry types
export interface Entry {
  _id: Id<"entries">;
  dayId: Id<"days">;
  name: string;
  description?: string;
  timestamp: string; // "9:00 AM", "2:30 PM"
  googleMapsUrl: string;
  websiteUrl?: string;
  additionalLinks?: string[];
  images?: string[];
  category?: "restaurant" | "hotel" | "attraction" | "museum" | "park" | "shopping" | "nightlife" | "transport" | "activity" | "landmark" | "other";
  duration?: number; // in minutes
  cost?: number;
  order: number;
  status: "planned" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Form types for creating/updating
export interface CreateTripData {
  name: string;
  description?: string;
  budget?: number;
  travelers?: number;
  notes?: string;
}

export interface CreateDayData {
  tripId: Id<"trips">;
  dayNumber: number;
  title?: string;
  description?: string;
  notes?: string;
}

export interface CreateEntryData {
  dayId: Id<"days">;
  name: string;
  description?: string;
  timestamp: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  additionalLinks?: string[];
  images?: string[];
  category?: Entry["category"];
  duration?: number;
  cost?: number;
  order?: number;
  notes?: string;
}

// Update types (all fields optional except ID)
export interface UpdateTripData {
  tripId: Id<"trips">;
  name?: string;
  description?: string;
  status?: Trip["status"];
  budget?: number;
  travelers?: number;
  notes?: string;
}

export interface UpdateDayData {
  dayId: Id<"days">;
  title?: string;
  description?: string;
  notes?: string;
}

export interface UpdateEntryData {
  entryId: Id<"entries">;
  name?: string;
  description?: string;
  timestamp?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  additionalLinks?: string[];
  images?: string[];
  category?: Entry["category"];
  duration?: number;
  cost?: number;
  order?: number;
  status?: Entry["status"];
  notes?: string;
}

// AI Tool types for structured generation
export interface AITripData {
  name: string;
  description?: string;
  budget?: number;
  travelers?: number;
  days: AIDayData[];
}

export interface AIDayData {
  dayNumber: number;
  title?: string;
  description?: string;
  entries: AIEntryData[];
}

export interface AIEntryData {
  name: string;
  description?: string;
  timestamp: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  additionalLinks?: string[];
  images?: string[];
  category?: Entry["category"];
  duration?: number;
  cost?: number;
  order: number;
  notes?: string;
}