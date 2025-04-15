import { ChatConfig } from './engine/types';
import { defaultChatConfig } from './engine/types';

// Local storage key for chat config
const CHAT_CONFIG_KEY = 'tavara_chat_config';
const ALWAYS_SHOW_OPTIONS_KEY = 'tavara_chat_always_show_options';

/**
 * Loads the chat configuration from localStorage
 */
export const loadChatConfig = (): ChatConfig => {
  try {
    const storedConfig = localStorage.getItem(CHAT_CONFIG_KEY);
    if (storedConfig) {
      return { ...defaultChatConfig, ...JSON.parse(storedConfig) };
    }
  } catch (error) {
    console.error('Error loading chat config:', error);
    // Reset localStorage in case of corruption
    localStorage.removeItem(CHAT_CONFIG_KEY);
  }
  
  // Set default to AI mode always with higher temperature for more personality
  return {
    ...defaultChatConfig,
    mode: 'ai',
    temperature: 0.8,
    fallbackThreshold: 5  // Increased retry threshold for more persistence with AI
  };
};

/**
 * Saves the chat configuration to localStorage
 */
export const saveChatConfig = (config: ChatConfig): void => {
  try {
    localStorage.setItem(CHAT_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving chat config:', error);
    // Try clearing other storage to make space
    try {
      localStorage.removeItem('tavara_chat_session');
      localStorage.setItem(CHAT_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // If still fails, just log the error
      console.error('Failed to save config even after cleanup');
    }
  }
};

/**
 * Updates specific configuration properties
 */
export const updateChatConfig = (updates: Partial<ChatConfig>): ChatConfig => {
  const currentConfig = loadChatConfig();
  const newConfig = { ...currentConfig, ...updates };
  saveChatConfig(newConfig);
  return newConfig;
};

/**
 * Resets the chat configuration to default
 */
export const resetChatConfig = (): ChatConfig => {
  saveChatConfig(defaultChatConfig);
  return defaultChatConfig;
};

/**
 * Gets a reading-friendly name for the chat mode
 */
export const getChatModeName = (mode: ChatConfig['mode']): string => {
  switch (mode) {
    case 'ai':
      return 'AI Only';
    case 'scripted':
      return 'Scripted Only';
    case 'hybrid':
      return 'Hybrid (AI with Scripted Fallback)';
    default:
      return 'Unknown Mode';
  }
};

/**
 * Checks if multiple-choice options should always be shown
 */
export const shouldAlwaysShowOptions = (): boolean => {
  return localStorage.getItem(ALWAYS_SHOW_OPTIONS_KEY) === 'true';
};

/**
 * Sets whether multiple-choice options should always be shown
 */
export const setAlwaysShowOptions = (value: boolean): void => {
  localStorage.setItem(ALWAYS_SHOW_OPTIONS_KEY, value ? 'true' : 'false');
};

/**
 * Clear all chat-related localStorage data (for troubleshooting)
 */
export const clearChatStorage = (sessionId: string): void => {
  localStorage.removeItem(CHAT_CONFIG_KEY);
  localStorage.removeItem(ALWAYS_SHOW_OPTIONS_KEY);
  localStorage.removeItem(`tavara_chat_messages_${sessionId}`);
  localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
  localStorage.removeItem('tavara_chat_initial_role');
  localStorage.removeItem('tavara_chat_session');
  localStorage.removeItem('tavara_chat_is_open');
};

/**
 * DEBUG: Logs the current chat configuration
 */
export const debugChatConfig = (): void => {
  const config = loadChatConfig();
  console.log('[Chat Config]', config);
  console.log('[Always Show Options]', shouldAlwaysShowOptions());
};
