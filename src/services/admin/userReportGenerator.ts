import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { ComprehensiveUserData } from '@/hooks/admin/useComprehensiveUserData';

export interface ReportOptions {
  anonymous: boolean;
  includePersonalDetails: boolean;
  includeAssessmentData: boolean;
  includeChatHistory: boolean;
}

// Helper functions for data formatting
const formatCareSchedule = (careSchedule: string | null): string => {
  if (!careSchedule) return 'Not specified';
  
  const scheduleMap: Record<string, string> = {
    'mon_fri_8am_4pm': 'Monday-Friday, 8:00 AM - 4:00 PM',
    'mon_fri_8am_6pm': 'Monday-Friday, 8:00 AM - 6:00 PM', 
    'mon_fri_6am_6pm': 'Monday-Friday, 6:00 AM - 6:00 PM',
    'sat_sun_6am_6pm': 'Saturday-Sunday, 6:00 AM - 6:00 PM',
    'sat_sun_8am_4pm': 'Saturday-Sunday, 8:00 AM - 4:00 PM',
    'weekday_evening_4pm_6am': 'Weekday Evening, 4:00 PM - 6:00 AM',
    'weekday_evening_4pm_8am': 'Weekday Evening, 4:00 PM - 8:00 AM',
    'weekday_evening_5pm_5am': 'Weekday Evening, 5:00 PM - 5:00 AM',
    'weekday_evening_5pm_8am': 'Weekday Evening, 5:00 PM - 8:00 AM',
    'weekday_evening_6pm_6am': 'Weekday Evening, 6:00 PM - 6:00 AM',
    'weekday_evening_6pm_8am': 'Weekday Evening, 6:00 PM - 8:00 AM',
    'weekend_evening_4pm_6am': 'Weekend Evening, 4:00 PM - 6:00 AM',
    'weekend_evening_6pm_6am': 'Weekend Evening, 6:00 PM - 6:00 AM',
    'flexible': 'Flexible/On-Demand',
    'live_in_care': 'Live-In Care',
    '24_7_care': '24/7 Care',
    'around_clock_shifts': 'Around-the-Clock Shifts',
    'other': 'Custom Schedule'
  };

  const schedules = careSchedule.split(',').map(s => s.trim());
  return schedules.map(s => scheduleMap[s] || s).join(', ');
};

const formatArray = (arr: any[] | null | undefined, fallback: string = 'None specified'): string => {
  if (!arr || arr.length === 0) return fallback;
  return arr.join(', ');
};

const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return 'Not specified';
  return value ? 'Yes' : 'No';
};

const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return 'Not specified';
  return `$${value.toFixed(2)}`;
};

const formatBudget = (budget: string | null | undefined): string => {
  if (!budget) return 'Not specified';
  const budgetMap: Record<string, string> = {
    'under_15': 'Under $15/hour',
    '15_20': '$15-$20/hour',
    '20_25': '$20-$25/hour',
    '25_30': '$25-$30/hour',
    '30_plus': '$30+/hour',
    'not_sure': 'To be discussed',
  };
  return budgetMap[budget] || budget;
};

const formatSpecialNeeds = (needs: string[] | null | undefined): string => {
  if (!needs || needs.length === 0) return 'None specified';
  const needsMap: Record<string, string> = {
    'dementia': "Dementia/Alzheimer's",
    'parkinsons': "Parkinson's Disease",
    'diabetes': 'Diabetes',
    'stroke_recovery': 'Stroke Recovery',
    'cancer_care': 'Cancer Care',
    'heart_disease': 'Heart Disease',
    'respiratory_issues': 'Respiratory Issues',
    'mobility_limitations': 'Mobility Limitations',
    'wound_care': 'Wound Care',
    'incontinence': 'Incontinence',
    'other': 'Other (see notes)',
  };
  return needs.map(n => needsMap[n] || n).join(', ');
};

const formatCareTypes = (types: string[] | null | undefined): string => {
  if (!types || types.length === 0) return 'None specified';
  const typeMap: Record<string, string> = {
    'personal_care': 'Personal Care (bathing, dressing, toileting)',
    'medication_management': 'Medication Management',
    'mobility_assistance': 'Mobility Assistance',
    'meal_preparation': 'Meal Preparation',
    'housekeeping': 'Light Housekeeping',
    'transportation': 'Transportation',
    'companionship': 'Companionship',
    'specialized_care': 'Specialized Medical Care',
  };
  return types.map(t => typeMap[t] || t).join(', ');
};

const formatCaregiverType = (type: string | null | undefined): string => {
  if (!type) return 'Not specified';
  const typeMap: Record<string, string> = {
    'professional': 'Professional Caregiver (trained, experienced)',
    'nurse': 'Nurse (RN or LPN)',
    'companion': 'Companion Caregiver (non-medical)',
    'specialized': 'Specialized Care Provider',
    'no_preference': 'No specific preference',
  };
  return typeMap[type] || type;
};

/**
 * Extract general location from a full address.
 */
const extractGeneralLocation = (address: string | null | undefined): string => {
  if (!address) return 'Not specified';
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) return address;
  return parts.slice(-2).join(', ');
};

/**
 * Collect care tasks into categorized groups for better readability
 */
const collectCategorizedCareTasks = (careNeeds: any): { category: string; tasks: string[] }[] => {
  if (!careNeeds) return [];
  
  const categories: { category: string; tasks: string[] }[] = [];

  // Personal Care
  const personalCare: string[] = [];
  if (careNeeds.assistance_bathing) personalCare.push('Bathing');
  if (careNeeds.assistance_dressing) personalCare.push('Dressing');
  if (careNeeds.assistance_toileting) personalCare.push('Toileting');
  if (careNeeds.assistance_oral_care) personalCare.push('Oral Care');
  if (careNeeds.assistance_feeding) personalCare.push('Feeding');
  if (careNeeds.assistance_naps) personalCare.push('Nap Assistance');
  if (personalCare.length > 0) categories.push({ category: 'Personal Care', tasks: personalCare });

  // Medical & Health
  const medical: string[] = [];
  if (careNeeds.assistance_medication) medical.push('Medication Management');
  if (careNeeds.vitals_check) medical.push('Vitals Monitoring');
  if (careNeeds.equipment_use) medical.push('Medical Equipment Use');
  if (careNeeds.fall_monitoring) medical.push('Fall Risk Monitoring');
  if (careNeeds.daily_report_required) medical.push('Daily Health Report Required');
  if (medical.length > 0) categories.push({ category: 'Medical & Health Monitoring', tasks: medical });

  // Cognitive & Behavioral
  const cognitive: string[] = [];
  if (careNeeds.memory_reminders) cognitive.push('Memory Reminders');
  if (careNeeds.dementia_redirection) cognitive.push('Dementia Redirection');
  if (careNeeds.gentle_engagement) cognitive.push('Gentle Engagement Activities');
  if (careNeeds.wandering_prevention) cognitive.push('Wandering Prevention');
  if (cognitive.length > 0) categories.push({ category: 'Cognitive & Behavioral Support', tasks: cognitive });

  // Mobility
  const mobility: string[] = [];
  if (careNeeds.assistance_mobility) mobility.push('Mobility Assistance');
  if (careNeeds.escort_to_appointments) mobility.push('Escort to Appointments');
  if (careNeeds.fresh_air_walks) mobility.push('Outdoor Walks / Fresh Air');
  if (mobility.length > 0) categories.push({ category: 'Mobility & Transportation', tasks: mobility });

  // Household
  const household: string[] = [];
  if (careNeeds.tidy_room) household.push('Room Tidying');
  if (careNeeds.laundry_support) household.push('Laundry');
  if (careNeeds.grocery_runs) household.push('Grocery Runs');
  if (careNeeds.meal_prep) household.push('Meal Preparation');
  if (household.length > 0) categories.push({ category: 'Household & Meals', tasks: household });

  // Companionship
  const companionship: string[] = [];
  if (careNeeds.assistance_companionship) companionship.push('Companionship');
  if (companionship.length > 0) categories.push({ category: 'Companionship', tasks: companionship });

  return categories;
};

/** Flat list for summary */
const collectCareTasksList = (careNeeds: any): string => {
  const categories = collectCategorizedCareTasks(careNeeds);
  const allTasks = categories.flatMap(c => c.tasks);
  return allTasks.length > 0 ? allTasks.join(', ') : 'None specified';
};

export const generateUserReportPDF = async (
  userData: ComprehensiveUserData,
  options: ReportOptions = {
    anonymous: false,
    includePersonalDetails: true,
    includeAssessmentData: true,
    includeChatHistory: true
  }
): Promise<Blob> => {
  const doc = new jsPDF();
  const { profile, careNeeds, careRecipient, chatbotResponses } = userData;
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('Tavara Care - User Report', margin, yPosition);
  yPosition += 10;

  if (options.anonymous) {
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text('ANONYMOUS REPORT - Personal details removed', margin, yPosition);
    yPosition += 5;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, margin, yPosition);
  yPosition += 15;

  // ===== CARE OPPORTUNITY SUMMARY (anonymous, family only) =====
  if (options.anonymous && profile.role === 'family') {
    checkPageBreak(60);
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text('Care Opportunity Summary', margin, yPosition);
    yPosition += 10;

    const summaryData: Array<[string, string]> = [];
    
    summaryData.push(['General Location', extractGeneralLocation(profile.address || careNeeds?.care_location)]);
    summaryData.push(['Relationship to Recipient', profile.relationship || 'Not specified']);
    
    // Care recipient demographics from care_recipient_profiles
    if (careRecipient?.birth_year) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(careRecipient.birth_year);
      const approxAge = !isNaN(birthYear) ? `~${currentYear - birthYear} years old (born ${birthYear})` : careRecipient.birth_year;
      summaryData.push(['Care Recipient Age', approxAge]);
    }
    
    summaryData.push(['Care Types Needed', formatCareTypes(profile.care_types)]);
    summaryData.push(['Care Schedule', formatCareSchedule(profile.care_schedule)]);
    
    // Medical conditions
    if (careNeeds?.diagnosed_conditions) {
      summaryData.push(['Diagnosed Conditions', careNeeds.diagnosed_conditions]);
    }
    if (careNeeds?.known_allergies) {
      summaryData.push(['Known Allergies', careNeeds.known_allergies]);
    }
    if (careNeeds?.chronic_illness_type) {
      summaryData.push(['Chronic Illness', careNeeds.chronic_illness_type]);
    }
    
    summaryData.push(['Special Needs / Conditions', formatSpecialNeeds(profile.special_needs)]);
    summaryData.push(['Assistance Required', collectCareTasksList(careNeeds)]);
    summaryData.push(['Budget Range', formatBudget(profile.budget_preferences)]);
    summaryData.push(['Caregiver Type Preferred', formatCaregiverType(profile.caregiver_type)]);
    
    if (profile.caregiver_preferences) {
      summaryData.push(['Caregiver Preferences', profile.caregiver_preferences]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Care Opportunity', 'Details']],
      body: summaryData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== DETAILED CARE TASKS BY CATEGORY =====
  if (profile.role === 'family' && careNeeds && options.includeAssessmentData) {
    const categorizedTasks = collectCategorizedCareTasks(careNeeds);
    
    if (categorizedTasks.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Detailed Care Tasks Required', margin, yPosition);
      yPosition += 10;

      const taskRows: Array<[string, string]> = [];
      categorizedTasks.forEach(({ category, tasks }) => {
        taskRows.push([category, tasks.join(', ')]);
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Care Category', 'Tasks']],
        body: taskRows,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
          1: { cellWidth: contentWidth * 0.70 }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== MEDICAL & CLINICAL DETAILS =====
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38);
    doc.text('Medical & Clinical Information', margin, yPosition);
    yPosition += 10;

    const medicalData: Array<[string, string]> = [];
    medicalData.push(['Diagnosed Conditions', careNeeds.diagnosed_conditions || 'None reported']);
    medicalData.push(['Known Allergies', careNeeds.known_allergies || 'None reported']);
    medicalData.push(['Chronic Illness Type', careNeeds.chronic_illness_type || 'None reported']);
    medicalData.push(['Equipment Use Required', formatBoolean(careNeeds.equipment_use)]);
    medicalData.push(['Fall Monitoring Needed', formatBoolean(careNeeds.fall_monitoring)]);
    medicalData.push(['Vitals Check Required', formatBoolean(careNeeds.vitals_check)]);
    medicalData.push(['Daily Health Report', formatBoolean(careNeeds.daily_report_required)]);
    medicalData.push(['Emergency Plan', careNeeds.emergency_plan || 'Not specified']);

    autoTable(doc, {
      startY: yPosition,
      head: [['Medical Item', 'Details']],
      body: medicalData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [220, 38, 38] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ===== COGNITIVE & BEHAVIORAL NOTES =====
    const hasCognitiveData = careNeeds.cognitive_notes || careNeeds.triggers_soothing_techniques || 
      careNeeds.dementia_redirection || careNeeds.memory_reminders || careNeeds.wandering_prevention;
    
    if (hasCognitiveData) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(147, 51, 234);
      doc.text('Cognitive & Behavioral Profile', margin, yPosition);
      yPosition += 10;

      const cognitiveData: Array<[string, string]> = [];
      cognitiveData.push(['Memory Reminders Needed', formatBoolean(careNeeds.memory_reminders)]);
      cognitiveData.push(['Dementia Redirection', formatBoolean(careNeeds.dementia_redirection)]);
      cognitiveData.push(['Wandering Prevention', formatBoolean(careNeeds.wandering_prevention)]);
      cognitiveData.push(['Gentle Engagement', formatBoolean(careNeeds.gentle_engagement)]);
      if (careNeeds.cognitive_notes) {
        cognitiveData.push(['Cognitive Notes', careNeeds.cognitive_notes]);
      }
      if (careNeeds.triggers_soothing_techniques) {
        cognitiveData.push(['Triggers & Soothing Techniques', careNeeds.triggers_soothing_techniques]);
      }

      autoTable(doc, {
        startY: yPosition,
        head: [['Cognitive Item', 'Details']],
        body: cognitiveData,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [147, 51, 234] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
          1: { cellWidth: contentWidth * 0.70 }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== SCHEDULE & COVERAGE =====
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Schedule & Coverage Details', margin, yPosition);
    yPosition += 10;

    const scheduleData: Array<[string, string]> = [];
    scheduleData.push(['Care Schedule', formatCareSchedule(profile.care_schedule)]);
    if (profile.custom_schedule) {
      scheduleData.push(['Custom Schedule Notes', profile.custom_schedule]);
    }
    scheduleData.push(['Care Plan Type', careNeeds.plan_type || 'Not specified']);
    scheduleData.push(['Weekday Coverage', careNeeds.weekday_coverage || 'Not specified']);
    scheduleData.push(['Weekend Coverage', careNeeds.weekend_coverage || 'Not specified']);
    if (careNeeds.weekend_schedule_type && careNeeds.weekend_schedule_type !== 'none') {
      scheduleData.push(['Weekend Schedule Type', careNeeds.weekend_schedule_type]);
    }
    if (careNeeds.preferred_days?.length > 0) {
      scheduleData.push(['Preferred Days', careNeeds.preferred_days.join(', ')]);
    }
    if (careNeeds.preferred_time_start && careNeeds.preferred_time_end) {
      scheduleData.push(['Preferred Hours', `${careNeeds.preferred_time_start} - ${careNeeds.preferred_time_end}`]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Schedule Item', 'Details']],
      body: scheduleData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ===== COMMUNICATION & PREFERENCES =====
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(14, 165, 233);
    doc.text('Communication & Preferences', margin, yPosition);
    yPosition += 10;

    const commData: Array<[string, string]> = [];
    commData.push(['Preferred Communication', careNeeds.communication_method || 'Not specified']);
    commData.push(['Check-in Preference', careNeeds.checkin_preference || 'Not specified']);
    if (careNeeds.cultural_preferences) {
      commData.push(['Cultural Preferences', careNeeds.cultural_preferences]);
    }
    if (careNeeds.care_location) {
      commData.push(['Care Location (Area)', options.anonymous ? extractGeneralLocation(careNeeds.care_location) : careNeeds.care_location]);
    }
    if (careNeeds.additional_notes) {
      commData.push(['Additional Notes', careNeeds.additional_notes]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Preference', 'Details']],
      body: commData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [14, 165, 233] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ===== EMERGENCY & CONTACTS (non-anonymous only) =====
    if (!options.anonymous) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setTextColor(239, 68, 68);
      doc.text('Emergency & Contact Information', margin, yPosition);
      yPosition += 10;

      const contactData: Array<[string, string]> = [];
      if (careNeeds.primary_contact_name) {
        contactData.push(['Primary Contact', careNeeds.primary_contact_name]);
      }
      if (careNeeds.primary_contact_phone) {
        contactData.push(['Primary Contact Phone', careNeeds.primary_contact_phone]);
      }
      if (careNeeds.emergency_contact_name) {
        contactData.push(['Emergency Contact', careNeeds.emergency_contact_name]);
      }
      if (careNeeds.emergency_contact_phone) {
        contactData.push(['Emergency Phone', careNeeds.emergency_contact_phone]);
      }
      if (careNeeds.emergency_contact_relationship) {
        contactData.push(['Emergency Contact Relationship', careNeeds.emergency_contact_relationship]);
      }
      contactData.push(['Emergency Plan', careNeeds.emergency_plan || 'Not specified']);

      if (contactData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Contact Item', 'Details']],
          body: contactData,
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
            1: { cellWidth: contentWidth * 0.70 }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }
  }

  // ===== CARE RECIPIENT PROFILE (Legacy Story) =====
  if (profile.role === 'family' && careRecipient && options.includeAssessmentData) {
    checkPageBreak(40);
    
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text(options.anonymous ? 'Care Recipient Profile (Legacy Story)' : 'Care Recipient Profile', margin, yPosition);
    yPosition += 10;

    const recipientData: Array<[string, string]> = [];
    
    if (!options.anonymous) {
      recipientData.push(['Full Name', careRecipient.full_name || 'Not provided']);
    }
    
    if (careRecipient.birth_year) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(careRecipient.birth_year);
      const approxAge = !isNaN(birthYear) ? `~${currentYear - birthYear} years old (born ${birthYear})` : careRecipient.birth_year;
      recipientData.push(['Age / Birth Year', approxAge]);
    }
    
    if (careRecipient.personality_traits?.length > 0) {
      recipientData.push(['Personality Traits', careRecipient.personality_traits.join(', ')]);
    }
    if (careRecipient.hobbies_interests?.length > 0) {
      recipientData.push(['Hobbies & Interests', careRecipient.hobbies_interests.join(', ')]);
    }
    if (careRecipient.career_fields?.length > 0) {
      recipientData.push(['Career Background', careRecipient.career_fields.join(', ')]);
    }
    if (careRecipient.life_story) {
      recipientData.push(['Life Story', careRecipient.life_story]);
    }
    if (careRecipient.daily_routines) {
      recipientData.push(['Daily Routines', careRecipient.daily_routines]);
    }
    if (careRecipient.joyful_things) {
      recipientData.push(['Things That Bring Joy', careRecipient.joyful_things]);
    }
    if (careRecipient.cultural_preferences) {
      recipientData.push(['Cultural Background', careRecipient.cultural_preferences]);
    }
    if (careRecipient.family_social_info) {
      recipientData.push(['Family & Social Info', careRecipient.family_social_info]);
    }
    if (careRecipient.notable_events) {
      recipientData.push(['Notable Life Events', careRecipient.notable_events]);
    }
    if (careRecipient.unique_facts) {
      recipientData.push(['Unique Facts', careRecipient.unique_facts]);
    }
    if (careRecipient.sensitivities) {
      recipientData.push(['Sensitivities', careRecipient.sensitivities]);
    }
    if (careRecipient.specific_requests) {
      recipientData.push(['Specific Requests', careRecipient.specific_requests]);
    }
    if (careRecipient.challenges?.length > 0) {
      recipientData.push(['Challenges', careRecipient.challenges.join(', ')]);
    }
    if (careRecipient.caregiver_personality?.length > 0) {
      recipientData.push(['Preferred Caregiver Personality', careRecipient.caregiver_personality.join(', ')]);
    }

    if (recipientData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Profile Item', 'Details']],
        body: recipientData,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
          1: { cellWidth: contentWidth * 0.70 }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // ===== BASIC INFORMATION =====
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Basic Information', margin, yPosition);
  yPosition += 10;

  const basicInfo: Array<[string, string]> = [];
  
  if (options.includePersonalDetails && !options.anonymous) {
    basicInfo.push(['Full Name', profile.full_name || 'Not provided']);
    basicInfo.push(['Email', profile.email || 'Not provided']);
    basicInfo.push(['Phone', profile.phone_number || 'Not provided']);
    basicInfo.push(['Address', profile.address || 'Not provided']);
  } else {
    basicInfo.push(['User ID', profile.id]);
    basicInfo.push(['General Location', extractGeneralLocation(profile.address || careNeeds?.care_location)]);
  }
  
  basicInfo.push(['Role', profile.role || 'Not specified']);
  basicInfo.push(['Registration Date', profile.created_at ? format(new Date(profile.created_at), 'PPP') : 'Unknown']);
  basicInfo.push(['Last Updated', profile.updated_at ? format(new Date(profile.updated_at), 'PPP') : 'Unknown']);
  basicInfo.push(['Preferred Contact Method', profile.preferred_contact_method || 'Not specified']);
  basicInfo.push(['Care Hours', formatCareSchedule(profile.care_schedule)]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: basicInfo,
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
      1: { cellWidth: contentWidth * 0.70 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ===== FAMILY PROFILE DETAILS =====
  if (profile.role === 'family') {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.text('Family Profile Details', margin, yPosition);
    yPosition += 10;

    const familyDetails: Array<[string, string]> = [];
    
    if (!options.anonymous) {
      familyDetails.push(['Care Recipient', profile.care_recipient_name || 'Not provided']);
    }
    familyDetails.push(['Relationship to Recipient', profile.relationship || 'Not provided']);
    familyDetails.push(['Care Types', formatCareTypes(profile.care_types)]);
    familyDetails.push(['Special Needs / Conditions', formatSpecialNeeds(profile.special_needs)]);
    familyDetails.push(['Budget Range', formatBudget(profile.budget_preferences)]);
    familyDetails.push(['Caregiver Type Preferred', formatCaregiverType(profile.caregiver_type)]);
    familyDetails.push(['Caregiver Preferences', profile.caregiver_preferences || 'Not specified']);
    familyDetails.push(['Custom Care Schedule', profile.custom_schedule || 'Not specified']);
    familyDetails.push(['Additional Notes', profile.additional_notes || 'None provided']);

    autoTable(doc, {
      startY: yPosition,
      head: [['Family Profile', 'Details']],
      body: familyDetails,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== PROFESSIONAL SECTION =====
  if (profile.role === 'professional') {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.text('Professional Capabilities & Services', margin, yPosition);
    yPosition += 10;

    const professionalDetails: Array<[string, string]> = [];
    
    if (!options.anonymous) {
      professionalDetails.push(['Years of Experience', profile.years_of_experience?.toString() || 'Not provided']);
      professionalDetails.push(['Bio', profile.bio || 'Not provided']);
    }
    
    professionalDetails.push(['Certifications', formatArray(profile.certifications)]);
    professionalDetails.push(['Specializations', formatArray(profile.specializations)]);
    professionalDetails.push(['Languages', formatArray(profile.languages)]);
    professionalDetails.push(['Care Services', formatArray(profile.care_services)]);
    professionalDetails.push(['Care Types', formatArray(profile.care_types)]);
    professionalDetails.push(['Caregiving Areas', formatArray(profile.caregiving_areas)]);
    professionalDetails.push(['Professional Type', profile.professional_type || 'Not specified']);
    professionalDetails.push(['Caregiver Type', profile.caregiver_type || 'Not specified']);
    
    professionalDetails.push(['Housekeeping Available', formatBoolean(profile.housekeeping_available)]);
    professionalDetails.push(['Transportation Available', formatBoolean(profile.transportation_available)]);
    professionalDetails.push(['Meal Preparation Available', formatBoolean(profile.meal_preparation_available)]);
    professionalDetails.push(['Personal Care Available', formatBoolean(profile.personal_care_available)]);
    professionalDetails.push(['Companionship Available', formatBoolean(profile.companionship_available)]);
    
    professionalDetails.push(['Work Locations', formatArray(profile.work_locations)]);
    professionalDetails.push(['Video Available', formatBoolean(profile.video_available)]);
    professionalDetails.push(['Available for Matching', formatBoolean(profile.available_for_matching)]);
    
    if (!options.anonymous) {
      professionalDetails.push(['Expected Hourly Rate', formatCurrency(profile.expected_hourly_rate)]);
      professionalDetails.push(['Years Experience', profile.years_experience?.toString() || 'Not specified']);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Professional Details', 'Information']],
      body: professionalDetails,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== ADMINISTRATIVE STATUS =====
  if (!options.anonymous) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.text('Administrative Status', margin, yPosition);
    yPosition += 10;

    const adminStatus: Array<[string, string]> = [];
    
    adminStatus.push(['Visit Payment Status', profile.visit_payment_status || 'Not specified']);
    adminStatus.push(['Visit Type Preference', profile.visit_type_preference || 'Not specified']);
    adminStatus.push(['Ready for Admin Scheduling', formatBoolean(profile.ready_for_admin_scheduling)]);
    adminStatus.push(['Background Check Completed', formatBoolean(profile.background_check_completed)]);
    adminStatus.push(['Visit Payment Reference', profile.visit_payment_reference || 'Not specified']);
    
    if (profile.admin_visit_scheduled_date) {
      adminStatus.push(['Admin Visit Scheduled', format(new Date(profile.admin_visit_scheduled_date), 'PPP')]);
    }
    if (profile.last_login_at) {
      adminStatus.push(['Last Login', format(new Date(profile.last_login_at), 'PPP')]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Administrative Item', 'Status']],
      body: adminStatus,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.30, fontStyle: 'bold' },
        1: { cellWidth: contentWidth * 0.70 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== CHAT HISTORY SUMMARY =====
  if (chatbotResponses.length > 0 && options.includeChatHistory) {
    checkPageBreak(40);
    
    doc.setFontSize(16);
    doc.text('Chat History Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Total chat responses: ${chatbotResponses.length}`, margin, yPosition);
    yPosition += 5;
    
    const firstResponse = chatbotResponses[chatbotResponses.length - 1];
    const lastResponse = chatbotResponses[0];
    
    if (firstResponse) {
      doc.text(`First interaction: ${format(new Date(firstResponse.created_at), 'PPP')}`, margin, yPosition);
      yPosition += 5;
    }
    if (lastResponse) {
      doc.text(`Latest interaction: ${format(new Date(lastResponse.created_at), 'PPP')}`, margin, yPosition);
      yPosition += 10;
    }

    const sectionCounts = chatbotResponses.reduce((acc, response) => {
      acc[response.section] = (acc[response.section] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectionData = Object.entries(sectionCounts).map(([section, count]) => [
      section.replace(/_/g, ' ').toUpperCase(),
      count.toString()
    ]);

    if (sectionData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Section', 'Responses']],
        body: sectionData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [251, 146, 60] },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // Footer
  checkPageBreak(30);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated by Tavara Care Admin System', margin, yPosition);
  doc.text(`Report ID: ${userData.profile.id.substring(0, 8)}`, margin, yPosition + 5);
  
  if (options.anonymous) {
    doc.text('This is an anonymous report with personal details removed', margin, yPosition + 10);
  }

  return doc.output('blob');
};

export const downloadUserReport = async (
  userData: ComprehensiveUserData,
  options: ReportOptions
) => {
  try {
    const pdfBlob = await generateUserReportPDF(userData, options);
    const url = URL.createObjectURL(pdfBlob);
    
    const userName = options.anonymous ? 'Anonymous' : (userData.profile.full_name || 'User');
    const fileName = `Tavara_${userData.profile.role}_${userName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
