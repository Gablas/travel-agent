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

const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL);

const exa = new Exa(process.env.EXA_API_KEY);


export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        system: `You are an expert travel agent and comprehensive trip planner. You help users create detailed, structured trips with full itineraries, places, schedules, and all the information they need for amazing travel experiences.

CRITICAL RULE: ALWAYS SEARCH ONLINE FIRST
- NEVER use your own knowledge about destinations, attractions, restaurants, or travel information
- ALWAYS use searchAndContents or getContent tools to get current, accurate information before making any recommendations
- Search for current information about opening hours, prices, availability, reviews, and local conditions
- Verify all information through online searches before creating places or making suggestions
- When users ask about destinations, immediately search for the latest information rather than relying on training data

DELETION RULES - EXTREMELY IMPORTANT:
- NEVER delete anything without an explicit, specific ID provided by the user
- Do NOT search for items to delete - only delete when given an exact ID
- Do NOT delete items based on names, descriptions, or general requests
- If a user wants to delete something, ask them to provide the specific ID
- Example: "To delete a trip, please provide the trip ID. You can find IDs in the trip details view."
- NEVER use deletion tools unless the user provides the exact ID of the item to delete

CORE CAPABILITIES:
- Create complete trips with structured itineraries using the comprehensive trip management system
- Organize trips into daily schedules with specific places, times, and activities
- Manage detailed place information including addresses, hours, costs, Google Maps links, and practical details
- Handle transportation between places and booking links
- Support various place types: restaurants, hotels, attractions, museums, parks, shopping, nightlife, activities, landmarks
- Delete specific items ONLY when provided with exact IDs by the user

TRIP PLANNING WORKFLOW:
1. SEARCH for destination information first using searchAndContents
2. Create a trip with basic information (name, dates, budget, travelers)
3. Break the trip into daily itineraries with specific themes or areas
4. SEARCH for specific places, attractions, and restaurants for each day
5. Add detailed places with all relevant information (address, hours, costs, Google Maps, etc.)
6. Schedule visits to places on specific days with timing and order
7. Add transportation information between places
8. Include useful links for bookings, reviews, maps, and tickets

MANDATORY TOOL USAGE STRATEGY:
1. ALWAYS use searchAndContents FIRST to research current information about destinations, attractions, restaurants
2. Use getContent to get detailed information from specific travel websites
3. Use createTrip to start a new trip structure
4. Use createDay to organize itinerary by days
5. Use createPlace to add detailed place information with Google Maps integration
6. Use createVisit to schedule places on specific days with timing
7. Use createLink to add booking links, Google Maps links, review links, etc.
8. Use createTransportation for travel between places
9. Use deletion tools ONLY when user provides specific IDs - never search and delete

PLACE CREATION BEST PRACTICES:
- ALWAYS search for current information before creating places
- Include specific address, city, country for each place
- MANDATORY: Every place MUST have a Google Maps URL - this is required, not optional
- Generate Google Maps URLs using format: https://maps.google.com/maps?q=[place_name]+[address]
- Example: https://maps.google.com/maps?q=Eiffel+Tower+Paris+France
- Specify place type (restaurant, hotel, attraction, etc.)
- Include practical details: hours, phone, website, price level, rating
- Add relevant tags for easy searching
- Include opening hours and any special notes
- Verify all information is current through online search

GOOGLE MAPS URL REQUIREMENTS:
- NEVER create a place without a googleMapsUrl
- If you cannot find an exact address, use the place name and city
- Format: https://maps.google.com/maps?q=PLACE+NAME+CITY+COUNTRY
- Replace spaces with + signs in the URL
- This is MANDATORY for every single place you create

RESPONSE STYLE:
- Be enthusiastic and knowledgeable about travel
- Focus on creating structured, actionable itineraries
- Always provide complete information for each place
- Ask follow-up questions to personalize recommendations
- Keep responses conversational while building comprehensive trip data
- Always mention that information is current and researched online
- When users want to delete something, ask for specific IDs rather than searching

COMPREHENSIVE TRIP FOCUS:
- Every travel inquiry should result in a structured trip with detailed daily itineraries
- Each place should have complete information including location, contact, and practical details
- Link everything together: trips contain days, days contain scheduled visits to places
- Include transportation and useful links to make trips actionable

Remember: NEVER provide travel recommendations without first searching online for current information. Always use searchAndContents or getContent tools before creating any places or making suggestions. Build complete, structured trips with detailed daily schedules based on current, searched information. NEVER delete anything without an explicit ID from the user.`,
        model,
        messages,
        maxSteps: 50,
        onError(error) {
            console.error(error);
        },
        experimental_continueSteps: true,
        experimental_repairToolCall: async ({ error }) => {
            return { toolName: "errorWhenCallingToolPleaseTryAgain", args: JSON.stringify({ error: error.message }), toolCallId: crypto.randomUUID(), toolCallType: "function" };
        },
        tools: {
            errorWhenCallingToolPleaseTryAgain: tool({
                description: "Error when calling tool, please try again",
                parameters: z.object({
                    error: z.string(),
                }),
                execute: async ({ error }) => {
                    return `Error when calling tool, please try again: ${error}`;
                },
            }),

            // Simple Trip Management - Single Document Approach
            createTrip: tool({
                description: "Create a new trip with basic information. The trip will start empty and you can add days, places, and details using updateTrip.",
                parameters: z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    startDate: z.string().optional(),
                    endDate: z.string().optional(),
                    budget: z.number().optional(),
                    travelers: z.number().optional(),
                    notes: z.string().optional(),
                }),
                execute: async (args) => {
                    try {
                        const tripId = await convex.mutation(api.tripsSimple.createTrip, args);
                        return `Trip created: ${args.name} (ID: ${tripId})`;
                    } catch (error) {
                        return `Error creating trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            getTrips: tool({
                description: "Get all trips from the database",
                parameters: z.object({}),
                execute: async () => {
                    try {
                        const trips = await convex.query(api.tripsSimple.getTrips);
                        return trips;
                    } catch (error) {
                        return `Error fetching trips: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            getTrip: tool({
                description: "Get a specific trip with all its details, days, places, visits, and links",
                parameters: z.object({
                    tripId: z.string(),
                }),
                execute: async ({ tripId }) => {
                    try {
                        const trip = await convex.query(api.tripsSimple.getTrip, {
                            tripId: tripId as Id<"trips">,
                        });
                        return trip;
                    } catch (error) {
                        return `Error fetching trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                },
            }),

            updateTrip: tool({
                description: "Update an entire trip with complete data including days, places, visits, transportation, and links. This replaces the entire trip content.",
                parameters: z.object({
                    tripId: z.string(),
                    trip: z.object({
                        name: z.string(),
                        description: z.string().optional(),
                        startDate: z.string().optional(),
                        endDate: z.string().optional(),
                        status: z.enum(["planning", "active", "completed"]),
                        budget: z.number().optional(),
                        travelers: z.number().optional(),
                        notes: z.string().optional(),
                        days: z.array(z.object({
                            date: z.string(),
                            dayNumber: z.number(),
                            title: z.string().optional(),
                            description: z.string().optional(),
                            notes: z.string().optional(),
                            visits: z.array(z.object({
                                place: z.object({
                                    name: z.string(),
                                    description: z.string().optional(),
                                    address: z.string().optional(),
                                    city: z.string().optional(),
                                    country: z.string().optional(),
                                    latitude: z.number().optional(),
                                    longitude: z.number().optional(),
                                    placeType: z.enum(["restaurant", "hotel", "attraction", "museum", "park", "shopping", "nightlife", "transport", "activity", "landmark", "other"]),
                                    priceLevel: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
                                    rating: z.number().optional(),
                                    openingHours: z.string().optional(),
                                    phone: z.string().optional(),
                                    website: z.string().optional(),
                                    googleMapsUrl: z.string().describe("REQUIRED: Google Maps URL for the place. Format: https://maps.google.com/maps?q=PLACE+NAME+CITY"),
                                    googlePlaceId: z.string().optional(),
                                    images: z.array(z.string()).optional(),
                                    tags: z.array(z.string()).optional(),
                                    notes: z.string().optional(),
                                }),
                                startTime: z.string().optional(),
                                endTime: z.string().optional(),
                                duration: z.number().optional(),
                                order: z.number(),
                                status: z.enum(["planned", "confirmed", "cancelled", "completed"]),
                                notes: z.string().optional(),
                                estimatedCost: z.number().optional(),
                                actualCost: z.number().optional(),
                            })),
                            transportation: z.array(z.object({
                                type: z.enum(["walk", "taxi", "uber", "public_transport", "car", "bike", "flight", "train", "bus", "other"]),
                                duration: z.number().optional(),
                                distance: z.number().optional(),
                                cost: z.number().optional(),
                                notes: z.string().optional(),
                                bookingUrl: z.string().optional(),
                                fromPlace: z.string().optional(),
                                toPlace: z.string().optional(),
                            })),
                        })),
                        links: z.array(z.object({
                            title: z.string(),
                            url: z.string(),
                            type: z.enum(["booking", "info", "map", "review", "ticket", "transport", "other"]),
                            description: z.string().optional(),
                        })),
                    }),
                }),
                execute: async ({ tripId, trip }) => {
                    try {
                        // Validate that all places have Google Maps URLs
                        for (const day of trip.days) {
                            for (const visit of day.visits) {
                                if (!visit.place.googleMapsUrl || visit.place.googleMapsUrl.trim() === '') {
                                    return `Error: Place "${visit.place.name}" is missing a required Google Maps URL. Please add a Google Maps URL for every place.`;
                                }
                                if (!visit.place.googleMapsUrl.includes('maps.google.com')) {
                                    return `Error: Invalid Google Maps URL for "${visit.place.name}". Please use format: https://maps.google.com/maps?q=PLACE+NAME+CITY`;
                                }
                            }
                        }

                        await convex.mutation(api.tripsSimple.updateTrip, {
                            tripId: tripId as Id<"trips">,
                            trip,
                        });
                        return `Trip updated successfully: ${trip.name} (ID: ${tripId})`;
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
                        await convex.mutation(api.tripsSimple.deleteTrip, {
                            tripId: tripId as Id<"trips">,
                        });
                        return `Trip deleted successfully (ID: ${tripId})`;
                    } catch (error) {
                        return `Error deleting trip: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
                            text: true,
                            context: true,
                        });
                        return results.context;
                    } catch (error) {
                        return `Error searching web: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
                        return `Error fetching content: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
