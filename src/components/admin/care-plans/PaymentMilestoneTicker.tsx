import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus, Trash2, Calendar, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  fetchFamilyPaymentRecords,
  createFamilyPaymentRecord,
  deleteFamilyPaymentRecord,
  type FamilyPaymentRecord,
  type PaymentLineItem,
} from "@/services/care-plans/familyPaymentService";

interface Props {
  familyUserId: string;
  carePlanId?: string | null;
  /** admin: can add/delete; family: read-only compact */
  mode?: "admin" | "family";
  title?: string;
}

const fmtMoney = (n: number, currency = "TTD") =>
  `${currency} $${n.toLocaleString("en-TT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (iso: string) => format(parseISO(iso), "MMM d");

export const PaymentMilestoneTicker: React.FC<Props> = ({
  familyUserId,
  carePlanId,
  mode = "family",
  title,
}) => {
  const [records, setRecords] = useState<FamilyPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchFamilyPaymentRecords(familyUserId, carePlanId || undefined);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    if (familyUserId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyUserId, carePlanId]);

  const isAdmin = mode === "admin";

  if (loading) return null;
  if (!records.length && !isAdmin) return null;

  const total = records.reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const currency = records[0]?.currency || "TTD";
  const heading = title || (isAdmin ? "Payment Milestones" : "Your payment records");

  const selected = records.find((r) => r.id === openId) || null;

  return (
    <Card className="mb-4 border-emerald-200 bg-emerald-50/50">
      <CardContent className="py-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-700" />
            <h3 className="text-sm font-semibold text-emerald-900">{heading}</h3>
            {records.length > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 border-emerald-200">
                {records.length} received · {fmtMoney(total, currency)} total
              </Badge>
            )}
          </div>
          {isAdmin && (
            <AddPaymentDialog
              open={addOpen}
              onOpenChange={setAddOpen}
              familyUserId={familyUserId}
              carePlanId={carePlanId || null}
              onCreated={() => load()}
            />
          )}
        </div>

        {records.length === 0 ? (
          <p className="text-xs text-muted-foreground">No payments logged yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {records.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenId(r.id)}
                className="group inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-900 hover:bg-emerald-100 transition"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium">{fmtShort(r.paid_date)}</span>
                <span className="text-emerald-700">·</span>
                <span>{fmtMoney(Number(r.total_amount), r.currency)}</span>
                {r.line_items?.some((li) => li.category === "nis_registration") && (
                  <Badge className="ml-1 h-4 px-1.5 text-[10px] bg-amber-100 text-amber-900 border-amber-200">
                    incl. NIS
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Payment on {selected && format(parseISO(selected.paid_date), "PPP")}
              </DialogTitle>
              {selected?.period_start && selected?.period_end && (
                <DialogDescription className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Covers {format(parseISO(selected.period_start), "MMM d")} – {format(parseISO(selected.period_end), "MMM d, yyyy")}
                </DialogDescription>
              )}
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="rounded-md border bg-muted/40 divide-y">
                  {selected.line_items.map((li, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 text-sm">
                      <span>{li.label}</span>
                      <span className="font-medium tabular-nums">
                        {fmtMoney(Number(li.amount), selected.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2.5 text-sm bg-emerald-50">
                    <span className="font-semibold">Total paid</span>
                    <span className="font-semibold tabular-nums text-emerald-900">
                      {fmtMoney(Number(selected.total_amount), selected.currency)}
                    </span>
                  </div>
                </div>
                {selected.notes && (
                  <p className="text-xs text-muted-foreground italic">{selected.notes}</p>
                )}
                {isAdmin && (
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm("Delete this payment record? This cannot be undone.")) return;
                        const ok = await deleteFamilyPaymentRecord(selected.id);
                        if (ok) {
                          toast.success("Payment record deleted");
                          setOpenId(null);
                          load();
                        } else {
                          toast.error("Failed to delete record");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete record
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

/* ---------------- Admin add-payment dialog ---------------- */

const CATEGORIES: { value: PaymentLineItem["category"]; label: string }[] = [
  { value: "caregiver_care", label: "Caregiver care payment" },
  { value: "subscription", label: "Care subscription" },
  { value: "nis_registration", label: "NIS registration (one-time)" },
  { value: "coordination", label: "Coordination fee" },
  { value: "other", label: "Other" },
];

const AddPaymentDialog: React.FC<{
  open: boolean;
  onOpenChange: (o: boolean) => void;
  familyUserId: string;
  carePlanId: string | null;
  onCreated: () => void;
}> = ({ open, onOpenChange, familyUserId, carePlanId, onCreated }) => {
  const [paidDate, setPaidDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PaymentLineItem[]>([
    { label: "Caregiver care payment", amount: 1400, category: "caregiver_care" },
    { label: "Care subscription (weekly)", amount: 499, category: "subscription" },
  ]);
  const [saving, setSaving] = useState(false);

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const updateItem = (idx: number, patch: Partial<PaymentLineItem>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const addItem = () =>
    setItems((arr) => [...arr, { label: "", amount: 0, category: "other" }]);

  const removeItem = (idx: number) =>
    setItems((arr) => arr.filter((_, i) => i !== idx));

  const reset = () => {
    setPaidDate(format(new Date(), "yyyy-MM-dd"));
    setPeriodStart("");
    setPeriodEnd("");
    setNotes("");
    setItems([
      { label: "Caregiver care payment", amount: 1400, category: "caregiver_care" },
      { label: "Care subscription (weekly)", amount: 499, category: "subscription" },
    ]);
  };

  const submit = async () => {
    if (!paidDate || items.length === 0 || total <= 0) {
      toast.error("Add a paid date and at least one line item");
      return;
    }
    setSaving(true);
    try {
      await createFamilyPaymentRecord({
        family_user_id: familyUserId,
        care_plan_id: carePlanId || null,
        paid_date: paidDate,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        total_amount: total,
        currency: "TTD",
        line_items: items.map((i) => ({ ...i, amount: Number(i.amount) || 0 })),
        notes: notes || null,
      });
      toast.success("Payment record added");
      onOpenChange(false);
      reset();
      onCreated();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-900 hover:bg-emerald-100">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Log payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log a family payment</DialogTitle>
          <DialogDescription>
            Record an offline payment (cash, bank transfer, etc.) so it shows on the milestone ticker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Paid date *</Label>
              <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Period start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Period end</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs">Line items *</Label>
              <Button type="button" size="sm" variant="ghost" onClick={addItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add line
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Select
                    value={(it.category as string) || "other"}
                    onValueChange={(v) => {
                      const cat = CATEGORIES.find((c) => c.value === v);
                      updateItem(i, { category: v as any, label: cat?.label || it.label });
                    }}
                  >
                    <SelectTrigger className="col-span-4 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value as string}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="col-span-5 h-9 text-xs"
                    placeholder="Label"
                    value={it.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                  />
                  <Input
                    className="col-span-2 h-9 text-xs"
                    type="number"
                    step="0.01"
                    value={it.amount}
                    onChange={(e) => updateItem(i, { amount: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1 h-9 w-9"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 text-sm font-semibold">
              <DollarSign className="h-4 w-4" />
              Total: {fmtMoney(total)}
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea
              rows={2}
              placeholder="Optional context (e.g. Week 2 — includes one-time NIS fee)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMilestoneTicker;
