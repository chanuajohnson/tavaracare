
# Chatbot Setup Guide

This document provides instructions for setting up the chatbot functionality in the Tavara Care application.

## Prerequisites

1. A Supabase project with proper credentials
2. Environment variables configured properly

## Environment Variables

Ensure these environment variables are set in your `.env.development` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENV=development
```

## Database Setup

The chatbot requires two main tables in your Supabase database:

1. `chatbot_conversations` - Stores conversation metadata and context
2. `chatbot_messages` - Stores individual messages in the conversation

You can create these tables by running the SQL migration script in `supabase/migrations/20250409_chatbot_schema.sql`.

## Testing Connection

If you encounter issues with the chatbot functionality:

1. Check the browser console for specific errors
2. Verify your environment variables are correctly set
3. Visit the debug page at `/debug/supabase` to test your connection
4. Make sure all required database tables exist

## Common Issues

### "Loading conversation..." Never Completes

This happens when:

1. The database tables don't exist - run the migration script
2. Supabase credentials are missing or incorrect - check your environment variables
3. There are TypeScript errors preventing proper compilation - fixed with the new utilities

### TypeScript Excessive Type Instantiation Errors

We've implemented a solution using a Supabase utility layer that:

1. Prevents excessive type instantiation
2. Maintains proper typing
3. Provides a consistent API for database operations

## Using the Chatbot Component

```tsx
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

// In your layout or page component:
<ChatbotWidget delay={3000} />
```

The `delay` prop specifies how many milliseconds to wait before showing the chat widget (defaults to 5000).

## Architecture Overview

The chatbot implementation follows this structure:

1. `useChatSession` hook - Manages the session and conversation state
2. `useChatMessages` hook - Manages the messages for a specific conversation
3. `useChatFlowEngine` hook - Handles the conversation flow logic
4. `ChatbotWidget` component - The UI for the chatbot
5. Backend services in `src/services/chatbot/*` - Handle data persistence

## Next Steps

If you want to extend the chatbot functionality:

1. Update the chat flow in `useChatFlowEngine.ts`
2. Add more message types in `ChatbotMessageType`
3. Create custom response handlers for different user inputs
