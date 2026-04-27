-- Clear all chat and conversation data for fresh testing
-- Delete in correct order to avoid foreign key violations

-- Phase 1: Clear Chat Messages First
DELETE FROM caregiver_chat_messages;
DELETE FROM chatbot_messages;

-- Phase 2: Clear Chat Sessions and Requests  
DELETE FROM caregiver_chat_sessions;
DELETE FROM caregiver_chat_requests;
DELETE FROM family_chat_requests;

-- Phase 3: Clear Conversation Data
DELETE FROM chat_conversation_flows;
DELETE FROM chatbot_conversations;

-- Phase 4: Clear Related Progress/Response Data
DELETE FROM chatbot_progress;
DELETE FROM chatbot_responses;