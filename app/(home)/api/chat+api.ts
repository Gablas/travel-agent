import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, tool } from "ai";
import { ConvexHttpClient } from "convex/browser";
import Exa from "exa-js";
import { z } from "zod";

const openrouter = createOpenRouter({
    baseURL: "https://openrouter.helicone.ai/api/v1",
    headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    }
});
const model = openrouter.chat("google/gemini-2.5-flash", {
    reasoning: {
        effort: "high",
        exclude: false,
    },
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const exa = new Exa(process.env.EXA_API_KEY);
export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        system: `You are an expert travel agent and comprehensive trip planner. You help users create detailed, structured trips with full itineraries, activities, schedules, and all the information they need for amazing travel experiences.

CRITICAL RULE: COMPREHENSIVE RESEARCH STRATEGY
- NEVER use your own knowledge about destinations, attractions, restaurants, or travel information
- ALWAYS do multiple focused searches (minimum 5) to fully understand a destination
- Break down research into specific areas instead of broad searches
- Example: Instead of "7 day Singapore itinerary for couples", do separate searches for:
  1. "Singapore must-see attractions and landmarks"
  2. "Best restaurants and food courts in Singapore"
  3. "Singapore neighborhoods and districts to explore"
  4. "Singapore cultural experiences and activities"
  5. "Singapore transportation and getting around"
  6. "Singapore shopping and markets"
  7. "Singapore nightlife and entertainment"
- Search for current information about opening hours, prices, availability, reviews, and local conditions
- Verify all information through multiple focused online searches before creating activities or making suggestions

RESTAURANT RESEARCH REQUIREMENTS - CRITICAL:
- NEVER create generic restaurant entries like "Go to a restaurant in [location]" or "Find a local restaurant"
- ALWAYS search for specific restaurant names with exact addresses
- Every restaurant entry MUST include:
  * Exact restaurant name (e.g., "Joe's Pizza", "The French Laundry", "Tsukiji Sushi Dai")
  * Full address and location details
  * Current operating hours and contact information
  * Menu highlights, price range, and specialties
  * Recent reviews and current status (open/closed, reservations required, etc.)
- Use focused searches like "best pizza restaurants in Manhattan with addresses" or "top rated sushi restaurants in Tokyo 2024"
- Research multiple specific options and choose the most highly recommended ones
- Verify each restaurant is currently operating and get exact location details
- NEVER create restaurant entries without first searching for specific establishments

DATA MODEL UNDERSTANDING:
- Trips contain basic information (name, description, status, budget, travelers)
- Days are linked to trips with day numbers (Day 1, Day 2, Day 3, etc.)
- Entries are individual activities linked to days with rich information:
  * name: Activity name (e.g., "Visit the City Museum")
  * description: Detailed description of the activity
  * timestamp: Time of day (e.g., "9:00 AM", "2:30 PM")
  * googleMapsUrl: REQUIRED Google Maps link
  * websiteUrl: Optional official website
  * additionalLinks: Array of other relevant URLs
  * images: Array of image URLs
  * category: Type of activity (restaurant, attraction, transport, etc.)
  * duration: Estimated time needed in minutes
  * cost: Estimated cost

ID MANAGEMENT RULES - EXTREMELY IMPORTANT:
- NEVER ask users for IDs - users should never interact with IDs directly
- ALWAYS use getTrips tool to find trips by name when users reference them
- When users mention a trip by name (e.g., "Singapore trip", "my Paris vacation"), automatically search for it using getTrips
- If multiple trips match, pick the most recent one or ask for clarification using trip names/dates, not IDs
- For deletions: NEVER delete anything without explicit user confirmation, but find the trip by name first
- Example: When user says "continue planning my Singapore trip", use getTrips to find the Singapore trip automatically
- NEVER expose IDs to users in responses - always refer to trips by name and dates

CORE CAPABILITIES:
- Create trips with structured itineraries using the simplified trip management system
- Organize trips into daily schedules (Day 1, Day 2, etc.) with specific activities and timing
- Manage detailed activity information including addresses, hours, costs, Google Maps links, and practical details
- Support various activity types: restaurants, hotels, attractions, museums, parks, shopping, nightlife, activities, landmarks
- Create rich entries with images, links, and comprehensive information

TRIP PLANNING WORKFLOW:
1. When users reference existing trips, ALWAYS use getTrips first to find the trip by name
2. RESEARCH PHASE: Do multiple focused searches (minimum 5) to understand the destination
3. Create a trip with basic information OR update existing trip found via getTrips
4. Create days for the trip (Day 1, Day 2, etc.) with themes or areas based on research
5. SEARCH for specific places, attractions, and restaurants for each day
6. Create detailed entries for each activity with all relevant information
7. Use proper timing and ordering for activities throughout each day

ENTRY DELETION WORKFLOW:
1. When users request to remove activities, ALWAYS search first using appropriate find tools
2. Show the user what entries will be deleted before confirming
3. Use specific language: "I found these entries matching your request: [list entries]"
4. Wait for user confirmation before proceeding with deletion
5. After deletion, confirm success: "Successfully removed [activity name] from [day/trip]"
6. UI will automatically update to reflect changes

TRIP FINDING WORKFLOW:
- When user mentions a trip by name, immediately use getTrips to search for it
- Look for trips with matching names (case-insensitive, partial matches okay)
- If found, use that trip's ID internally (never show ID to user)
- If multiple matches, pick the most recent or ask for clarification using trip names/dates
- If no matches found, offer to create a new trip with that name

MANDATORY TOOL USAGE STRATEGY:
1. ALWAYS use searchAndContents with multiple focused searches (minimum 5) to research destinations comprehensively
2. Use getContent to get detailed information from specific travel websites discovered in searches
3. Use createTrip to start a new trip structure OR getTrips to find existing trips by name
4. Use createDay or getOrCreateDay to create day structures
5. Use createEntry or createMultipleEntries to add detailed activities to days
6. For entry management: use findEntriesByName, findEntriesByCategory, or findEntriesByDay before any deletions
7. Use deleteEntry, deleteMultipleEntries, or clearDay for removing activities
8. NEVER do broad searches - always break down into specific categories

SEARCH STRATEGY EXAMPLES:
- Instead of: "Tokyo 5 day itinerary"
- Do: "Tokyo must-see temples and shrines", "Tokyo best ramen shops with addresses", "Tokyo shopping districts", "Tokyo day trips from city center", "Tokyo transportation JR Pass"

RESTAURANT SEARCH EXAMPLES:
- Instead of: "good restaurants in Paris"
- Do: "best bistros in Paris Marais district 2024", "top rated French restaurants in Saint-Germain with reservations", "Michelin star restaurants in Paris with addresses and prices"
- Instead of: "places to eat in New York"
- Do: "best pizza restaurants in Manhattan with addresses", "top rated steakhouses in NYC 2024", "famous delis in Lower East Side with current hours"

ENTRY CREATION BEST PRACTICES:
- ALWAYS search for current information before creating entries
- MANDATORY: Every entry MUST have a Google Maps URL - this is required, not optional
- Generate Google Maps URLs using format: https://maps.google.com/maps?q=[place_name]+[address]
- Example: https://maps.google.com/maps?q=Eiffel+Tower+Paris+France
- Include practical details: timing, website, additional links, images
- Add relevant category for easy organization
- Include duration and cost estimates when possible
- Verify all information is current through online search
- ENTRY ORDERING: The order parameter is optional - if not provided, entries will be automatically ordered sequentially within each day (1, 2, 3, etc.)

ENTRY MANAGEMENT AND DELETION:
- Users can request to remove, delete, or cancel activities using natural language
- ALWAYS use search tools first to find entries before deletion
- Common user phrases: "remove the museum visit", "delete lunch at that restaurant", "cancel the shopping trip"
- Use findEntriesByName for specific activity names (supports partial matching)
- Use findEntriesByCategory to find all entries of a type (e.g., all restaurants)
- Use findEntriesByDay to see all activities for a specific day
- NEVER delete entries without first showing what will be deleted
- Confirm deletions by showing entry details before executing
- Use deleteEntry for single entries, deleteMultipleEntries for bulk operations
- Use clearDay to remove all activities from a specific day

GOOGLE MAPS URL REQUIREMENTS:
- NEVER create an entry without a googleMapsUrl
- If you cannot find an exact address, use the place name and city
- Format: https://maps.google.com/maps?q=PLACE+NAME+CITY+COUNTRY
- Replace spaces with + signs in the URL
- This is MANDATORY for every single entry you create

RESPONSE STYLE - CRITICAL CONCISENESS RULES:
- NEVER repeat itinerary details that are visible in the UI
- NEVER list activities you've created - users can see them in the interface
- NEVER describe what you're adding step-by-step - just do it
- Keep responses under 50 words when possible
- Focus only on key insights, recommendations, or questions
- Only mention completion status briefly: "Added Day 1 activities for downtown Singapore"
- Ask follow-up questions to personalize further
- Be enthusiastic but extremely brief
- Don't explain your research process - just use the results

COMPREHENSIVE TRIP FOCUS:
- Every travel inquiry should result in a structured trip with detailed daily activities
- Each entry should have complete information including location, contact, and practical details
- Link everything together: trips contain days, days contain scheduled entries
- Include timing and useful links to make trips actionable

Remember: NEVER provide travel recommendations without first searching online for current information. Always use searchAndContents or getContent tools before creating any entries or making suggestions. Build complete, structured trips with detailed daily schedules based on current, searched information. Use day numbers (Day 1, Day 2, etc.) instead of dates.`,
        model,
        messages,
        maxSteps: 50,
        onError(error) {
            console.error(error);
        },
        experimental_continueSteps: true,
        // Ensure proper message ID generation
        experimental_generateMessageId: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tools: {
            // Trip Management
            createTrip: tool({
                description: "Create a new trip with basic information. Start with trip basics, then add days and entries.",
                parameters: z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    budget: z.number().optional(),
                    travelers: z.number().optional(),
                    notes: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        const tripId = await convex.mutation(api.trips.createTrip, args);
                        return `Trip created: ${args.name} (ID: ${tripId})`;
                    } catch (error) {
                        return `Error creating trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            getTrips: tool({
                description: "Get all trips from the database to find trips by name",
                parameters: z.object({}),
                execute: async () => {
                    try {
                        const trips = await convex.query(api.trips.getTrips);
                        return trips;
                    } catch (error) {
                        return `Error fetching trips: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            getTrip: tool({
                description: "Get a specific trip with all its days and entries",
                parameters: z.object({
                    tripId: z.string(),
                }),
                execute: async ({ tripId }) => {
                    try {
                        const trip = await convex.query(api.trips.getTripWithDaysAndEntries, {
                            tripId: tripId as Id<"trips">,
                        });
                        return trip;
                    } catch (error) {
                        return `Error fetching trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            updateTrip: tool({
                description: "Update basic trip information (name, description, status, budget, travelers, notes)",
                parameters: z.object({
                    tripId: z.string(),
                    name: z.string().optional(),
                    description: z.string().optional(),
                    status: z.enum(["planning", "active", "completed"]).optional(),
                    budget: z.number().optional(),
                    travelers: z.number().optional(),
                    notes: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        const { tripId, ...updates } = args;
                        await convex.mutation(api.trips.updateTrip, {
                            tripId: tripId as Id<"trips">,
                            ...updates,
                        });
                        return "Trip updated successfully";
                    } catch (error) {
                        return `Error updating trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            deleteTrip: tool({
                description: "Delete an entire trip. REQUIRES exact trip ID provided by user.",
                parameters: z.object({
                    tripId: z.string().describe("The exact trip ID to delete. Must be provided by the user."),
                }),
                execute: async ({ tripId }) => {
                    if (!tripId || tripId.trim() === '') {
                        return "Error: Trip ID is required. Please provide the specific trip ID you want to delete.";
                    }
                    try {
                        await convex.mutation(api.trips.deleteTrip, {
                            tripId: tripId as Id<"trips">,
                        });
                        return `Trip deleted successfully (ID: ${tripId})`;
                    } catch (error) {
                        return `Error deleting trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            // Day Management
            createDay: tool({
                description: "Create a new day for a trip with a specific day number (1, 2, 3, etc.)",
                parameters: z.object({
                    tripId: z.string(),
                    dayNumber: z.number(),
                    title: z.string().optional(),
                    description: z.string().optional(),
                    notes: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        const dayId = await convex.mutation(api.days.createDay, {
                            tripId: args.tripId as Id<"trips">,
                            dayNumber: args.dayNumber,
                            title: args.title,
                            description: args.description,
                            notes: args.notes,
                        });
                        return JSON.stringify({
                            message: `Day ${args.dayNumber} created`,
                            type: 'day_created',
                            dayId: dayId,
                            dayNumber: args.dayNumber,
                            tripId: args.tripId
                        });
                    } catch (error) {
                        return `Error creating day: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            getOrCreateDay: tool({
                description: "Get an existing day or create it if it doesn't exist. Use this to ensure a day exists before adding entries.",
                parameters: z.object({
                    tripId: z.string(),
                    dayNumber: z.number(),
                    title: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        const dayId = await convex.mutation(api.days.getOrCreateDay, {
                            tripId: args.tripId as Id<"trips">,
                            dayNumber: args.dayNumber,
                            title: args.title,
                        });
                        return JSON.stringify({
                            message: `Day ${args.dayNumber} ready`,
                            type: 'day_ready',
                            dayId: dayId,
                            dayNumber: args.dayNumber,
                            tripId: args.tripId
                        });
                    } catch (error) {
                        return `Error getting/creating day: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            // Entry Management
            createEntry: tool({
                description: "Create a detailed activity entry for a specific day. REQUIRES Google Maps URL.",
                parameters: z.object({
                    dayId: z.string(),
                    name: z.string().describe("Activity name like 'Visit the City Museum'"),
                    description: z.string().optional(),
                    timestamp: z.string().describe("Time of day like '9:00 AM' or '2:30 PM'"),
                    googleMapsUrl: z.string().describe("REQUIRED: Google Maps URL. Format: https://maps.google.com/maps?q=PLACE+NAME+CITY"),
                    websiteUrl: z.string().optional(),
                    additionalLinks: z.array(z.string()).optional(),
                    images: z.array(z.string()).optional(),
                    category: z.enum(["restaurant", "hotel", "attraction", "museum", "park", "shopping", "nightlife", "transport", "activity", "landmark", "other"]).optional(),
                    duration: z.number().optional().describe("Duration in minutes"),
                    cost: z.number().optional(),
                    order: z.number().optional().describe("Order of the entry in the day. 1 is first, 2 is second, etc. If not provided, will be automatically calculated."),
                    notes: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        // Validate Google Maps URL
                        if (!args.googleMapsUrl || !args.googleMapsUrl.includes('maps.google.com')) {
                            return `Error: Invalid Google Maps URL for "${args.name}". Please use format: https://maps.google.com/maps?q=PLACE+NAME+CITY`;
                        }

                        const entryId = await convex.mutation(api.entries.createEntry, {
                            dayId: args.dayId as Id<"days">,
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
                            order: args.order,
                            notes: args.notes,
                        });
                        return JSON.stringify({
                            message: `Entry created: ${args.name} at ${args.timestamp}`,
                            type: 'entry_created',
                            entryId: entryId,
                            entryName: args.name
                        });
                    } catch (error) {
                        return `Error creating entry: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),
            // Entry Search and Deletion Tools
            findEntriesByName: tool({
                description: "Find entries within a trip by name. Use this to locate entries before deleting them.",
                parameters: z.object({
                    tripId: z.string(),
                    entryName: z.string().describe("Name or partial name of the activity to find"),
                    exactMatch: z.boolean().optional().describe("Whether to match exactly or allow partial matches"),
                }),
                execute: async (args) => {
                    try {
                        const entries = await convex.query(api.entries.findEntriesByName, {
                            tripId: args.tripId as Id<"trips">,
                            entryName: args.entryName,
                            exactMatch: args.exactMatch,
                        });
                        return entries;
                    } catch (error) {
                        return `Error finding entries: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            findEntriesByCategory: tool({
                description: "Find all entries of a specific category within a trip (e.g., all restaurants, all museums).",
                parameters: z.object({
                    tripId: z.string(),
                    category: z.enum(["restaurant", "hotel", "attraction", "museum", "park", "shopping", "nightlife", "transport", "activity", "landmark", "other"]),
                }),
                execute: async (args) => {
                    try {
                        const entries = await convex.query(api.entries.findEntriesByCategory, {
                            tripId: args.tripId as Id<"trips">,
                            category: args.category,
                        });
                        return entries;
                    } catch (error) {
                        return `Error finding entries by category: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            findEntriesByDay: tool({
                description: "Find all entries for a specific day within a trip.",
                parameters: z.object({
                    tripId: z.string(),
                    dayNumber: z.number().describe("Day number (1, 2, 3, etc.)"),
                }),
                execute: async (args) => {
                    try {
                        const entries = await convex.query(api.entries.findEntriesByDay, {
                            tripId: args.tripId as Id<"trips">,
                            dayNumber: args.dayNumber,
                        });
                        return entries;
                    } catch (error) {
                        return `Error finding entries by day: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            deleteEntry: tool({
                description: "Delete a specific entry by its ID. Always use search tools first to find the entry ID.",
                parameters: z.object({
                    entryId: z.string().describe("The exact entry ID to delete"),
                }),
                execute: async (args) => {
                    try {
                        await convex.mutation(api.entries.deleteEntry, {
                            entryId: args.entryId as Id<"entries">,
                        });
                        return "Entry deleted successfully";
                    } catch (error) {
                        return `Error deleting entry: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            deleteMultipleEntries: tool({
                description: "Delete multiple entries at once by their IDs. Use search tools first to find the entry IDs.",
                parameters: z.object({
                    entryIds: z.array(z.string()).describe("Array of entry IDs to delete"),
                }),
                execute: async (args) => {
                    try {
                        await convex.mutation(api.entries.deleteMultipleEntries, {
                            entryIds: args.entryIds as Id<"entries">[],
                        });
                        return `${args.entryIds.length} entries deleted successfully`;
                    } catch (error) {
                        return `Error deleting entries: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            clearDay: tool({
                description: "Remove all entries from a specific day. Use findEntriesByDay first to show what will be deleted.",
                parameters: z.object({
                    tripId: z.string(),
                    dayNumber: z.number().describe("Day number to clear (1, 2, 3, etc.)"),
                }),
                execute: async (args) => {
                    try {
                        // First find the day
                        const day = await convex.query(api.days.getDaysByTrip, {
                            tripId: args.tripId as Id<"trips">,
                        });

                        const targetDay = day.find(d => d.dayNumber === args.dayNumber);
                        if (!targetDay) {
                            return `Day ${args.dayNumber} not found in this trip`;
                        }

                        await convex.mutation(api.entries.clearDay, {
                            dayId: targetDay._id,
                        });
                        return `All entries cleared from Day ${args.dayNumber}`;
                    } catch (error) {
                        return `Error clearing day: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            // Web search tools
            searchAndContents: tool({
                description:
                    "Search the web for current travel information including attractions, restaurants, events, opening hours, prices, and local tips",
                parameters: z.object({
                    query: z.string(),
                }),
                execute: async ({ query }) => {
                    try {
                        const results = await exa.searchAndContents(query, {
                            context: true,
                            numResults: 5
                        });
                        return results.context;
                    } catch (error) {
                        return `Error searching web: ${error instanceof Error ? error.message : "Unknown error"}`;
                    }
                },
            }),

            getContent: tool({
                description:
                    "Get detailed content from specific travel websites, official tourism pages, or trusted travel resources",
                parameters: z.object({
                    url: z.string(),
                }),
                execute: async ({ url }) => {
                    try {
                        const content = await exa.getContents(url, {
                            text: true,
                            context: true,
                        });
                        return content.context;
                    } catch (error) {
                        return `Error fetching content: ${error instanceof Error ? error.message : "Unknown error"}`;
                    }
                },
            }),
        },
    });

    return result.toDataStreamResponse({
        sendReasoning: true,
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "none",
        },
    });
}