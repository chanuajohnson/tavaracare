// Global service to manage real-time callbacks across the app
class RealTimeCallbackService {
  private static instance: RealTimeCallbackService;
  private callback: ((message: string, isUser: boolean) => void) | null = null;

  static getInstance(): RealTimeCallbackService {
    if (!RealTimeCallbackService.instance) {
      RealTimeCallbackService.instance = new RealTimeCallbackService();
    }
    return RealTimeCallbackService.instance;
  }

  registerCallback(callback: (message: string, isUser: boolean) => void) {
    console.warn('🔗 [RealTimeCallbackService] Registering callback');
    this.callback = callback;
  }

  unregisterCallback() {
    console.warn('🔗 [RealTimeCallbackService] Unregistering callback');
    this.callback = null;
  }

  executeCallback(message: string, isUser: boolean) {
    if (this.callback) {
      console.warn('🔗 [RealTimeCallbackService] Executing callback:', { message, isUser, callbackType: typeof this.callback });
      try {
        this.callback(message, isUser);
        console.warn('🔗 [RealTimeCallbackService] Callback executed successfully');
      } catch (error) {
        console.error('🚨 [RealTimeCallbackService] Callback execution failed:', error);
      }
    } else {
      console.warn('🔗 [RealTimeCallbackService] No callback registered - cannot execute');
    }
  }

  hasCallback(): boolean {
    return this.callback !== null;
  }
}

export const realTimeCallbackService = RealTimeCallbackService.getInstance();