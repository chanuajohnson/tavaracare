import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
  scale?: number;
}

/**
 * Generate PDF from HTML content
 * @param contentId - DOM element ID to convert to PDF
 * @param fileName - Output filename (without .pdf extension)
 * @param options - PDF generation options
 */
export const generatePDF = async (
  contentId: string,
  fileName: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    orientation = 'portrait',
    format = 'a4',
    margin = 10,
    scale = 2
  } = options;

  try {
    // Get the element to convert
    const element = document.getElementById(contentId);
    if (!element) {
      throw new Error(`Element with ID "${contentId}" not found`);
    }

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Calculate dimensions
    const imgWidth = orientation === 'portrait' ? 210 - (margin * 2) : 297 - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

    // Add footer
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      'Generated from tavara.care/marketing-kit',
      margin,
      pageHeight - 5
    );

    // Download
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate multi-page PDF from multiple sections
 * @param pages - Array of content sections to include
 * @param fileName - Output filename (without .pdf extension)
 * @param options - PDF generation options
 */
export const generateMultiPagePDF = async (
  pages: Array<{ contentId: string; title: string }>,
  fileName: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    orientation = 'portrait',
    format = 'a4',
    margin = 10,
    scale = 2
  } = options;

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const imgWidth = orientation === 'portrait' ? 210 - (margin * 2) : 297 - (margin * 2);
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    for (let i = 0; i < pages.length; i++) {
      const { contentId, title } = pages[i];
      
      // Get element
      const element = document.getElementById(contentId);
      if (!element) {
        console.warn(`Element with ID "${contentId}" not found, skipping`);
        continue;
      }

      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Add new page if not first
      if (i > 0) {
        pdf.addPage();
      }

      // Add page title
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text(title, margin, margin + 5);

      // Add content
      pdf.addImage(imgData, 'PNG', margin, margin + 10, imgWidth, imgHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Page ${i + 1} of ${pages.length} - Generated from tavara.care/marketing-kit`,
        margin,
        pageHeight - 5
      );
    }

    // Download
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    throw error;
  }
};
