
export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  model?: string;
  systemPrompt?: string;
  debug?: boolean;
  fallbackThreshold?: number;
}

export const defaultChatConfig: ChatConfig = {
  mode: 'hybrid',
  temperature: 0.7,
  model: 'gpt-4o-mini',
  debug: false,
  fallbackThreshold: 2
};

export const loadChatConfig = (): ChatConfig => {
  try {
    const storedConfig = localStorage.getItem('tavara_chat_config');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
  } catch (err) {
    console.error("Error loading chat config:", err);
  }
  
  return defaultChatConfig;
};

export const saveChatConfig = (config: ChatConfig): void => {
  try {
    localStorage.setItem('tavara_chat_config', JSON.stringify(config));
  } catch (err) {
    console.error("Error saving chat config:", err);
  }
};

// Function to get a user-friendly name for the chat mode
export const getChatModeName = (mode: string): string => {
  switch (mode) {
    case 'ai': return 'AI Only';
    case 'scripted': return 'Scripted Only';
    case 'hybrid': return 'Hybrid';
    default: return 'Unknown';
  }
};

export const shouldAlwaysShowOptions = (): boolean => {
  const showOptions = localStorage.getItem('tavara_always_show_options');
  return showOptions === 'true';
};

export const setAlwaysShowOptions = (value: boolean): void => {
  localStorage.setItem('tavara_always_show_options', value.toString());
};

export const resetChatConfig = (): ChatConfig => {
  const config = { ...defaultChatConfig };
  saveChatConfig(config);
  return config;
};

export const debugChatConfig = (): void => {
  console.log('Current chat config:', loadChatConfig());
};

export const clearChatStorage = (sessionId: string): void => {
  try {
    // Clear chat config
    localStorage.removeItem('tavara_chat_config');
    
    // Clear chat messages
    localStorage.removeItem(`tavara_chat_messages_${sessionId}`);
    
    // Clear chat progress
    localStorage.removeItem('tavara_chat_progress');
    
    // Clear chat session ID
    localStorage.removeItem('tavara_chat_session_id');
    
    // Clear always show options setting
    localStorage.removeItem('tavara_always_show_options');
    
    console.log('Chat storage cleared successfully');
  } catch (err) {
    console.error('Error clearing chat storage:', err);
  }
};
