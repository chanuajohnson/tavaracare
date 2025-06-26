
// Meta Pixel TypeScript declarations
declare global {
  interface Window {
    fbq: (
      action: 'track' | 'trackCustom' | 'init' | 'consent',
      eventName: string,
      parameters?: Record<string, any>
    ) => void;
    _fbq: any;
  }
}

export type MetaPixelStandardEvent = 
  | 'PageView'
  | 'CompleteRegistration'
  | 'Lead'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'Contact'
  | 'Schedule';

export type MetaPixelCustomEvent = 
  | 'CaregiverMatch'
  | 'ProfileComplete'
  | 'ScheduleShare'
  | 'TrainingComplete'
  | 'CareTeamJoin'
  | 'JourneyProgress'
  | 'FeatureInteraction';

export {};
