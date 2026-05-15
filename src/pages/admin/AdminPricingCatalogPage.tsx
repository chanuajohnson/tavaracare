import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  usePricingCatalog,
  useUpdatePricingItem,
  CATEGORY_LABELS,
  formatPrice,
  type PricingItem,
  type PricingCategory,
  type PricingUnit,
} from '@/hooks/admin/usePricingCatalog';
import { Loader2, Pencil, Save, X } from 'lucide-react';

const UNIT_OPTIONS: PricingUnit[] = ['one_time', 'per_week', 'per_month', 'per_hour', 'custom_quote'];

function PricingRow({ item }: { item: PricingItem }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<PricingItem>>({});
  const update = useUpdatePricingItem();

  const startEdit = () => {
    setDraft({
      display_name: item.display_name,
      description: item.description,
      price_min: item.price_min,
      price_max: item.price_max,
      unit: item.unit,
      is_active: item.is_active,
      sort_order: item.sort_order,
      notes: item.notes,
    });
    setEditing(true);
  };

  const save = async () => {
    await update.mutateAsync({ id: item.id, updates: draft });
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 p-4 border-b last:border-b-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{item.display_name}</span>
            <Badge variant="outline" className="text-xs font-mono">{item.code}</Badge>
            {!item.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
          <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={startEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const isCustomQuote = draft.unit === 'custom_quote';

  return (
    <div className="p-4 border-b last:border-b-0 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono">{item.code}</Badge>
        <span>last updated {new Date(item.updated_at).toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs font-medium">Display name</label>
          <Input
            value={draft.display_name ?? ''}
            onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium">Description</label>
          <Textarea
            rows={2}
            value={draft.description ?? ''}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium">Unit</label>
          <Select
            value={draft.unit}
            onValueChange={(v) => setDraft({ ...draft, unit: v as PricingUnit })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium">Sort order</label>
          <Input
            type="number"
            value={draft.sort_order ?? 0}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        {!isCustomQuote && (
          <>
            <div>
              <label className="text-xs font-medium">Price (min)</label>
              <Input
                type="number"
                step="0.01"
                value={draft.price_min ?? ''}
                onChange={(e) => setDraft({ ...draft, price_min: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Price (max, optional — for ranges)</label>
              <Input
                type="number"
                step="0.01"
                value={draft.price_max ?? ''}
                onChange={(e) => setDraft({ ...draft, price_max: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <label className="text-xs font-medium">Notes (admin-only)</label>
          <Textarea
            rows={2}
            value={draft.notes ?? ''}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.is_active ?? true}
            onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
          />
          <span className="text-sm">Active (visible to non-admins)</span>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AdminPricingCatalogPage() {
  const { data, isLoading } = usePricingCatalog(true);

  const grouped = (data || []).reduce<Record<string, PricingItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  const categoryOrder: PricingCategory[] = [
    'setup', 'subscription', 'add_on', 'rate_tier', 'escalation', 'environment', 'secondary_support',
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: 'Admin', path: '/admin' },
          { label: 'Pricing Catalog', path: '/admin/pricing-catalog' },
        ]}
      />
      <div className="container max-w-5xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Single source of truth for all platform pricing. Edits here propagate to the lifecycle cost
            builder, FAQ, onboarding PDFs, and family-facing copy that read from this catalog.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          categoryOrder.map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;
            return (
              <Card key={cat}>
                <CardHeader>
                  <CardTitle className="text-lg">{CATEGORY_LABELS[cat]}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {items.map((item) => <PricingRow key={item.id} item={item} />)}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
