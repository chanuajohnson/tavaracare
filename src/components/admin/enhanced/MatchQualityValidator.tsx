import { supabase } from '@/integrations/supabase/client';

interface MatchValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export class MatchQualityValidator {
  static async validateMatch(
    familyId: string,
    caregiverId: string,
    minScore: number = 60,
    allowOverride: boolean = false
  ): Promise<MatchValidationResult> {
    const result: MatchValidationResult = {
      isValid: true,
      score: 0,
      issues: [],
      recommendations: []
    };

    try {
      // Fetch family profile and care needs
      const [familyResult, careNeedsResult, caregiverResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, care_types, special_needs, care_schedule, address')
          .eq('id', familyId)
          .single(),
        supabase
          .from('care_needs_family')
          .select('*')
          .eq('profile_id', familyId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('id, full_name, care_types, address, available_for_matching')
          .eq('id', caregiverId)
          .single()
      ]);

      const family = familyResult.data;
      const careNeeds = careNeedsResult.data;
      const caregiver = caregiverResult.data;

      if (!family || !caregiver) {
        result.isValid = false;
        result.issues.push('Family or caregiver not found');
        return result;
      }

      // Check caregiver availability
      if (!caregiver.available_for_matching) {
        result.isValid = false;
        result.issues.push('Caregiver is not available for matching');
      }

      // Check care type compatibility
      const careTypeScore = this.validateCareTypes(family, caregiver, careNeeds);
      if (careTypeScore < 50) {
        result.issues.push('Low care type compatibility');
      }

      // Check schedule compatibility
      const scheduleScore = this.validateSchedule(family, caregiver);
      if (scheduleScore < 50) {
        result.issues.push('Poor schedule compatibility');
      }

      // Check geographic feasibility
      const geoScore = this.validateGeography(family, caregiver);
      if (geoScore < 40) {
        result.issues.push('Geographic distance may be challenging');
      }

      // Check caregiver workload
      const workloadScore = await this.validateWorkload(caregiverId);
      if (workloadScore < 50) {
        result.issues.push('Caregiver may be overloaded');
      }

      // Calculate overall score
      result.score = Math.round(
        (careTypeScore * 0.3) +
        (scheduleScore * 0.3) +
        (geoScore * 0.2) +
        (workloadScore * 0.2)
      );

      // Check if score meets minimum threshold
      if (result.score < minScore) {
        result.isValid = false;
        result.issues.push(`Match score (${result.score}%) below minimum threshold (${minScore}%)`);
      }

      // Generate recommendations
      result.recommendations = this.generateRecommendations(
        result.score,
        careTypeScore,
        scheduleScore,
        geoScore,
        workloadScore
      );

      // Final validation - allow override for manual matches
      if (result.issues.length > 0 && !allowOverride) {
        result.isValid = false;
      } else if (allowOverride && result.issues.length > 0) {
        // For override cases, mark as valid but keep the issues as warnings
        result.isValid = true;
        result.recommendations.unshift('⚠️ This match was manually overridden despite validation issues');
      }

    } catch (error) {
      console.error('Error validating match:', error);
      result.isValid = false;
      result.issues.push('Error occurred during validation');
    }

    return result;
  }

  private static validateCareTypes(
    family: any,
    caregiver: any,
    careNeeds: any
  ): number {
    const familyCareTypes = this.parseCareTypes(family.care_types);
    const caregiverTypes = this.parseCareTypes(caregiver.care_types);
    
    if (familyCareTypes.length === 0 || caregiverTypes.length === 0) {
      return 70; // Default score when data is missing
    }

    const matches = familyCareTypes.filter(type => caregiverTypes.includes(type));
    const score = (matches.length / familyCareTypes.length) * 100;

    return Math.round(score);
  }

  private static validateSchedule(family: any, caregiver: any): number {
    const familySchedule = this.parseSchedule(family.care_schedule);
    const caregiverSchedule = this.parseSchedule(caregiver.availability_schedule);

    if (familySchedule.length === 0 || caregiverSchedule.length === 0) {
      return 60; // Default score when schedule data is missing
    }

    // Check for flexible or 24/7 availability
    if (caregiverSchedule.includes('flexible') || caregiverSchedule.includes('24_7_care')) {
      return 95;
    }

    const matches = familySchedule.filter(shift => caregiverSchedule.includes(shift));
    const score = (matches.length / familySchedule.length) * 100;

    return Math.round(score);
  }

  private static validateGeography(family: any, caregiver: any): number {
    // Placeholder for geographic validation
    // In a real implementation, this would use geolocation services
    if (!family.address || !caregiver.address) {
      return 70; // Default score when address data is missing
    }

    // Simple check - if both have addresses, assume reasonable proximity
    // This would be enhanced with actual distance calculation
    return 75;
  }

  private static async validateWorkload(caregiverId: string): Promise<number> {
    try {
      const { data: activeAssignments } = await supabase
        .from('manual_caregiver_assignments')
        .select('id')
        .eq('caregiver_id', caregiverId)
        .eq('is_active', true);

      const assignmentCount = activeAssignments?.length || 0;
      const maxAssignments = 5; // Configurable limit

      if (assignmentCount >= maxAssignments) {
        return 0; // Overloaded
      }

      // Higher score for caregivers with fewer assignments
      const score = ((maxAssignments - assignmentCount) / maxAssignments) * 100;
      return Math.round(score);
    } catch (error) {
      console.error('Error checking workload:', error);
      return 50; // Default score on error
    }
  }

  private static generateRecommendations(
    overallScore: number,
    careTypeScore: number,
    scheduleScore: number,
    geoScore: number,
    workloadScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('Consider finding a better match with higher compatibility');
    }

    if (careTypeScore < 60) {
      recommendations.push('Verify caregiver has necessary skills for required care types');
    }

    if (scheduleScore < 60) {
      recommendations.push('Discuss schedule flexibility with both parties');
    }

    if (geoScore < 50) {
      recommendations.push('Consider transportation arrangements or closer alternatives');
    }

    if (workloadScore < 50) {
      recommendations.push('Caregiver may be overloaded - consider workload distribution');
    }

    if (recommendations.length === 0) {
      recommendations.push('This appears to be a good match - proceed with confidence');
    }

    return recommendations;
  }

  private static parseCareTypes(careTypes: any): string[] {
    if (!careTypes) return [];
    if (typeof careTypes === 'string') {
      try {
        return JSON.parse(careTypes);
      } catch {
        return careTypes.split(',').map(s => s.trim());
      }
    }
    if (Array.isArray(careTypes)) return careTypes;
    return [];
  }

  private static parseSchedule(schedule: any): string[] {
    if (!schedule) return [];
    if (typeof schedule === 'string') {
      try {
        return JSON.parse(schedule);
      } catch {
        return schedule.split(',').map(s => s.trim());
      }
    }
    if (Array.isArray(schedule)) return schedule;
    return [];
  }
}