import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowUp, ArrowDown, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PlanFeature,
  SubscriptionPlan,
} from "@/hooks/useSubscriptionPlans";

interface PlanFormProps {
  plan: SubscriptionPlan;
  onSaved: () => void;
  onDeleted?: () => void;
}

type EditableState = {
  name: string;
  slug: string;
  description: string;
  audience: "family" | "professional";
  price_weekly: string; // string for blank-as-Free UX
  price_monthly: string;
  period_weekly: string;
  period_monthly: string;
  button_text: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features: PlanFeature[];
};

const toState = (p: SubscriptionPlan): EditableState => ({
  name: p.name,
  slug: p.slug ?? "",
  description: p.description ?? "",
  audience: p.audience,
  price_weekly: p.price_weekly === null ? "" : String(p.price_weekly),
  price_monthly: p.price_monthly === null ? "" : String(p.price_monthly),
  period_weekly: p.period_weekly ?? "",
  period_monthly: p.period_monthly ?? "",
  button_text: p.button_text ?? "Choose Plan",
  is_popular: p.is_popular,
  is_active: p.is_active,
  sort_order: p.sort_order ?? 0,
  features: p.features.map((f) => ({ ...f })),
});

export const PlanForm: React.FC<PlanFormProps> = ({ plan, onSaved, onDeleted }) => {
  const [state, setState] = useState<EditableState>(() => toState(plan));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setState(toState(plan));
  }, [plan]);

  const update = <K extends keyof EditableState>(k: K, v: EditableState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const updateFeature = (idx: number, patch: Partial<PlanFeature>) => {
    setState((s) => ({
      ...s,
      features: s.features.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));
  };

  const addFeature = () => {
    setState((s) => ({
      ...s,
      features: [...s.features, { name: "", included: true, is_addon: false }],
    }));
  };

  const removeFeature = (idx: number) => {
    setState((s) => ({
      ...s,
      features: s.features.filter((_, i) => i !== idx),
    }));
  };

  const moveFeature = (idx: number, dir: -1 | 1) => {
    setState((s) => {
      const next = [...s.features];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return s;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...s, features: next };
    });
  };

  const handleSave = async () => {
    if (!state.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    setSaving(true);
    try {
      const cleanedFeatures = state.features
        .filter((f) => f.name.trim().length > 0)
        .map((f) => ({
          name: f.name.trim(),
          included: !!f.included,
          is_addon: !!f.is_addon,
        }));

      const priceWeekly =
        state.price_weekly.trim() === "" ? null : Number(state.price_weekly);
      const priceMonthly =
        state.price_monthly.trim() === "" ? null : Number(state.price_monthly);

      if (priceWeekly !== null && Number.isNaN(priceWeekly)) {
        toast.error("Weekly price must be a number or blank for Free");
        setSaving(false);
        return;
      }
      if (priceMonthly !== null && Number.isNaN(priceMonthly)) {
        toast.error("Monthly price must be a number or blank for Free");
        setSaving(false);
        return;
      }

      const payload = {
        name: state.name.trim(),
        slug: state.slug.trim() || null,
        description: state.description.trim() || null,
        audience: state.audience,
        price_weekly: priceWeekly,
        price_monthly: priceMonthly,
        // keep legacy numeric `price` synced for joins
        price: priceWeekly ?? priceMonthly ?? 0,
        period_weekly: state.period_weekly,
        period_monthly: state.period_monthly,
        button_text: state.button_text.trim() || "Choose Plan",
        is_popular: state.is_popular,
        is_active: state.is_active,
        sort_order: Number(state.sort_order) || 0,
        features: cleanedFeatures as any,
      };

      const { error } = await supabase
        .from("subscription_plans")
        .update(payload)
        .eq("id", plan.id);

      if (error) throw error;
      toast.success(`${payload.name} updated`);
      onSaved();
    } catch (err: any) {
      console.error("Plan save error:", err);
      toast.error(err.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", plan.id);
      if (error) throw error;
      toast.success("Plan deleted");
      onDeleted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{state.name || "Untitled plan"}</span>
          <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            {state.is_popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">Popular</span>}
            {!state.is_active && <span className="px-2 py-0.5 rounded-full bg-muted">Inactive</span>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Plan name</Label>
            <Input value={state.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={state.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="basic / care / premium"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={state.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weekly price (blank = Free)</Label>
            <Input
              type="number"
              step="0.01"
              value={state.price_weekly}
              onChange={(e) => update("price_weekly", e.target.value)}
              placeholder="699"
            />
          </div>
          <div>
            <Label>Weekly period label</Label>
            <Input
              value={state.period_weekly}
              onChange={(e) => update("period_weekly", e.target.value)}
              placeholder="week"
            />
          </div>
          <div>
            <Label>Monthly price (blank = Free)</Label>
            <Input
              type="number"
              step="0.01"
              value={state.price_monthly}
              onChange={(e) => update("price_monthly", e.target.value)}
              placeholder="2499"
            />
          </div>
          <div>
            <Label>Monthly period label</Label>
            <Input
              value={state.period_monthly}
              onChange={(e) => update("period_monthly", e.target.value)}
              placeholder="month"
            />
          </div>
        </div>

        <div>
          <Label>Button text</Label>
          <Input
            value={state.button_text}
            onChange={(e) => update("button_text", e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={state.is_popular}
              onCheckedChange={(v) => update("is_popular", !!v)}
            />
            Most Popular
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={state.is_active}
              onCheckedChange={(v) => update("is_active", !!v)}
            />
            Active
          </label>
          <div className="flex items-center gap-2 text-sm">
            <Label className="m-0">Sort order</Label>
            <Input
              type="number"
              className="w-20"
              value={state.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label>Features</Label>
            <Button type="button" size="sm" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-1" /> Add feature
            </Button>
          </div>
          <div className="space-y-2">
            {state.features.map((f, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 border rounded-md p-2 bg-muted/30"
              >
                <Input
                  value={f.name}
                  onChange={(e) => updateFeature(idx, { name: e.target.value })}
                  placeholder="Feature description"
                  className="flex-1 min-w-[200px]"
                />
                <label className="flex items-center gap-1 text-xs">
                  <Checkbox
                    checked={f.included}
                    onCheckedChange={(v) => updateFeature(idx, { included: !!v })}
                  />
                  Included
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <Checkbox
                    checked={!!f.is_addon}
                    onCheckedChange={(v) => updateFeature(idx, { is_addon: !!v })}
                  />
                  Add-on
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveFeature(idx, -1)}
                    disabled={idx === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => moveFeature(idx, 1)}
                    disabled={idx === state.features.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFeature(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={saving}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete plan
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
