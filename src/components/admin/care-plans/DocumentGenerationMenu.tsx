import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Receipt, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
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
  careRate?: string;
  weeklyHours?: number;
  hideWaivedItems?: boolean;
}

interface ApprovedLineItemWithMeta extends BillingLineItem {
  id: string;
  shortLabel: string;
  priceLabel: string;
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
  careRate,
  weeklyHours,
  hideWaivedItems = false,
}: DocumentGenerationMenuProps) => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [approvedLineItems, setApprovedLineItems] = useState<ApprovedLineItemWithMeta[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Fetch approved service selections dynamically
  useEffect(() => {
    if (!carePlanId) return;
    const fetchSelections = async () => {
      try {
        const { data: selections } = await supabase
          .from('care_plan_service_selections')
          .select('*, billable_service_items(*)')
          .eq('care_plan_id', carePlanId)
          .eq('selected', true);

        if (selections && selections.length > 0) {
          const lineItems: ApprovedLineItemWithMeta[] = (selections as any[]).map(s => {
            const item = s.billable_service_items;
            const unitPrice = item?.unit_price ?? 0;
            const price = s.override_price ?? unitPrice;
            const qty = s.quantity || 1;
            const billingType = item?.billing_type || 'one_time';
            const noteMap: Record<string, string> = {
              weekly: '(weekly)',
              monthly: '(monthly)',
              hourly: '(per hour)',
              one_time: '(one-time)',
            };
            const suffixMap: Record<string, string> = {
              weekly: '/wk',
              monthly: '/mo',
              hourly: '/hr',
              one_time: ' one-time',
            };
            const hasDiscount = s.override_price !== null && s.override_price !== undefined && s.override_price !== unitPrice;
            const isWaived = hasDiscount && s.override_price === 0;
            let discountNote = '';
            if (isWaived) discountNote = ' [WAIVED — value: $' + unitPrice.toFixed(2) + ']';
            else if (hasDiscount) discountNote = ' [Discounted from $' + unitPrice.toFixed(2) + ']';
            const label = item?.label || 'Service';
            return {
              id: s.id,
              description: label + discountNote,
              amount: price * qty,
              note: noteMap[billingType] || '',
              shortLabel: label,
              priceLabel: `$${(price * qty).toFixed(0)}${suffixMap[billingType] ?? ''}`,
            };
          });
          setApprovedLineItems(lineItems);
          setSelectedItemIds(new Set(lineItems.map(li => li.id)));
        } else {
          setApprovedLineItems([]);
          setSelectedItemIds(new Set());
        }
      } catch (err) {
        console.error('Error fetching approved services for documents:', err);
      }
    };
    fetchSelections();
  }, [carePlanId]);

  // Synthetic caregiver-labor line derived from careRate + weeklyHours
  const caregiverLaborItem = useMemo<ApprovedLineItemWithMeta | null>(() => {
    if (!careRate) return null;
    const rateMatch = careRate.match(/\$?([\d.]+)/);
    const hourlyRate = rateMatch ? parseFloat(rateMatch[1]) : 0;
    if (hourlyRate <= 0) return null;
    const hrs = weeklyHours || 40;
    return {
      id: '__caregiver_labor__',
      description: `Standard Weekly Care — Caregiver (${hrs} hrs/wk)`,
      amount: hourlyRate * hrs,
      note: `(${hrs} hrs × $${hourlyRate.toFixed(2)}/hr weekly)`,
      shortLabel: `Caregiver Labor (${hrs} hrs × $${hourlyRate.toFixed(2)}/hr)`,
      priceLabel: `$${(hourlyRate * hrs).toFixed(0)}/wk`,
    };
  }, [careRate, weeklyHours]);

  // Combined list shown in the picker: caregiver labor first, then approved services
  const combinedLineItems = useMemo<ApprovedLineItemWithMeta[]>(() => {
    return caregiverLaborItem ? [caregiverLaborItem, ...approvedLineItems] : approvedLineItems;
  }, [caregiverLaborItem, approvedLineItems]);

  // Default caregiver labor to checked (preserves prior behavior for admins who don't touch picker)
  useEffect(() => {
    if (caregiverLaborItem) {
      setSelectedItemIds(prev => {
        if (prev.has(caregiverLaborItem.id)) return prev;
        const next = new Set(prev);
        next.add(caregiverLaborItem.id);
        return next;
      });
    }
  }, [caregiverLaborItem]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedItemIds(new Set(combinedLineItems.map(li => li.id)));
  const clearAll = () => setSelectedItemIds(new Set());

  const filteredSelectedItems = useMemo(() => {
    const chosen = combinedLineItems.filter(li => selectedItemIds.has(li.id));
    return hideWaivedItems
      ? chosen.filter(item => !(item.amount === 0 && item.description.includes('[WAIVED')))
      : chosen;
  }, [combinedLineItems, selectedItemIds, hideWaivedItems]);

  const getData = (): CareBillingData => {
    // Strip meta fields before sending to PDF generator. Only selected items are included —
    // the caregiver-labor line now lives in the picker and obeys selection state.
    const cleanLineItems: BillingLineItem[] = filteredSelectedItems.map(({ description, amount, note }) => ({
      description,
      amount,
      note,
    }));

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
      additionalLineItems: cleanLineItems,
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

  const totalCount = combinedLineItems.length;
  const selectedCount = filteredSelectedItems.length;

  return (
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
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Generate Document</DropdownMenuLabel>

        {totalCount > 0 && (
          <>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Include on document
              </span>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectAll(); }}
                  className="text-primary hover:underline px-1"
                >
                  All
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearAll(); }}
                  className="text-primary hover:underline px-1"
                >
                  None
                </button>
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {combinedLineItems.map(item => (
                <DropdownMenuCheckboxItem
                  key={item.id}
                  checked={selectedItemIds.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  onSelect={(e) => e.preventDefault()}
                  className="text-xs"
                >
                  <div className="flex items-center justify-between gap-2 w-full pr-1">
                    <span className="truncate">{item.shortLabel}</span>
                    <span className="text-muted-foreground whitespace-nowrap text-[10px]">
                      {item.priceLabel}
                    </span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
            <div className="px-2 py-1 text-[10px] text-muted-foreground italic">
              {selectedCount} of {totalCount} services included
            </div>
            <DropdownMenuSeparator />
          </>
        )}

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
  );
};

export default DocumentGenerationMenu;
