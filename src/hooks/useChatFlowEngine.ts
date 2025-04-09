
import { useState } from 'react';
import { updateConversation, updateConversationRole } from '@/services/chatbot/sessionService';
import { updateContactInfo, updateCareNeeds, updateConversionStatus } from '@/services/chatbot/messageService';
import { ChatbotConversation, CareNeeds, ContactInfo } from '@/types/chatbotTypes';
import { ChatIntroMessage } from '@/data/chatIntroMessage';

export type ChatStep = 
  | 'welcome'
  | 'care_recipient'
  | 'care_type'
  | 'schedule_needs'
  | 'location_contact'
  | 'next_steps'
  | 'complete';

interface ChatFlowState {
  currentStep: ChatStep;
  careNeeds: CareNeeds;
  contactInfo: ContactInfo;
  userRole?: 'family' | 'professional' | 'community';
}

export function useChatFlowEngine(conversation: ChatbotConversation | null) {
  const [flowState, setFlowState] = useState<ChatFlowState>({
    currentStep: 'welcome',
    careNeeds: {},
    contactInfo: {}
  });

  // Helper to move to the next step
  const moveToNextStep = (nextStep: ChatStep) => {
    setFlowState(prev => ({
      ...prev,
      currentStep: nextStep
    }));
  };

  // Helper to update care needs
  const updateCareNeedsState = (updates: Partial<CareNeeds>) => {
    setFlowState(prev => ({
      ...prev,
      careNeeds: {
        ...prev.careNeeds,
        ...updates
      }
    }));

    // Also update in database if we have a conversation ID
    if (conversation?.id) {
      updateCareNeeds(conversation.id, updates);
    }
  };

  // Helper to update contact info
  const updateContactInfoState = (updates: Partial<ContactInfo>) => {
    setFlowState(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        ...updates
      }
    }));

    // Also update in database if we have a conversation ID
    if (conversation?.id) {
      updateContactInfo(conversation.id, updates);
    }
  };

  // Helper to update user role
  const setUserRole = async (role: 'family' | 'professional' | 'community') => {
    setFlowState(prev => ({
      ...prev,
      userRole: role
    }));

    // Also update in database if we have a conversation ID
    if (conversation?.id) {
      await updateConversationRole(conversation.id, role);
    }
  };

  // Start the conversation flow
  const startConversation = () => {
    moveToNextStep('welcome');
    return ChatIntroMessage;
  };

  // Process user response based on current step
  const processUserResponse = async (
    response: string, 
    currentStep: ChatStep
  ): Promise<{
    message: string;
    messageType?: 'text' | 'option';
    options?: { label: string; value: string }[];
  }> => {
    switch (currentStep) {
      case 'welcome':
        // Handle role selection from intro options
        const roleValue = response.toLowerCase();
        
        if (roleValue.includes('family') || response.includes('care for a loved one')) {
          await setUserRole('family');
          moveToNextStep('care_recipient');
          return {
            message: "What's your relationship to the person needing care?",
            messageType: 'option',
            options: [
              { label: "Parent/Grandparent", value: "parent" },
              { label: "Child", value: "child" },
              { label: "Spouse/Partner", value: "spouse" },
              { label: "Other family member", value: "family" },
              { label: "Friend/Neighbor", value: "friend" }
            ]
          };
        } else if (roleValue.includes('professional') || response.includes('care professional')) {
          await setUserRole('professional');
          moveToNextStep('care_type');
          return {
            message: "What type of care professional are you?",
            messageType: 'option',
            options: [
              { label: "👩‍⚕️ Nurse", value: "nurse" },
              { label: "👨‍⚕️ Personal Support Worker", value: "psw" },
              { label: "🏥 Healthcare Aide", value: "aide" },
              { label: "🧠 Therapist", value: "therapist" },
              { label: "🏡 Home Care Specialist", value: "specialist" },
              { label: "📝 Other", value: "other" }
            ]
          };
        } else if (roleValue.includes('community') || response.includes('help') || response.includes('contribute')) {
          await setUserRole('community');
          moveToNextStep('care_type');
          return {
            message: "How would you like to contribute to the community?",
            messageType: 'option',
            options: [
              { label: "🫂 Volunteering", value: "volunteer" },
              { label: "💡 Tech Innovation", value: "tech" },
              { label: "📚 Education & Resources", value: "education" },
              { label: "🤝 Community Support", value: "support" },
              { label: "🔄 Other", value: "other" }
            ]
          };
        } else {
          // If we can't determine the role from the response, ask again
          return {
            message: "I'm not sure I understand. Could you please select one of the options?",
            messageType: 'option',
            options: ChatIntroMessage.options || []
          };
        }

      case 'care_recipient':
        updateCareNeedsState({ relationship: response });
        moveToNextStep('care_type');
        return {
          message: "What kind of care are you looking for?",
          messageType: 'option',
          options: [
            { label: "🏠 In-Home Care", value: "in_home" },
            { label: "🏥 Medical Support", value: "medical" },
            { label: "🎓 Special Needs", value: "special_needs" },
            { label: "♿ Mobility Assistance", value: "mobility" },
            { label: "🧠 Memory Care", value: "memory" },
            { label: "🕰️ Respite Care", value: "respite" }
          ]
        };

      case 'care_type':
        if (flowState.userRole === 'family') {
          updateCareNeedsState({ careType: [response] });
          moveToNextStep('schedule_needs');
          return {
            message: "What schedule do you need care for?",
            messageType: 'option',
            options: [
              { label: "📅 Weekdays (8am-4pm)", value: "weekday_standard" },
              { label: "📅 Weekdays (all day)", value: "weekday_full" },
              { label: "🌙 Overnight Care", value: "overnight" },
              { label: "🏠 Live-in Care", value: "live_in" },
              { label: "🔄 Flexible/As-needed", value: "flexible" },
              { label: "🗓️ Weekends Only", value: "weekend" }
            ]
          };
        } else if (flowState.userRole === 'professional') {
          // For professionals, this is their specialty
          updateCareNeedsState({ careType: [response] });
          moveToNextStep('schedule_needs');
          return {
            message: "What's your availability?",
            messageType: 'option',
            options: [
              { label: "📅 Weekdays (8am-4pm)", value: "weekday_standard" },
              { label: "📅 Weekdays (flexible hours)", value: "weekday_flexible" },
              { label: "🌙 Overnight shifts", value: "overnight" },
              { label: "🏠 Live-in assignments", value: "live_in" },
              { label: "🗓️ Weekends", value: "weekend" },
              { label: "🔄 Varies/On-call", value: "on_call" }
            ]
          };
        } else {
          // For community members
          updateCareNeedsState({ careType: [response] });
          moveToNextStep('location_contact');
          return {
            message: "Great, now let's get your contact details so we can keep you updated on community initiatives. What's your full name?",
          };
        }

      case 'schedule_needs':
        updateCareNeedsState({ schedule: response });
        moveToNextStep('location_contact');
        return {
          message: "Great, now let's get your contact details. What's your full name?"
        };

      case 'location_contact':
        // Parse contact info from a potentially complex response
        if (!flowState.contactInfo.fullName) {
          updateContactInfoState({ fullName: response });
          return { message: "What's your email address?" };
        } else if (!flowState.contactInfo.email) {
          updateContactInfoState({ email: response });
          return { message: "What's your phone number?" };
        } else if (!flowState.contactInfo.phone) {
          updateContactInfoState({ phone: response });
          return { message: "What city are you located in?" };
        } else {
          updateContactInfoState({ city: response });
          moveToNextStep('next_steps');
          
          // Save all collected information to the database
          await saveConversationData();
          
          if (flowState.userRole === 'family') {
            return {
              message: "Thank you! Based on your needs, here are some options:",
              messageType: 'option',
              options: [
                { label: "View caregivers matching my needs", value: "view_caregivers" },
                { label: "Book a consultation with a care coordinator", value: "book_consultation" },
                { label: "Complete my family registration", value: "complete_registration" }
              ]
            };
          } else if (flowState.userRole === 'professional') {
            return {
              message: "Thank you! Based on your profile, here are some options:",
              messageType: 'option',
              options: [
                { label: "View care opportunities matching my skills", value: "view_opportunities" },
                { label: "Complete my professional registration", value: "complete_registration" },
                { label: "Learn about our platform", value: "learn_more" }
              ]
            };
          } else {
            return {
              message: "Thank you! Here's how you can get involved:",
              messageType: 'option',
              options: [
                { label: "Complete my community registration", value: "complete_registration" },
                { label: "Learn about upcoming events", value: "view_events" },
                { label: "Explore contribution opportunities", value: "view_opportunities" }
              ]
            };
          }
        }

      case 'next_steps':
        moveToNextStep('complete');

        let redirectUrl = '';
        let message = '';

        if (response.toLowerCase().includes('complete_registration') || response.toLowerCase().includes('registration')) {
          // Mark as ready for conversion
          if (conversation?.id) {
            await updateConversionStatus(conversation.id, true);
          }
          
          if (flowState.userRole === 'family') {
            redirectUrl = '/registration/family';
            message = "Great! I'll take you to complete your family registration.";
          } else if (flowState.userRole === 'professional') {
            redirectUrl = '/registration/professional';
            message = "Great! I'll take you to complete your professional profile.";
          } else {
            redirectUrl = '/registration/community';
            message = "Great! I'll take you to complete your community registration.";
          }
        } else if (response.toLowerCase().includes('view_caregivers') || response.toLowerCase().includes('view_opportunities')) {
          if (flowState.userRole === 'family') {
            redirectUrl = '/family/matching';
            message = "I'll show you caregivers that match your needs.";
          } else {
            redirectUrl = '/professional/matching';
            message = "I'll show you care opportunities that match your profile.";
          }
        } else if (response.toLowerCase().includes('book_consultation')) {
          redirectUrl = '/family/consultation';
          message = "I'll help you schedule a consultation with our care team.";
        } else if (response.toLowerCase().includes('learn_more') || response.toLowerCase().includes('view_events')) {
          redirectUrl = '/about';
          message = "I'll show you more information about our platform and community.";
        }

        return {
          message,
          messageType: 'text',
          options: redirectUrl ? [{ label: "Continue", value: redirectUrl }] : undefined
        };

      default:
        return {
          message: "I didn't understand that. Could you please try again?"
        };
    }
  };

  // Get response options based on current step
  const getOptionsForCurrentStep = (): { label: string; value: string }[] => {
    switch (flowState.currentStep) {
      case 'welcome':
        return ChatIntroMessage.options || [];
      
      case 'care_recipient':
        return [
          { label: "Parent/Grandparent", value: "parent" },
          { label: "Child", value: "child" },
          { label: "Spouse/Partner", value: "spouse" },
          { label: "Other family member", value: "family" },
          { label: "Friend/Neighbor", value: "friend" }
        ];
      
      case 'care_type':
        if (flowState.userRole === 'family') {
          return [
            { label: "🏠 In-Home Care", value: "in_home" },
            { label: "🏥 Medical Support", value: "medical" },
            { label: "🎓 Special Needs", value: "special_needs" },
            { label: "♿ Mobility Assistance", value: "mobility" },
            { label: "🧠 Memory Care", value: "memory" },
            { label: "🕰️ Respite Care", value: "respite" }
          ];
        } else if (flowState.userRole === 'professional') {
          return [
            { label: "👩‍⚕️ Nurse", value: "nurse" },
            { label: "👨‍⚕️ Personal Support Worker", value: "psw" },
            { label: "🏥 Healthcare Aide", value: "aide" },
            { label: "🧠 Therapist", value: "therapist" },
            { label: "🏡 Home Care Specialist", value: "specialist" },
            { label: "📝 Other", value: "other" }
          ];
        } else {
          return [
            { label: "🫂 Volunteering", value: "volunteer" },
            { label: "💡 Tech Innovation", value: "tech" },
            { label: "📚 Education & Resources", value: "education" },
            { label: "🤝 Community Support", value: "support" },
            { label: "🔄 Other", value: "other" }
          ];
        }
      
      case 'schedule_needs':
        if (flowState.userRole === 'family') {
          return [
            { label: "📅 Weekdays (8am-4pm)", value: "weekday_standard" },
            { label: "📅 Weekdays (all day)", value: "weekday_full" },
            { label: "🌙 Overnight Care", value: "overnight" },
            { label: "🏠 Live-in Care", value: "live_in" },
            { label: "🔄 Flexible/As-needed", value: "flexible" },
            { label: "🗓️ Weekends Only", value: "weekend" }
          ];
        } else {
          return [
            { label: "📅 Weekdays (8am-4pm)", value: "weekday_standard" },
            { label: "📅 Weekdays (flexible hours)", value: "weekday_flexible" },
            { label: "🌙 Overnight shifts", value: "overnight" },
            { label: "🏠 Live-in assignments", value: "live_in" },
            { label: "🗓️ Weekends", value: "weekend" },
            { label: "🔄 Varies/On-call", value: "on_call" }
          ];
        }
      
      case 'next_steps':
        if (flowState.userRole === 'family') {
          return [
            { label: "View caregivers matching my needs", value: "view_caregivers" },
            { label: "Book a consultation with a care coordinator", value: "book_consultation" },
            { label: "Complete my family registration", value: "complete_registration" }
          ];
        } else if (flowState.userRole === 'professional') {
          return [
            { label: "View care opportunities matching my skills", value: "view_opportunities" },
            { label: "Complete my professional registration", value: "complete_registration" },
            { label: "Learn about our platform", value: "learn_more" }
          ];
        } else {
          return [
            { label: "Complete my community registration", value: "complete_registration" },
            { label: "Learn about upcoming events", value: "view_events" },
            { label: "Explore contribution opportunities", value: "view_opportunities" }
          ];
        }
      
      default:
        return [];
    }
  };

  // Save the collected information to the database
  const saveConversationData = async () => {
    if (!conversation?.id) return;

    await updateConversation(conversation.id, {
      careNeeds: flowState.careNeeds,
      contactInfo: flowState.contactInfo,
      leadScore: calculateLeadScore(),
      qualificationStatus: determineQualificationStatus(),
      userRole: flowState.userRole
    });
  };

  // Calculate a lead score based on completeness of information
  const calculateLeadScore = (): number => {
    let score = 0;
    
    // Add points for each piece of information provided
    if (flowState.careNeeds.relationship) score += 10;
    if (flowState.careNeeds.careType?.length) score += 15;
    if (flowState.careNeeds.schedule) score += 15;
    
    if (flowState.contactInfo.fullName) score += 15;
    if (flowState.contactInfo.email) score += 20;
    if (flowState.contactInfo.phone) score += 20;
    if (flowState.contactInfo.city) score += 5;
    
    return score; // Max score of 100
  };

  // Determine qualification status based on lead score
  const determineQualificationStatus = (): 'high' | 'medium' | 'low' | 'unqualified' => {
    const score = calculateLeadScore();
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'unqualified';
  };

  // Generate prefill data for registration forms
  const generatePrefillData = () => {
    if (!flowState.userRole) return null;

    switch (flowState.userRole) {
      case 'family':
        return {
          first_name: flowState.contactInfo.fullName?.split(' ')[0],
          last_name: flowState.contactInfo.fullName?.split(' ').slice(1).join(' '),
          phone_number: flowState.contactInfo.phone,
          address: flowState.contactInfo.city,
          relationship: flowState.careNeeds.relationship,
          care_types: flowState.careNeeds.careType,
          care_schedule: [flowState.careNeeds.schedule],
        };

      case 'professional':
        return {
          first_name: flowState.contactInfo.fullName?.split(' ')[0],
          last_name: flowState.contactInfo.fullName?.split(' ').slice(1).join(' '),
          phone: flowState.contactInfo.phone,
          location: flowState.contactInfo.city,
          professional_type: flowState.careNeeds.careType?.[0],
          availability: [flowState.careNeeds.schedule],
        };

      case 'community':
        return {
          fullName: flowState.contactInfo.fullName,
          phoneNumber: flowState.contactInfo.phone,
          location: flowState.contactInfo.city,
          contributionInterests: flowState.careNeeds.careType,
        };

      default:
        return null;
    }
  };

  return {
    currentStep: flowState.currentStep,
    careNeeds: flowState.careNeeds,
    contactInfo: flowState.contactInfo,
    userRole: flowState.userRole,
    processUserResponse,
    getOptionsForCurrentStep,
    startConversation,
    saveConversationData,
    generatePrefillData
  };
}
