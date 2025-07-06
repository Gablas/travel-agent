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
- **React Native**: Cross-platform mobile development
- **Convex**: Real-time backend with database and API
- **AI SDK**: Integration with Google Gemini AI with streaming capabilities
- **TypeScript**: Full type safety throughout the application

### Backend Architecture
- **Convex Database**: Real-time database with automatic code generation
- **Convex Functions**: Server-side mutations and queries in `convex/` directory
- **AI Integration**: Google Gemini 2.5 Flash model with search grounding and thinking capabilities
- **Tool Integration**: AI can execute server-side functions via tools

### Frontend Architecture
- **File-based Routing**: Routes defined in `app/` directory structure
- **Tab Navigation**: Bottom tab layout in `app/(tabs)/`
- **Real-time Data**: Convex queries automatically update UI when data changes
- **AI Chat Interface**: Streaming chat with tool invocations and reasoning display

### Key Files and Directories
- `app/api/chat+api.ts` - AI chat API endpoint with tool integration
- `app/(tabs)/index.tsx` - Main chat interface and destination management
- `convex/schema.ts` - Database schema definitions
- `convex/destinations.ts` - Server-side functions for destination management
- `app/_layout.tsx` - Root layout with providers (Theme, Convex)
- `utils.ts` - Utility functions including API URL generation
- `polyfills.js` - Polyfills for React Native compatibility

### Environment Setup
- Requires `EXPO_PUBLIC_CONVEX_URL` environment variable
- Convex client configured with real-time capabilities
- AI SDK configured for streaming responses

### Data Flow
1. User interacts with chat interface
2. Messages sent to `/api/chat` endpoint
3. AI processes with access to Convex database via tools
4. Real-time updates propagate to UI via Convex queries
5. Tool invocations create/modify destinations in database

### Development Notes
- Uses `expo/fetch` polyfill for AI SDK compatibility
- Convex generates TypeScript types automatically
- AI responses include reasoning, tool calls, and text parts
- Real-time database updates without manual refresh