
import { ChatConfig, defaultChatConfig } from './chatFlowEngine';

// Local storage key for chat config
const CHAT_CONFIG_KEY = 'tavara_chat_config';

/**
 * Loads the chat configuration from localStorage
 */
export const loadChatConfig = (): ChatConfig => {
  try {
    const storedConfig = localStorage.getItem(CHAT_CONFIG_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
  } catch (error) {
    console.error('Error loading chat config:', error);
  }
  
  return defaultChatConfig;
};

/**
 * Saves the chat configuration to localStorage
 */
export const saveChatConfig = (config: ChatConfig): void => {
  try {
    localStorage.setItem(CHAT_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving chat config:', error);
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
