export interface FieldCompletionStatus {
  totalFields: number;
  filledFields: number;
  emptyFields: number;
  completionPercentage: number;
}

export interface TrackedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  name: string;
  type: string;
  isFilled: boolean;
  isRequired: boolean;
}

export class FormFieldTracker {
  private static instance: FormFieldTracker;
  private observers: MutationObserver[] = [];
  private changeListeners: Map<HTMLElement, () => void> = new Map();

  static getInstance(): FormFieldTracker {
    if (!FormFieldTracker.instance) {
      FormFieldTracker.instance = new FormFieldTracker();
    }
    return FormFieldTracker.instance;
  }

  /**
   * Scan all forms on the page and return completion status
   */
  scanFormFields(): FieldCompletionStatus {
    const forms = document.querySelectorAll('form');
    let allFields: TrackedField[] = [];

    forms.forEach(form => {
      const fields = this.getFormFields(form);
      allFields = [...allFields, ...fields];
    });

    return this.calculateCompletionStatus(allFields);
  }

  /**
   * Scan a specific form and return completion status
   */
  scanSpecificForm(formElement: HTMLFormElement): FieldCompletionStatus {
    const fields = this.getFormFields(formElement);
    return this.calculateCompletionStatus(fields);
  }

  /**
   * Get all trackable fields from a form
   */
  private getFormFields(form: HTMLFormElement): TrackedField[] {
    const fields: TrackedField[] = [];
    
    // Get all input, textarea, and select elements
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(element => {
      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      // Skip certain input types that shouldn't be tracked
      if (this.shouldSkipField(input)) {
        return;
      }

      const field: TrackedField = {
        element: input,
        name: input.name || input.id || '',
        type: input.type || 'text',
        isFilled: this.isFieldFilled(input),
        isRequired: input.hasAttribute('required')
      };

      fields.push(field);
    });

    return fields;
  }

  /**
   * Check if a field should be skipped from tracking
   */
  private shouldSkipField(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    // Skip hidden inputs, buttons, submit inputs, etc.
    const skipTypes = ['hidden', 'submit', 'button', 'reset', 'image'];
    
    if ('type' in input && skipTypes.includes(input.type)) {
      return true;
    }

    // Skip disabled fields
    if (input.disabled) {
      return true;
    }

    // Skip fields that are not visible
    if (input.style.display === 'none' || input.style.visibility === 'hidden') {
      return true;
    }

    // Skip navigation, search, and UI elements by class names and IDs
    const skipClasses = ['search', 'filter', 'nav', 'menu', 'header', 'footer', 'sidebar'];
    const skipIds = ['search', 'filter', 'nav', 'menu'];
    const className = input.className.toLowerCase();
    const id = input.id.toLowerCase();
    
    if (skipClasses.some(cls => className.includes(cls)) || skipIds.some(skipId => id.includes(skipId))) {
      return true;
    }

    // Skip email fields that are disabled or read-only (like pre-filled user email)
    if (input.type === 'email' && (input.readOnly || input.disabled)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a field is filled
   */
  private isFieldFilled(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    if (input instanceof HTMLSelectElement) {
      return input.selectedIndex > 0 || (input.selectedIndex === 0 && input.options[0].value !== '');
    }

    if (input.type === 'checkbox' || input.type === 'radio') {
      return (input as HTMLInputElement).checked;
    }

    if (input.type === 'file') {
      return (input as HTMLInputElement).files?.length > 0;
    }

    return input.value.trim() !== '';
  }

  /**
   * Calculate completion status from tracked fields
   */
  private calculateCompletionStatus(fields: TrackedField[]): FieldCompletionStatus {
    const totalFields = fields.length;
    const filledFields = fields.filter(field => field.isFilled).length;
    const emptyFields = totalFields - filledFields;
    const completionPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    return {
      totalFields,
      filledFields,
      emptyFields,
      completionPercentage
    };
  }

  /**
   * Watch for changes in form fields and call callback when completion status changes
   */
  watchFormChanges(callback: (status: FieldCompletionStatus) => void): () => void {
    // Initial scan
    let lastStatus = this.scanFormFields();
    callback(lastStatus);

    // Set up mutation observer to detect new forms
    const observer = new MutationObserver(() => {
      const newStatus = this.scanFormFields();
      if (this.hasStatusChanged(lastStatus, newStatus)) {
        lastStatus = newStatus;
        callback(newStatus);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);

    // Set up change listeners for existing forms
    this.setupChangeListeners(callback);

    // Return cleanup function
    return () => {
      observer.disconnect();
      this.observers = this.observers.filter(obs => obs !== observer);
      this.cleanupChangeListeners();
    };
  }

  /**
   * Set up change listeners for form inputs
   */
  private setupChangeListeners(callback: (status: FieldCompletionStatus) => void): void {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const listener = () => {
        const status = this.scanFormFields();
        callback(status);
      };

      form.addEventListener('input', listener);
      form.addEventListener('change', listener);
      this.changeListeners.set(form, listener);
    });
  }

  /**
   * Clean up change listeners
   */
  private cleanupChangeListeners(): void {
    this.changeListeners.forEach((listener, form) => {
      form.removeEventListener('input', listener);
      form.removeEventListener('change', listener);
    });
    this.changeListeners.clear();
  }

  /**
   * Check if completion status has meaningfully changed
   */
  private hasStatusChanged(oldStatus: FieldCompletionStatus, newStatus: FieldCompletionStatus): boolean {
    return oldStatus.totalFields !== newStatus.totalFields ||
           oldStatus.filledFields !== newStatus.filledFields;
  }

  /**
   * Format completion status for display
   */
  formatCompletionStatus(status: FieldCompletionStatus): string {
    if (status.totalFields === 0) {
      return "No form fields detected";
    }

    if (status.filledFields === 0) {
      return `${status.totalFields} fields to complete`;
    }

    if (status.filledFields === status.totalFields) {
      return `All ${status.totalFields} fields completed`;
    }

    return `${status.filledFields} of ${status.totalFields} fields completed`;
  }

  /**
   * Cleanup all observers and listeners
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.cleanupChangeListeners();
  }
}

// Export singleton instance
export const formFieldTracker = FormFieldTracker.getInstance();