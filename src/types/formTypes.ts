
import { UserRole } from './userRoles';

/**
 * Form data interface for Community Registration
 */
export interface CommunityRegistrationFormData {
  communityName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  missionStatement: string;
  servicesOffered: string[];
  website: string;
  socialMediaLinks: string;
  additionalNotes: string;
  termsAndConditions: boolean;
}

/**
 * Form data interface for Family Registration
 */
export interface FamilyRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  terms: boolean;
}

/**
 * Form data interface for Professional Registration
 */
export interface ProfessionalRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  availability: string;
  hourlyRate: string;
  specializations: string[];
  certifications: string;
  backgroundCheck: boolean;
  additionalNotes: string;
}
