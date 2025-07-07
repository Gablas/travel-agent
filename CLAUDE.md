# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Code quality and validation
- `pnpm run lint` - Run ESLint for code quality checks
- `pnpm exec tsc --noEmit` - Run TypeScript type checking

### Package management
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add a package

### Application startup (User manages these)
- `pnpm start` or `pnpm expo start` - Start the Expo development server
- `pnpm run android` - Start on Android emulator
- `pnpm run ios` - Start on iOS simulator  
- `pnpm run web` - Start web version

**Important**: Claude Code should only run lint and type check commands. Do not run expo start or platform-specific commands. Standard development commands (cd, grep, git, file operations, etc.) are fine to use.

### Project management
- `pnpm run reset-project` - Reset to blank app (moves starter code to app-example)

## Architecture Overview

This is a React Native Expo app with the following key architectural components:

### Core Stack
- **Expo Router**: File-based routing system with typed routes enabled
- **React Native**: Cross-platform mobile development (iOS, Android, Web)
- **Convex**: Real-time backend-as-a-service with document database
- **AI SDK**: Integration with OpenRouter and Google Gemini 2.5 Flash model
- **React Native Paper**: Material Design UI component library
- **TypeScript**: Full type safety with auto-generated types from Convex schema

### Backend Architecture
- **Convex Database**: Real-time document database with automatic TypeScript generation
- **Convex Functions**: Server-side mutations and queries in `convex/` directory
- **AI Integration**: OpenRouter with Google Gemini 2.5 Flash, high-effort reasoning mode
- **Web Search**: Exa API integration for mandatory travel research
- **Tool Integration**: AI can execute Convex functions via structured tool calls

### Frontend Architecture
- **File-based Routing**: Single-page app with main index route
- **Global State**: ChatContext for chat state, Convex for database state
- **Real-time Data**: Convex queries automatically update UI when data changes
- **AI Chat Interface**: Streaming chat with tool invocations and reasoning display
- **Component Architecture**: Reusable chat, trip, and message components

### Key Files and Directories
- `app/api/chat+api.ts` - AI chat API endpoint with tool integration and streaming
- `app/index.tsx` - Main application entry point with chat interface
- `app/_layout.tsx` - Root layout with providers (Convex, Theme)
- `convex/schema.ts` - Database schema definitions for trips, days, and entries
- `convex/trips.ts` - Advanced trip functions with comprehensive CRUD operations
- `convex/tripsSimple.ts` - Simple trip functions for basic operations
- `convex/days.ts` - Day-specific functions for trip itinerary management
- `convex/entries.ts` - Entry functions for individual trip items
- `contexts/ChatContext.tsx` - Global chat state management
- `components/ChatOverlay.tsx` - Chat interface overlay component
- `components/TripsShowcase.tsx` - Trip listing and management
- `components/TypingIndicator.tsx` - Chat typing indicator component
- `hooks/useKeyboardAvoidance.ts` - Keyboard handling for mobile
- `types/index.ts` - TypeScript type definitions
- `utils.ts` - Utility functions including API URL generation
- `polyfills.js` - Polyfills for React Native compatibility

### Environment Setup
- `EXPO_PUBLIC_CONVEX_URL` - Convex backend URL for database connection
- `OPENROUTER_API_KEY` - OpenRouter API key for AI model access
- `EXA_API_KEY` - Exa API key for web search functionality
- `HELICONE_API_KEY` - Helicone API key for monitoring and analytics

### Data Flow
1. User interacts with chat interface (ChatOverlay component)
2. Messages sent to `/api/chat` endpoint with streaming enabled
3. AI processes with mandatory web search using Exa API
4. AI executes Convex functions via structured tool calls
5. Real-time updates propagate to UI via Convex queries
6. Tool invocations create/modify trips in database with full nested structure

### Trip Data Architecture
- **Single Document Pattern**: All trip data stored in one document for atomic updates
- **Nested Structure**: Days contain visits and transportation, visits contain places
- **Mandatory Google Maps**: All places require Google Maps URLs for integration
- **Rich Metadata**: Places include ratings, prices, opening hours, contact info
- **Status Tracking**: Trips have planning, active, and completed states

### AI System Architecture
- **High-effort Reasoning**: AI uses up to 50 reasoning steps for complex planning
- **Mandatory Web Search**: All travel recommendations require web research first
- **Tool Integration**: AI can create, read, update, and delete trips via Convex functions
- **Streaming Responses**: Real-time text generation with tool call transparency
- **Error Recovery**: Automatic tool call repair and retry mechanisms

### Development Notes
- Uses `expo/fetch` polyfill for AI SDK compatibility
- Convex generates TypeScript types automatically in `_generated/` directory
- AI responses include reasoning, tool calls, and text parts
- Real-time database updates without manual refresh
- Components use React Native Paper and native React Native styling
- iOS platform support with native project configuration
- Keyboard avoidance handling for mobile chat interface