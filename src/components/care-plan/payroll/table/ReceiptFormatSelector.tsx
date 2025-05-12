
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReceiptFormatSelectorProps {
  selectedFormat: 'pdf' | 'jpg';
  onFormatChange: (format: 'pdf' | 'jpg') => void;
}

export const ReceiptFormatSelector = ({
  selectedFormat,
  onFormatChange
}: ReceiptFormatSelectorProps) => {
  return (
    <div className="mb-4 flex justify-end items-center">
      <Select
        value={selectedFormat}
        onValueChange={(value: 'pdf' | 'jpg') => onFormatChange(value)}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="jpg">JPG</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
