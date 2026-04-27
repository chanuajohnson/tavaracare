import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  SubscriptionPlan,
  useSubscriptionPlans,
} from "@/hooks/useSubscriptionPlans";
import { PlanForm } from "./PlanForm";

interface Props {
  onPlansChanged?: () => void;
}

export const PlanManagerDrawer: React.FC<Props> = ({ onPlansChanged }) => {
  const [open, setOpen] = useState(false);
  const { familyPlans, professionalPlans, isLoading, refetch } =
    useSubscriptionPlans(true);
  const [creating, setCreating] = useState(false);

  const handleSaved = () => {
    refetch();
    onPlansChanged?.();
  };

  const handleCreate = async (audience: "family" | "professional") => {
    setCreating(true);
    try {
      const existing = (audience === "family" ? familyPlans : professionalPlans);
      const nextOrder = (existing[existing.length - 1]?.sort_order ?? 0) + 1;

      const { error } = await supabase.from("subscription_plans").insert({
        name: "New Plan",
        slug: `new-plan-${Date.now()}`,
        audience,
        description: "",
        price: 0,
        price_weekly: null,
        price_monthly: null,
        period_weekly: "",
        period_monthly: "",
        button_text: "Choose Plan",
        is_popular: false,
        is_active: false, // start hidden
        sort_order: nextOrder,
        duration_days: 30,
        features: [] as any,
      });

      if (error) throw error;
      toast.success("New plan created (set to inactive)");
      handleSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create plan");
    } finally {
      setCreating(false);
    }
  };

  const renderList = (
    list: SubscriptionPlan[],
    audience: "family" | "professional"
  ) => (
    <div className="space-y-4">
      {list.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">No plans yet.</p>
      )}
      {list.map((plan) => (
        <PlanForm
          key={plan.id}
          plan={plan}
          onSaved={handleSaved}
          onDeleted={handleSaved}
        />
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleCreate(audience)}
        disabled={creating}
      >
        <Plus className="h-4 w-4 mr-1" /> Add new {audience} plan
      </Button>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Manage Plans
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Manage Subscription Plans</SheetTitle>
          <SheetDescription>
            Edit pricing, features, and visibility for every plan shown on
            /subscription. Changes are live immediately.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <Tabs defaultValue="family" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="family">
                Family ({familyPlans.length})
              </TabsTrigger>
              <TabsTrigger value="professional">
                Professional ({professionalPlans.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="family" className="mt-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                renderList(familyPlans, "family")
              )}
            </TabsContent>
            <TabsContent value="professional" className="mt-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                renderList(professionalPlans, "professional")
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
