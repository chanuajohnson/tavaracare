
import { assistantSupabase } from './assistantSupabase';
import { ProgressContext } from './types';

export class ManualNudgeService {
  private static instance: ManualNudgeService;
  private stallCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): ManualNudgeService {
    if (!ManualNudgeService.instance) {
      ManualNudgeService.instance = new ManualNudgeService();
    }
    return ManualNudgeService.instance;
  }

  async checkForStalledProgress(userId: string, progressContext: ProgressContext): Promise<void> {
    // Check if user has been inactive for 24+ hours
    const lastActivity = localStorage.getItem(`last_activity_${userId}`);
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (lastActivity && (now - parseInt(lastActivity)) > dayInMs) {
      await this.triggerStallNudge(userId, progressContext);
    }
  }

  private async triggerStallNudge(userId: string, context: ProgressContext): Promise<void> {
    const messages = this.getStalledProgressMessage(context);
    await assistantSupabase.createAutoNudge(userId, messages.message, {
      ...context,
      action_type: 'stall_recovery',
      auto_generated: true
    });
  }

  private getStalledProgressMessage(context: ProgressContext): { message: string } {
    const { role, currentStep, completionPercentage } = context;

    if (role === 'family') {
      if (completionPercentage < 30) {
        return {
          message: "I noticed you started setting up care for your loved one but haven't finished. Would you like me to help you continue where you left off?"
        };
      } else if (completionPercentage < 70) {
        return {
          message: `You're ${completionPercentage}% through your care journey. Let me help you complete the next step: ${currentStep}.`
        };
      } else {
        return {
          message: "You're almost done setting up care! Just one more step and you'll be ready to connect with caregivers."
        };
      }
    } else if (role === 'professional') {
      return {
        message: "Your professional profile is partially complete. Finishing it will help families find you faster. Would you like help with the next step?"
      };
    }

    return {
      message: "I'm here to help you continue your Tavara journey. What would you like to work on today?"
    };
  }

  updateUserActivity(userId: string): void {
    localStorage.setItem(`last_activity_${userId}`, Date.now().toString());
  }

  startMonitoring(userId: string, progressContext: ProgressContext): void {
    if (this.stallCheckInterval) {
      clearInterval(this.stallCheckInterval);
    }

    // Check every hour for stalled progress
    this.stallCheckInterval = setInterval(() => {
      this.checkForStalledProgress(userId, progressContext);
    }, 60 * 60 * 1000);
  }

  stopMonitoring(): void {
    if (this.stallCheckInterval) {
      clearInterval(this.stallCheckInterval);
      this.stallCheckInterval = null;
    }
  }
}
