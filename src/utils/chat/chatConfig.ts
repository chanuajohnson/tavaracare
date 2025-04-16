
export interface ChatConfig {
  mode: 'structured' | 'ai' | 'hybrid';
  temperature?: number;
  model?: string;
  systemPrompt?: string;
  debug?: boolean;
}

export const defaultChatConfig: ChatConfig = {
  mode: 'hybrid',
  temperature: 0.7,
  model: 'gpt-4o-mini',
  debug: false
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

export const shouldAlwaysShowOptions = (): boolean => {
  const config = loadChatConfig();
  return config.mode === 'structured';
};
