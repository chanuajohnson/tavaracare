export interface FormSection {
  id: string;
  title: string;
  fields: string[];
  element?: HTMLElement;
}

export interface SectionCompletionStatus {
  sectionId: string;
  sectionTitle: string;
  totalFields: number;
  filledFields: number;
  completionPercentage: number;
  isComplete: boolean;
  isActive: boolean;
}

export interface FormSectionData {
  currentSectionIndex: number;
  currentSection: SectionCompletionStatus | null;
  allSections: SectionCompletionStatus[];
  overallProgress: {
    completedSections: number;
    totalSections: number;
    overallPercentage: number;
  };
}

// Define form sections for different forms
export const FORM_SECTIONS: Record<string, FormSection[]> = {
  'family-registration': [
    {
      id: 'personal-info',
      title: 'Personal & Contact Information',
      fields: ['first_name', 'last_name', 'phone', 'email', 'location', 'address']
    },
    {
      id: 'care-recipient',
      title: 'Care Recipient Information',
      fields: ['careRecipientName', 'relationship']
    },
    {
      id: 'care-needs',
      title: 'Care Needs & Preferences',
      fields: ['careTypes', 'specialNeeds']
    },
    {
      id: 'care-schedule',
      title: 'Care Schedule & Availability',
      fields: ['careSchedule', 'customCareSchedule']
    },
    {
      id: 'budget-preferences',
      title: 'Budget & Caregiver Preferences',
      fields: ['budget', 'caregiverType', 'caregiverPreferences']
    },
    {
      id: 'additional-info',
      title: 'Additional Information',
      fields: ['additionalNotes', 'preferredContactMethod']
    }
  ],
  'professional-registration': [
    {
      id: 'basic-info',
      title: 'Basic Information',
      fields: ['firstName', 'lastName', 'email', 'phoneNumber']
    },
    {
      id: 'professional-details',
      title: 'Professional Details',
      fields: ['professionalType', 'yearsOfExperience', 'certifications']
    },
    {
      id: 'services',
      title: 'Care Services',
      fields: ['careServices', 'specialties']
    }
  ],
  'community-registration': [
    {
      id: 'basic-info',
      title: 'Basic Information',
      fields: ['firstName', 'lastName', 'email']
    },
    {
      id: 'involvement',
      title: 'Community Involvement',
      fields: ['communityMotivation', 'involvementPreferences']
    }
  ]
};

export class SectionBasedFormTracker {
  private static instance: SectionBasedFormTracker;

  static getInstance(): SectionBasedFormTracker {
    if (!SectionBasedFormTracker.instance) {
      SectionBasedFormTracker.instance = new SectionBasedFormTracker();
    }
    return SectionBasedFormTracker.instance;
  }

  /**
   * Get section-based completion status for a form
   */
  getSectionCompletionStatus(formId: string): FormSectionData {
    const sections = FORM_SECTIONS[formId] || [];
    const sectionStatuses: SectionCompletionStatus[] = [];
    const currentSectionIndex = this.detectCurrentSection(sections);

    sections.forEach((section, index) => {
      const completion = this.calculateSectionCompletion(section);
      sectionStatuses.push({
        sectionId: section.id,
        sectionTitle: section.title,
        totalFields: section.fields.length,
        filledFields: completion.filled,
        completionPercentage: completion.percentage,
        isComplete: completion.percentage === 100,
        isActive: index === currentSectionIndex
      });
    });

    const completedSections = sectionStatuses.filter(s => s.isComplete).length;
    const overallPercentage = sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0;

    return {
      currentSectionIndex,
      currentSection: sectionStatuses[currentSectionIndex] || null,
      allSections: sectionStatuses,
      overallProgress: {
        completedSections,
        totalSections: sections.length,
        overallPercentage
      }
    };
  }

  /**
   * Calculate completion for a specific section
   */
  private calculateSectionCompletion(section: FormSection): { filled: number; percentage: number } {
    let filledCount = 0;
    const totalFields = section.fields.length;

    section.fields.forEach(fieldName => {
      const field = this.findFieldByName(fieldName);
      if (field && this.isFieldFilled(field)) {
        filledCount++;
      }
    });

    const percentage = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
    return { filled: filledCount, percentage };
  }

  /**
   * Detect which section the user is currently working on
   */
  private detectCurrentSection(sections: FormSection[]): number {
    // Check for the first incomplete section
    for (let i = 0; i < sections.length; i++) {
      const completion = this.calculateSectionCompletion(sections[i]);
      if (completion.percentage < 100) {
        return i;
      }
    }
    // If all sections are complete, return the last section
    return Math.max(0, sections.length - 1);
  }

  /**
   * Find a form field by name or id
   */
  private findFieldByName(fieldName: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
    // Map field names to actual form field names/IDs
    const fieldMapping: Record<string, string[]> = {
      'first_name': ['firstName', 'first_name'],
      'last_name': ['lastName', 'last_name'],
      'phone': ['phoneNumber', 'phone'],
      'email': ['email'],
      'location': ['location'],
      'address': ['address'],
      'careRecipientName': ['careRecipientName', 'care_recipient_name'],
      'relationship': ['relationship'],
      'careTypes': ['careTypes', 'care_types'],
      'specialNeeds': ['specialNeeds', 'special_needs'],
      'careSchedule': ['careSchedule', 'care_schedule'],
      'customCareSchedule': ['customCareSchedule', 'custom_care_schedule'],
      'budget': ['budget', 'budget_preferences'],
      'caregiverType': ['caregiverType', 'caregiver_type'],
      'caregiverPreferences': ['caregiverPreferences', 'caregiver_preferences'],
      'additionalNotes': ['additionalNotes', 'additional_notes'],
      'preferredContactMethod': ['preferredContactMethod', 'preferred_contact_method']
    };

    // Get possible field names for this field
    const possibleNames = fieldMapping[fieldName] || [fieldName];
    
    // Try multiple selectors to find the field
    for (const name of possibleNames) {
      const selectors = [
        `[name="${name}"]`,
        `[id="${name}"]`
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (element) {
          return element;
        }
      }
    }

    return null;
  }

  /**
   * Check if a field is filled
   */
  private isFieldFilled(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    if (field instanceof HTMLSelectElement) {
      return field.selectedIndex > 0 || (field.selectedIndex === 0 && field.options[0].value !== '');
    }

    if (field.type === 'checkbox' || field.type === 'radio') {
      return (field as HTMLInputElement).checked;
    }

    if (field.type === 'file') {
      return (field as HTMLInputElement).files?.length > 0;
    }

    return field.value.trim() !== '';
  }

  /**
   * Format section progress for display
   */
  formatSectionProgress(sectionData: FormSectionData): string {
    if (!sectionData.currentSection) {
      return "No sections detected";
    }

    const { currentSection } = sectionData;
    return `${currentSection.filledFields} of ${currentSection.totalFields} fields completed (${currentSection.sectionTitle})`;
  }
}

// Export singleton instance
export const sectionBasedFormTracker = SectionBasedFormTracker.getInstance();