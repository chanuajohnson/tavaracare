
# Tavara Chatbot Component

A reusable chatbot component for Tavara that can be integrated into any React project.

## Features

- Interactive chat interface with typing indicators
- Role-based conversation flow
- Customizable positioning
- Responsive design
- Local storage persistence
- Form data collection and prefill JSON generation

## Installation

The chatbot component is designed to work within the Tavara application ecosystem.

## Usage

### Basic Integration

Wrap your application or page with the `ChatProvider`:

```jsx
import { ChatProvider } from "@/components/chatbot/ChatProvider";

const App = () => {
  return (
    <ChatProvider>
      <YourAppContent />
      <ChatbotLauncher position="bottom-right" />
    </ChatProvider>
  );
};
```

### Positioning Options

The ChatbotLauncher component supports different positioning strategies:

#### Left of FAB (Floating Action Button)

```jsx
<ChatProvider>
  <div className="your-page-content">
    {/* Your page content */}
  </div>
  <ChatbotLauncher 
    position="left-of-fab" 
    spacing={24} // 24px gap between FAB and chatbot
  />
</ChatProvider>
```

#### Fixed Positions

```jsx
<ChatbotLauncher position="bottom-right" /> // Bottom right corner
<ChatbotLauncher position="bottom-left" />  // Bottom left corner
```

### Customizing Appearance

```jsx
<ChatbotLauncher 
  position="left-of-fab"
  spacing={32}
  width="350px"
  className="bg-blue-500 hover:bg-blue-600" // Custom button styling
/>
```

## Component Architecture

```
src/components/chatbot/
├── ChatbotWidget.tsx    // Main chat interface
├── ChatbotLauncher.tsx  // Launcher button + positioning logic
├── ChatProvider.tsx     // Context provider for chat state
└── index.ts            // Exports all components
```

## Associated Hooks & Utilities

```
src/hooks/chat/
├── useChatSession.ts   // Manages chat session ID
└── useChatMessages.ts  // Handles message storage and retrieval

src/utils/chat/
└── prefillGenerator.ts // Converts chat responses to form data
```

## Development Roadmap

### Phase 1: Local Storage (Current)
- Basic UI components
- localStorage-based session management
- Role-based conversation flows
- Prefill JSON generation

### Phase 2: Supabase Integration
- Persist chat sessions to database
- User authentication integration
- Form prefill and redirection
- Analytics and insights
