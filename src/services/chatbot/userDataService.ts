
import { supabase } from '@/lib/supabase';

// Update conversation with user role
export async function updateConversationRole(
  conversationId: string, 
  userRole: 'family' | 'professional' | 'community'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ user_role: userRole })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error updating conversation role:', error);
    return false;
  }
}

// Link a conversation to a user (when they register/login)
export async function linkConversationToUser(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ user_id: userId })
      .eq('id', conversationId);

    return !error;
  } catch (error) {
    console.error('Error linking conversation to user:', error);
    return false;
  }
}
