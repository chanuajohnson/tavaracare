import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordBankTransfer } from "@/services/care-plans/team/nisService";

interface BankTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollIds: string[];
  onRecorded?: () => void;
}

export const BankTransferDialog: React.FC<BankTransferDialogProps> = ({
  open,
  onOpenChange,
  payrollIds,
  onRecorded,
}) => {
  const [ref, setRef] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!payrollIds.length || !ref.trim()) return;
    setSaving(true);
    let allSuccess = true;
    for (const id of payrollIds) {
      const success = await recordBankTransfer(id, ref.trim(), new Date(date), notes.trim() || undefined);
      if (!success) allSuccess = false;
    }
    setSaving(false);
    if (allSuccess) {
      setRef('');
      setNotes('');
      onOpenChange(false);
      onRecorded?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Monthly NIS Transfer</DialogTitle>
          <DialogDescription>
            Enter the bank transfer details for this monthly NIS payment ({payrollIds.length} {payrollIds.length === 1 ? 'entry' : 'entries'}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="transfer-ref">Transfer Reference #</Label>
            <Input
              id="transfer-ref"
              placeholder="e.g. TRF-20260414-001"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-date">Transfer Date</Label>
            <Input
              id="transfer-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Notes (optional)</Label>
            <Textarea
              id="transfer-notes"
              placeholder="Any additional notes about this transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !ref.trim()}>
            {saving ? 'Saving...' : 'Record Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
