
import { Json } from '../utils/json';
import { UserRole } from './userRoles';
import { FamilyProfileFields, DbFamilyProfileFields } from './familyProfileTypes';
import { ProfessionalProfileFields, DbProfessionalProfileFields } from './professionalProfileTypes';
import { CommunityProfileFields, DbCommunityProfileFields } from './communityProfileTypes';

/**
 * Base profile fields shared by all roles
 */
interface BaseProfileFields {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
}

/**
 * Base DB profile fields shared by all roles (snake_case)
 */
interface DbBaseProfileFields {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
}

/**
 * Frontend model for profiles (camelCase)
 */
export interface Profile extends BaseProfileFields, 
  FamilyProfileFields, 
  ProfessionalProfileFields,
  CommunityProfileFields {}

/**
 * Database model for profile inserts (snake_case)
 */
export interface DbProfileInsert extends Omit<DbBaseProfileFields, 'created_at' | 'updated_at'>,
  DbFamilyProfileFields,
  DbProfessionalProfileFields,
  DbCommunityProfileFields {}

/**
 * Database model for profiles (snake_case)
 */
export interface DbProfile extends DbBaseProfileFields,
  DbFamilyProfileFields,
  DbProfessionalProfileFields,
  DbCommunityProfileFields {}

/**
 * Export all types from this file
 */
export * from './userRoles';
export * from './familyProfileTypes';
export * from './professionalProfileTypes';
export * from './communityProfileTypes';
