// Core types for TAV standalone system
export interface CoreTAVMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface CoreConversationContext {
  currentPage: string;
  currentForm?: string;
  formFields?: Record<string, any>;
  userRole?: string;
  sessionId: string;
  demoConfig?: DemoConfiguration;
  branding?: BrandingConfig;
}

export interface DemoConfiguration {
  type: 'interactive' | 'form_preview' | 'customization';
  useCase: 'registration' | 'interview' | 'feedback' | 'support' | 'custom';
  industry?: string;
  companySize?: string;
  customization?: {
    primaryColor?: string;
    assistantName?: string;
    welcomeMessage?: string;
    avatar?: string;
  };
}

export interface BrandingConfig {
  assistantName: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  welcomeMessage: string;
  companyName: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DetectedForm {
  formId: string;
  formTitle: string;
  fields: FormField[];
  priority: number;
}

export interface DemoSession {
  id: string;
  sessionToken: string;
  demoType: string;
  conversationData: CoreTAVMessage[];
  formInteractions: number;
  messagesSent: number;
  demoDurationSeconds: number;
  leadCaptured: boolean;
  emailCaptured?: string;
  companyName?: string;
  useCaseSelected?: string;
  customizationPreferences: any;
  conversionStage: 'demo' | 'lead' | 'trial' | 'paid';
}