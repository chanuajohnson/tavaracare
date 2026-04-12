import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, Receipt, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  generateQuotePDF,
  generateInvoicePDF,
  generateReceiptPDF,
  buildDefaultCareBillingData,
  type CareBillingData,
  type BillingLineItem,
} from '@/services/care-plans/invoiceService';

interface DocumentGenerationMenuProps {
  familyName: string;
  familyEmail?: string;
  familyPhone?: string;
  familyAddress?: string;
  careRecipientName?: string;
  caregiverName?: string;
  caregiverRole?: string;
  carePlanId?: string;
  carePlanTitle?: string;
  billingData?: Partial<CareBillingData>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const DocumentGenerationMenu = ({
  familyName,
  familyEmail,
  familyPhone,
  familyAddress,
  careRecipientName,
  caregiverName,
  caregiverRole,
  carePlanId,
  carePlanTitle,
  billingData,
  variant = 'outline',
  size = 'sm',
}: DocumentGenerationMenuProps) => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [includePodiatry, setIncludePodiatry] = useState(false);

  const getData = (): CareBillingData => {
    const additionalLineItems: BillingLineItem[] = [];
    const additionalNotes: string[] = [];

    if (includePodiatry) {
      additionalLineItems.push({
        description: 'Podiatric Care Support (Secondary Household Member)',
        amount: 349.00,
        note: 'Twice-daily antifungal treatment — full care cycle: preparation, hygiene protocol, application, and post-care handling',
      });
      additionalNotes.push(
        'This service is limited to the defined podiatric care task only and does not extend to general caregiving for the secondary household member. Service continues weekly unless discontinued in writing with one (1) week\'s notice.'
      );
    }

    return buildDefaultCareBillingData({
      familyName,
      familyEmail,
      familyPhone,
      familyAddress,
      careRecipientName,
      caregiverName,
      caregiverRole,
      carePlanId,
      carePlanTitle,
      ...billingData,
      additionalLineItems,
      ...(additionalNotes.length > 0 ? {
        additionalNotes: [
          'NIS (National Insurance) contributions for the assigned caregiver are included and covered by Tavara as required by Trinidad & Tobago law.',
          'Tavara provides continuity of care — if your assigned caregiver is unavailable, a qualified replacement will be provided at no extra charge.',
          'Rate adjustments may apply if care needs change (e.g., disease progression, additional services).',
          ...additionalNotes,
        ],
      } : {}),
    });
  };

  const handleGenerate = async (type: 'quote' | 'invoice' | 'receipt') => {
    setGenerating(type);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    toast.info(`Generating ${label}...`);

    try {
      const data = getData();
      switch (type) {
        case 'quote':
          await generateQuotePDF(data);
          break;
        case 'invoice':
          await generateInvoicePDF(data);
          break;
        case 'receipt':
          await generateReceiptPDF(data);
          break;
      }
      toast.success(`${label} downloaded successfully`);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Failed to generate ${label}. Please try again.`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="podiatry-admin-toggle"
          checked={includePodiatry}
          onCheckedChange={(checked) => setIncludePodiatry(!!checked)}
        />
        <Label htmlFor="podiatry-admin-toggle" className="text-xs cursor-pointer">
          + Podiatric Care ($349/wk)
        </Label>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={!!generating}>
            {generating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <FileText className="mr-1 h-3 w-3" />
            )}
            {generating ? 'Generating...' : 'Documents'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Generate Document</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleGenerate('quote')} disabled={!!generating}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
            Generate Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleGenerate('invoice')} disabled={!!generating}>
            <FileText className="mr-2 h-4 w-4 text-amber-600" />
            Generate Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleGenerate('receipt')} disabled={!!generating}>
            <Receipt className="mr-2 h-4 w-4 text-green-600" />
            Generate Receipt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DocumentGenerationMenu;
