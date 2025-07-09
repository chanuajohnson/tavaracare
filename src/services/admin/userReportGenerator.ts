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

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text('Tavara Care - User Report', margin, yPosition);
  yPosition += 10;

  if (options.anonymous) {
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68); // Red warning
    doc.text('⚠️ ANONYMOUS REPORT - Personal details removed', margin, yPosition);
    yPosition += 5;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, margin, yPosition);
  yPosition += 15;

  // Basic Information Section
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
  }
  
  basicInfo.push(['Role', profile.role || 'Not specified']);
  basicInfo.push(['Registration Date', profile.created_at ? format(new Date(profile.created_at), 'PPP') : 'Unknown']);
  basicInfo.push(['Last Updated', profile.updated_at ? format(new Date(profile.updated_at), 'PPP') : 'Unknown']);
  
  if (profile.role === 'family' && !options.anonymous) {
    basicInfo.push(['Care Recipient', profile.care_recipient_name || 'Not provided']);
    basicInfo.push(['Relationship', profile.relationship || 'Not provided']);
  }

  if (profile.role === 'professional') {
    if (!options.anonymous) {
      basicInfo.push(['Years of Experience', profile.years_of_experience?.toString() || 'Not provided']);
    }
    basicInfo.push(['Certifications', profile.certifications?.join(', ') || 'None listed']);
    basicInfo.push(['Specializations', profile.specializations?.join(', ') || 'None listed']);
    basicInfo.push(['Languages', profile.languages?.join(', ') || 'None listed']);
    basicInfo.push(['Available for Matching', profile.available_for_matching ? 'Yes' : 'No']);
  }

  // Add basic info table
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: basicInfo,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Care Assessment Section (for families)
  if (profile.role === 'family' && careNeeds && options.includeAssessmentData) {
    checkPageBreak(40);
    
    doc.setFontSize(16);
    doc.text('Care Assessment Details', margin, yPosition);
    yPosition += 10;

    const careAssessmentData: Array<[string, string]> = [];
    
    // Care needs
    const assistanceTypes = [];
    if (careNeeds.assistance_bathing) assistanceTypes.push('Bathing');
    if (careNeeds.assistance_dressing) assistanceTypes.push('Dressing');
    if (careNeeds.assistance_toileting) assistanceTypes.push('Toileting');
    if (careNeeds.assistance_feeding) assistanceTypes.push('Feeding');
    if (careNeeds.assistance_medication) assistanceTypes.push('Medication');
    if (careNeeds.assistance_mobility) assistanceTypes.push('Mobility');
    if (careNeeds.assistance_companionship) assistanceTypes.push('Companionship');
    
    careAssessmentData.push(['Assistance Needed', assistanceTypes.join(', ') || 'None specified']);
    
    if (careNeeds.preferred_time_start && careNeeds.preferred_time_end) {
      careAssessmentData.push(['Preferred Care Hours', `${careNeeds.preferred_time_start} - ${careNeeds.preferred_time_end}`]);
    }
    
    if (careNeeds.diagnosed_conditions) {
      careAssessmentData.push(['Medical Conditions', careNeeds.diagnosed_conditions]);
    }
    
    if (careNeeds.additional_notes) {
      careAssessmentData.push(['Additional Notes', careNeeds.additional_notes]);
    }

    if (!options.anonymous) {
      if (careNeeds.primary_contact_name) {
        careAssessmentData.push(['Primary Contact', careNeeds.primary_contact_name]);
      }
      if (careNeeds.primary_contact_phone) {
        careAssessmentData.push(['Contact Phone', careNeeds.primary_contact_phone]);
      }
      if (careNeeds.emergency_contact_name) {
        careAssessmentData.push(['Emergency Contact', careNeeds.emergency_contact_name]);
      }
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Assessment Item', 'Details']],
      body: careAssessmentData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: contentWidth * 0.65 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Care Recipient Profile (for families)
  if (profile.role === 'family' && careRecipient && options.includeAssessmentData) {
    checkPageBreak(40);
    
    doc.setFontSize(16);
    doc.text('Care Recipient Profile', margin, yPosition);
    yPosition += 10;

    const recipientData: Array<[string, string]> = [];
    
    if (!options.anonymous) {
      recipientData.push(['Full Name', careRecipient.full_name || 'Not provided']);
    }
    recipientData.push(['Birth Year', careRecipient.birth_year || 'Not provided']);
    recipientData.push(['Personality Traits', careRecipient.personality_traits?.join(', ') || 'None listed']);
    recipientData.push(['Hobbies & Interests', careRecipient.hobbies_interests?.join(', ') || 'None listed']);
    recipientData.push(['Career Background', careRecipient.career_fields?.join(', ') || 'None listed']);
    
    if (careRecipient.life_story) {
      recipientData.push(['Life Story', careRecipient.life_story]);
    }
    if (careRecipient.daily_routines) {
      recipientData.push(['Daily Routines', careRecipient.daily_routines]);
    }
    if (careRecipient.cultural_preferences) {
      recipientData.push(['Cultural Preferences', careRecipient.cultural_preferences]);
    }
    if (careRecipient.challenges?.length > 0) {
      recipientData.push(['Challenges', careRecipient.challenges.join(', ')]);
    }
    if (careRecipient.caregiver_personality?.length > 0) {
      recipientData.push(['Preferred Caregiver Traits', careRecipient.caregiver_personality.join(', ')]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Profile Item', 'Details']],
      body: recipientData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { cellWidth: contentWidth * 0.65 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Chat History Summary
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

    // Group responses by section
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
    doc.text('⚠️ This is an anonymous report with personal details removed', margin, yPosition + 10);
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