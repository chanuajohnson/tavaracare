
// Central export file for chat utilities
export { processConversation } from './chatFlowEngine';
export { handleAIFlow } from './engine/aiFlow';
export type { ChatConfig } from './engine/types';
export { defaultChatConfig } from './engine/types';
export { getFallbackResponse } from './engine/modules/fallbackResponses';
export { generateSystemPrompt } from './engine/modules/promptGenerator';
export { detectFieldType, generateQuestionOptions } from './engine/modules/fieldDetection';
