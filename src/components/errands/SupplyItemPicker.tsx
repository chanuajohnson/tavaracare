import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Search } from 'lucide-react';
import type { CareSupplyItem } from '@/hooks/useCareSupplyCatalog';

interface SupplyItemPickerProps {
  items: CareSupplyItem[];
  selections: Record<string, number>;
  onChange: (itemId: string, qty: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  caregiver: '🧤 Caregiver',
  personal: '🧴 Personal Care',
  hygiene: '💧 Hygiene',
  comfort: '💙 Comfort',
  home_reset: '🏡 Home Reset',
};

export const SupplyItemPicker: React.FC<SupplyItemPickerProps> = ({ items, selections, onChange }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, CareSupplyItem[]>();
    filtered.forEach((i) => {
      const arr = map.get(i.category) || [];
      arr.push(i);
      map.set(i.category, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search supplies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {grouped.map(([category, catItems]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-foreground mb-2 sticky top-0 bg-background py-1">
              {CATEGORY_LABELS[category] || category}
            </h4>
            <div className="space-y-2">
              {catItems.map((item) => {
                const qty = selections[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.unit_label} · TT${Number(item.unit_price_ttd).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onChange(item.id, Math.max(0, qty - 1))}
                        disabled={qty === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-sm tabular-nums">{qty}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onChange(item.id, qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No supplies match your search.</p>
        )}
      </div>
    </div>
  );
};
