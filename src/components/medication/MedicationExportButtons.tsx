import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { MedicationWithAdministrations } from "@/services/medicationService";
import { 
  generateMedicationText, 
  downloadMedicationCardImage, 
  copyMedicationText 
} from "@/utils/medicationExportUtils";

interface MedicationExportButtonsProps {
  medications: MedicationWithAdministrations[];
  carePlanTitle?: string;
  printableElementId: string;
  disabled?: boolean;
}

export function MedicationExportButtons({
  medications,
  carePlanTitle,
  printableElementId,
  disabled = false,
}: MedicationExportButtonsProps) {
  const handleDownloadCard = async () => {
    if (medications.length === 0) {
      toast.error("No medications to export");
      return;
    }

    toast.loading("Generating medication card...");
    
    const success = await downloadMedicationCardImage(
      printableElementId,
      `medications-${carePlanTitle?.replace(/\s+/g, '-').toLowerCase() || 'card'}-${new Date().toISOString().split('T')[0]}`
    );

    toast.dismiss();

    if (success) {
      toast.success("Medication card downloaded!");
    } else {
      toast.error("Failed to generate medication card");
    }
  };

  const handleCopyText = async () => {
    if (medications.length === 0) {
      toast.error("No medications to copy");
      return;
    }

    const text = generateMedicationText(medications, carePlanTitle);
    const success = await copyMedicationText(text);

    if (success) {
      toast.success("Medications copied to clipboard!");
    } else {
      toast.error("Failed to copy medications");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadCard}
        disabled={disabled || medications.length === 0}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download Card
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyText}
        disabled={disabled || medications.length === 0}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy Text
      </Button>
    </div>
  );
}
