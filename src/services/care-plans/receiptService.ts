
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog } from './types/workLogTypes';

export const generatePayReceipt = async (workLog: WorkLog): Promise<string> => {
  try {
    // Get the work log details with care team member info
    const { data: workLogWithTeamMember, error: fetchError } = await supabase
      .from('work_logs')
      .select(`
        *,
        care_team_members!care_team_member_id (
          id,
          regular_rate,
          overtime_rate,
          caregiver_id
        ),
        profiles:care_team_members!care_team_member_id(caregiver_id).profiles!caregiver_id (
          full_name,
          avatar_url
        )
      `)
      .eq('id', workLog.id)
      .single();

    if (fetchError) throw fetchError;

    // Calculate hours worked
    const startTime = new Date(workLog.start_time);
    const endTime = new Date(workLog.end_time);
    const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Use base_rate and rate_multiplier from the work log
    const baseRate = workLog.base_rate || 25;
    const rateMultiplier = workLog.rate_multiplier || 1;
    const appliedRate = baseRate * rateMultiplier;

    // Calculate total
    const total = hoursWorked * appliedRate;

    // Create PDF document
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Pay Receipt', 105, 20, { align: 'center' });
    
    // Basic receipt details
    doc.setFontSize(10);
    doc.text([
      `Receipt #: ${workLog.id.slice(0, 8)}`,
      `Date: ${format(startTime, 'MMM d, yyyy')}`,
      `Status: ${workLog.status.charAt(0).toUpperCase() + workLog.status.slice(1)}`,
      `Caregiver: ${workLogWithTeamMember?.profiles?.full_name || 'Unknown'}`
    ], 20, 35);

    // Add autoTable for hours and rates
    autoTable(doc, {
      startY: 65,
      head: [['Type', 'Hours', 'Rate', 'Amount']],
      body: [
        [
          'Regular Hours',
          hoursWorked.toFixed(2),
          `$${appliedRate.toFixed(2)}/hr`,
          `$${total.toFixed(2)}`
        ]
      ],
      foot: [
        [
          'Total',
          '',
          '',
          `$${total.toFixed(2)}`
        ]
      ],
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
    });

    // Generation timestamp at bottom
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, footerY);
    
    // Convert to data URL
    const pdfDataUrl = doc.output('datauristring');
    
    return pdfDataUrl;
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error('Failed to generate receipt');
  }
};
