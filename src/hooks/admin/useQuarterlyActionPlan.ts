import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ActionStatus = "todo" | "in_progress" | "done" | "blocked";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface QuarterlyActionItem {
  id: string;
  quarter: Quarter;
  year: number;
  category: string;
  title: string;
  description: string | null;
  target_date: string | null;
  owner: string | null;
  status: ActionStatus;
  completion_notes: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useQuarterlyActionPlan(year: number) {
  const [items, setItems] = useState<QuarterlyActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quarterly_action_items")
      .select("*")
      .eq("year", year)
      .order("quarter", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[useQuarterlyActionPlan] fetch error", error);
      toast.error("Failed to load quarterly action plan");
    } else {
      setItems((data || []) as QuarterlyActionItem[]);
    }
    setLoading(false);
  }, [year]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateStatus = async (id: string, status: ActionStatus, notes?: string) => {
    const update: any = {
      status,
      completion_notes: notes ?? null,
      completed_at: status === "done" ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("quarterly_action_items").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to update item");
      return;
    }
    toast.success("Updated");
    fetchItems();
  };

  const addItem = async (item: Omit<QuarterlyActionItem, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const { error } = await supabase.from("quarterly_action_items").insert({
      quarter: item.quarter,
      year: item.year,
      category: item.category,
      title: item.title,
      description: item.description,
      target_date: item.target_date,
      owner: item.owner,
      status: item.status,
      completion_notes: item.completion_notes,
      sort_order: item.sort_order,
    });
    if (error) {
      toast.error("Failed to add item");
      return;
    }
    toast.success("Action item added");
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("quarterly_action_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    fetchItems();
  };

  return { items, loading, updateStatus, addItem, deleteItem, refetch: fetchItems };
}
