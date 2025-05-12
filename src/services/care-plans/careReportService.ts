
import { CarePlan } from "@/types/carePlan";
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { format, isSameDay, startOfWeek, endOfWeek, addDays, parseISO, addWeeks, isBefore, isAfter, isSameWeek, differenceInDays } from 'date-fns';
import { generateSupportReference } from "@/utils/chat/chatSessionUtils";
import { toast } from "sonner";

/**
 * Generate a comprehensive care plan report including plan details, team members, and schedule
 * 
 * @param carePlan The care plan data
 * @param careTeamMembers Team members associated with this care plan
 * @param careShifts All shifts for this care plan
 * @param dateRange The selected date range for the schedule portion
 * @returns A data URL for the generated report
 */
export const generateCareReport = async (
  carePlan: CarePlan,
  careTeamMembers: CareTeamMemberWithProfile[],
  careShifts: CareShift[],
  dateRange: { from: Date, to?: Date } | undefined
): Promise<string> => {
  try {
    const startDate = dateRange?.from || new Date();
    const endDate = dateRange?.to || addDays(startDate, 27); // Default to 4 weeks (28 days) if no end date
    
    // Import jsPDF dynamically to reduce initial bundle size
    const { default: jsPDF } = await import('jspdf');
    // Optional: Import autoTable for better tables if needed
    // const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Generate unique reference code for the report
    const referenceCode = generateSupportReference();
    
    // ---- DOCUMENT HEADER ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(51, 103, 214); // Tavara blue
    doc.text('Tavara Care Report', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 20, 28);
    doc.text(`Reference: ${referenceCode}`, 20, 34);
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 38, 190, 38);
    
    // ---- CARE PLAN DETAILS SECTION ----
    let yPos = 45;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Care Plan Details', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Plan title and description
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Title:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(carePlan.title, 60, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    
    // Handle multi-line description (wrap text)
    const descriptionLines = doc.splitTextToSize(carePlan.description, 130);
    doc.text(descriptionLines, 60, yPos);
    yPos += descriptionLines.length * 7;
    
    // Plan type and coverage
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Type:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(getPlanTypeDisplay(carePlan), 60, yPos);
    yPos += 7;
    
    if (carePlan.metadata?.planType !== 'on-demand') {
      doc.setFont('helvetica', 'bold');
      doc.text('Weekday Coverage:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(carePlan.metadata?.weekdayCoverage || "None", 60, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Weekend Coverage:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(carePlan.metadata?.weekendCoverage === 'yes' ? "Yes (6AM-6PM)" : "None", 60, yPos);
      yPos += 7;
    }
    
    // Add additional shifts if any
    if (carePlan.metadata?.additionalShifts) {
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Shifts:', 20, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      const shifts = [];
      if (carePlan.metadata.additionalShifts.weekdayEvening4pmTo6am) shifts.push("Weekday Evening (4PM-6AM)");
      if (carePlan.metadata.additionalShifts.weekdayEvening4pmTo8am) shifts.push("Weekday Evening (4PM-8AM)");
      if (carePlan.metadata.additionalShifts.weekdayEvening6pmTo6am) shifts.push("Weekday Evening (6PM-6AM)");
      if (carePlan.metadata.additionalShifts.weekdayEvening6pmTo8am) shifts.push("Weekday Evening (6PM-8AM)");
      if (carePlan.metadata.additionalShifts.weekday8amTo4pm) shifts.push("Weekday (8AM-4PM)");
      if (carePlan.metadata.additionalShifts.weekday8amTo6pm) shifts.push("Weekday (8AM-6PM)");
      
      shifts.forEach(shift => {
        doc.text(`• ${shift}`, 25, yPos);
        yPos += 6;
      });
    }
    
    // Add horizontal separator before next section
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // ---- CARE TEAM SECTION ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Care Team Members', 20, yPos);
    yPos += 10;
    
    // Add team members
    if (careTeamMembers.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text("No team members added yet.", 20, yPos);
      yPos += 10;
    } else {
      // Draw table header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Name', 20, yPos);
      doc.text('Role', 90, yPos);
      doc.text('Status', 150, yPos);
      yPos += 6;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      
      // Draw team member rows
      doc.setFont('helvetica', 'normal');
      careTeamMembers.forEach(member => {
        const name = member.professionalDetails?.full_name || "Unknown";
        const role = capitalizeFirstLetter(member.role);
        const status = capitalizeFirstLetter(member.status);
        
        doc.text(name, 20, yPos);
        doc.text(role, 90, yPos);
        doc.text(status, 150, yPos);
        yPos += 7;
        
        // Add a thin separator line between members
        doc.setDrawColor(240, 240, 240);
        doc.line(20, yPos, 190, yPos);
        yPos += 4;
      });
    }
    
    // Check if we need to add a new page for the schedule
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    } else {
      // Add horizontal separator before schedule section
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
    }
    
    // ---- SCHEDULE SECTION ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Schedule', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    doc.text(`Date Range: ${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`, 20, yPos);
    yPos += 10;
    
    // Filter shifts for the selected date range
    const rangeShifts = careShifts.filter(shift => {
      const shiftDate = parseISO(shift.startTime);
      return (
        (isAfter(shiftDate, startDate) || isSameDay(shiftDate, startDate)) && 
        (isBefore(shiftDate, endDate) || isSameDay(shiftDate, endDate))
      );
    });
    
    if (rangeShifts.length === 0) {
      doc.text("No shifts scheduled for this date range.", 20, yPos);
      yPos += 10;
    } else {
      // Calculate the number of weeks in the date range
      const daysInRange = differenceInDays(endDate, startDate) + 1;
      const weeksInRange = Math.ceil(daysInRange / 7);
      
      // Process one week at a time
      for (let weekIndex = 0; weekIndex < weeksInRange; weekIndex++) {
        const currentWeekStart = addWeeks(startDate, weekIndex);
        const currentWeekEnd = addDays(currentWeekStart, 6);
        
        // Check if we need to add a new page
        if (yPos > 260 && weekIndex > 0) {
          doc.addPage();
          yPos = 20;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`Week ${weekIndex + 1} Schedule`, 20, yPos);
          yPos += 10;
        } else if (weekIndex > 0) {
          // Add separation between weeks
          yPos += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`Week ${weekIndex + 1} Schedule`, 20, yPos);
          yPos += 10;
        }
        
        const weekLabel = `Week of ${format(currentWeekStart, 'MMMM d')} - ${format(currentWeekEnd, 'MMMM d')}`;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.text(weekLabel, 20, yPos);
        yPos += 8;
        
        // Draw schedule table header for this week
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Day', 20, yPos);
        doc.text('Time', 60, yPos);
        doc.text('Caregiver', 110, yPos);
        doc.text('Location', 160, yPos);
        yPos += 6;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        
        // Filter shifts for this specific week
        const weekShifts = rangeShifts.filter(shift => {
          const shiftDate = parseISO(shift.startTime);
          return isSameWeek(shiftDate, currentWeekStart, { weekStartsOn: 0 });
        });
        
        // Loop through each day of this week
        for (let i = 0; i < 7; i++) {
          const currentDay = addDays(currentWeekStart, i);
          
          // Skip if beyond the selected date range
          if (isAfter(currentDay, endDate)) break;
          
          // Get shifts for this day
          const shiftsForDay = weekShifts.filter(shift => 
            isSameDay(parseISO(shift.startTime), currentDay)
          );
          
          // Format the day
          const dayLabel = format(currentDay, 'EEEE, MMM d');
          
          if (shiftsForDay.length > 0) {
            shiftsForDay.forEach((shift, index) => {
              // Check if we need to add a new page
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Re-add headers on new page
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text('Day', 20, yPos);
                doc.text('Time', 60, yPos);
                doc.text('Caregiver', 110, yPos);
                doc.text('Location', 160, yPos);
                yPos += 6;
                
                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPos, 190, yPos);
                yPos += 6;
              }
              
              doc.setFont('helvetica', 'normal');
              // Only show day once per group of shifts
              doc.text(index === 0 ? dayLabel : '', 20, yPos);
              
              const startTime = format(parseISO(shift.startTime), 'h:mm a');
              const endTime = format(parseISO(shift.endTime), 'h:mm a');
              doc.text(`${startTime} - ${endTime}`, 60, yPos);
              
              const caregiverName = getCaregiverName(shift.caregiverId, careTeamMembers);
              doc.text(caregiverName, 110, yPos);
              
              doc.text(shift.location || "Patient's Home", 160, yPos);
              yPos += 8;
              
              // Add shift title if available
              if (shift.title) {
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text(`${shift.title}`, 60, yPos);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                yPos += 6;
              }
              
              // Add a thin separator between shifts
              doc.setDrawColor(240, 240, 240);
              doc.line(20, yPos, 190, yPos);
              yPos += 4;
            });
          } else {
            // Show all days - Not just weekdays with "No shifts" label
            // Check if we need to add a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
              
              // Re-add headers on new page
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.text('Day', 20, yPos);
              doc.text('Time', 60, yPos);
              doc.text('Caregiver', 110, yPos);
              doc.text('Location', 160, yPos);
              yPos += 6;
              
              doc.setDrawColor(200, 200, 200);
              doc.line(20, yPos, 190, yPos);
              yPos += 6;
            }
            
            doc.text(dayLabel, 20, yPos);
            doc.text('No shifts scheduled', 60, yPos);
            yPos += 8;
            
            // Add a thin separator
            doc.setDrawColor(240, 240, 240);
            doc.line(20, yPos, 190, yPos);
            yPos += 4;
          }
        }
      }
    }
    
    // ---- FOOTER ----
    // Add to the last page
    const pageCount = doc.getNumberOfPages();
    doc.setPage(pageCount);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Tavara Care - Ref: ' + referenceCode, 20, 285);
    doc.text('To modify this schedule please visit: tavara.care', 20, 290);
    
    // Return as data URL
    const pdfOutput = doc.output('dataurlstring');
    return pdfOutput;
  } catch (error) {
    console.error('Error generating care report:', error);
    toast.error('Failed to generate care report');
    throw error;
  }
};

/**
 * Share the care report via WhatsApp
 * 
 * @param reportUrl URL of the report to share
 * @returns true if the sharing was initiated successfully
 */
export const shareReportViaWhatsApp = async (reportUrl: string): Promise<boolean> => {
  try {
    // On mobile, we can use the Web Share API
    if (navigator.share) {
      // Create a blob from the data URL
      const blob = await dataURLToBlob(reportUrl);
      const file = new File([blob], "tavara-care-report.pdf", { type: 'application/pdf' });
      
      await navigator.share({
        files: [file],
        title: 'Tavara Care Report',
        text: 'Here is the care schedule and plan details from Tavara Care'
      });
      
      return true;
    } else {
      // Fallback for desktop - open WhatsApp web with pre-filled text
      const whatsappText = encodeURIComponent('Here is the care schedule and plan details from Tavara Care. Please check your messages for the PDF document.');
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
      
      return true;
    }
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    return false;
  }
};

/**
 * Convert data URL to Blob
 */
const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return blob;
};

/**
 * Get plan type display text
 */
const getPlanTypeDisplay = (plan: CarePlan): string => {
  if (!plan.metadata?.planType) return "Not specified";
  
  switch (plan.metadata.planType) {
    case 'scheduled':
      return "Scheduled Care";
    case 'on-demand':
      return "On-demand Care";
    case 'both':
      return "Scheduled & On-demand";
    default:
      return "Not specified";
  }
};

/**
 * Get caregiver name from team members by ID
 */
const getCaregiverName = (
  caregiverId: string | undefined, 
  careTeamMembers: CareTeamMemberWithProfile[]
): string => {
  if (!caregiverId) return "Unassigned";
  
  const member = careTeamMembers.find(m => m.caregiverId === caregiverId);
  return member?.professionalDetails?.full_name || 
         member?.profile?.fullName || 
         "Unknown";
};

/**
 * Capitalize first letter of a string
 */
const capitalizeFirstLetter = (str?: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
