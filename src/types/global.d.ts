
// Global type declarations

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        custom_parameters?: Record<string, any>;
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}

export {};
