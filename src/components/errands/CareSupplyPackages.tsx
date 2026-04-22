import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Package, Calendar } from 'lucide-react';
import { useCareSupplyCatalog } from '@/hooks/useCareSupplyCatalog';
import { CadenceSelector, type Cadence, cadenceLabel } from './CadenceSelector';
import { SupplyItemPicker } from './SupplyItemPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TAVARA_DELIVERY_FEE_TTD = 50;
const WHATSAPP_NUMBER = '18687865357';

const DELIVERY_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

export const CareSupplyPackages: React.FC = () => {
  const { items, bundles, loading } = useCareSupplyCatalog();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [deliveryDay, setDeliveryDay] = useState('monday');
  const [activeBundleId, setActiveBundleId] = useState<string | null>(null);

  const itemsById = useMemo(() => {
    const map = new Map<string, typeof items[number]>();
    items.forEach((i) => map.set(i.id, i));
    return map;
  }, [items]);

  const handleQtyChange = (itemId: string, qty: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
    setActiveBundleId(null);
  };

  const applyBundle = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;
    const next: Record<string, number> = { ...selections };
    bundle.items.forEach((bi) => {
      next[bi.item_id] = (next[bi.item_id] || 0) + bi.default_quantity;
    });
    setSelections(next);
    setActiveBundleId(bundleId);
  };

  const clearAll = () => {
    setSelections({});
    setActiveBundleId(null);
  };

  const { subtotal, lineCount } = useMemo(() => {
    let sub = 0;
    let count = 0;
    Object.entries(selections).forEach(([id, qty]) => {
      const item = itemsById.get(id);
      if (!item || qty <= 0) return;
      sub += Number(item.unit_price_ttd) * qty;
      count += 1;
    });
    return { subtotal: sub, lineCount: count };
  }, [selections, itemsById]);

  const total = subtotal + (lineCount > 0 ? TAVARA_DELIVERY_FEE_TTD : 0);

  const buildWhatsAppMessage = (): string => {
    const lines = ['Hi Tavara! I would like to schedule recurring care supply delivery:', ''];
    Object.entries(selections).forEach(([id, qty]) => {
      const item = itemsById.get(id);
      if (!item || qty <= 0) return;
      lines.push(`• ${item.name} × ${qty} (${item.unit_label}) — TT$${(Number(item.unit_price_ttd) * qty).toFixed(2)}`);
    });
    lines.push('');
    lines.push(`Delivery fee: TT$${TAVARA_DELIVERY_FEE_TTD.toFixed(2)}`);
    lines.push(`Total per delivery: TT$${total.toFixed(2)}`);
    lines.push('');
    lines.push(`Cadence: ${cadenceLabel(cadence)}`);
    lines.push(`Preferred delivery day: ${deliveryDay.charAt(0).toUpperCase() + deliveryDay.slice(1)}`);
    return encodeURIComponent(lines.join('\n'));
  };

  const handleScheduleClick = () => {
    if (lineCount === 0) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 shadow-lg mt-8 sm:mt-12">
      <CardContent className="mobile-padding-responsive">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            📦 Recurring Care Supplies
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Never run out of essentials. Choose a starter bundle or build your own kit, and Tavara delivers on your schedule.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading supply catalog...</p>
        ) : (
          <>
            {/* Bundles */}
            <div className="mb-8">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                Quick-start bundles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bundles.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => applyBundle(b.id)}
                    className={cn(
                      'text-left p-4 rounded-lg border-2 bg-card hover:bg-card/80 transition-all',
                      activeBundleId === b.id
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-2xl">{b.emoji || '📦'}</div>
                      <Badge variant="secondary" className="text-xs">
                        {b.items.length} items
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-1">{b.name}</div>
                    {b.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: item picker */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                  Build your kit
                </h3>
                <SupplyItemPicker items={items} selections={selections} onChange={handleQtyChange} />
              </div>

              {/* Right: schedule + summary */}
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Delivery cadence
                  </h3>
                  <CadenceSelector value={cadence} onChange={setCadence} />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                    Preferred delivery day
                  </h3>
                  <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_DAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order summary */}
                <div className="bg-card border-2 border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Per-delivery total</h4>
                    {lineCount > 0 && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {lineCount === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Pick a bundle or add items to see your total
                    </p>
                  ) : (
                    <>
                      <div className="space-y-1 max-h-40 overflow-y-auto mb-3 text-sm">
                        {Object.entries(selections).map(([id, qty]) => {
                          const item = itemsById.get(id);
                          if (!item || qty <= 0) return null;
                          return (
                            <div key={id} className="flex justify-between text-muted-foreground">
                              <span className="truncate pr-2">
                                {item.name} × {qty}
                              </span>
                              <span className="tabular-nums shrink-0">
                                TT${(Number(item.unit_price_ttd) * qty).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground border-t border-border pt-2">
                        <span>Subtotal</span>
                        <span className="tabular-nums">TT${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tavara delivery fee</span>
                        <span className="tabular-nums">TT${TAVARA_DELIVERY_FEE_TTD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground border-t border-border pt-2 mt-2">
                        <span>Total per delivery</span>
                        <span className="tabular-nums text-primary">TT${total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Billed {cadenceLabel(cadence)}
                      </p>
                    </>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={lineCount === 0}
                  onClick={handleScheduleClick}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Schedule on WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll confirm your order and first delivery date via WhatsApp
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
