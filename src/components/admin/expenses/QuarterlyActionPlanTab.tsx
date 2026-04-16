import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertOctagon,
  Plus,
  Trash2,
  CalendarDays,
  Target,
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import {
  useQuarterlyActionPlan,
  type ActionStatus,
  type Quarter,
  type QuarterlyActionItem,
} from "@/hooks/admin/useQuarterlyActionPlan";

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

const STATUS_META: Record<
  ActionStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  todo: { label: "To Do", icon: Circle, className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, className: "bg-primary/15 text-primary" },
  done: { label: "Done", icon: CheckCircle2, className: "bg-green-500/15 text-green-700 dark:text-green-400" },
  blocked: { label: "Blocked", icon: AlertOctagon, className: "bg-destructive/15 text-destructive" },
};

function dueClass(target: string | null, status: ActionStatus): string {
  if (!target || status === "done") return "";
  const days = differenceInDays(parseISO(target), new Date());
  if (days < 0) return "border-destructive/50 bg-destructive/5";
  if (days <= 14) return "border-yellow-500/50 bg-yellow-500/5";
  return "";
}

export const QuarterlyActionPlanTab: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const defaultQuarter: Quarter = (`Q${Math.floor(currentMonth / 3) + 1}` as Quarter);

  const [year, setYear] = useState<number>(currentYear);
  const [quarter, setQuarter] = useState<Quarter>(defaultQuarter);
  const { items, loading, updateStatus, addItem, deleteItem } = useQuarterlyActionPlan(year);
  const [addOpen, setAddOpen] = useState(false);

  const quarterItems = useMemo(() => items.filter((i) => i.quarter === quarter), [items, quarter]);
  const doneCount = quarterItems.filter((i) => i.status === "done").length;
  const totalCount = quarterItems.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      {/* Header & selectors */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Quarterly Action Plan
          </h2>
          <p className="text-sm text-muted-foreground">
            Time-boxed targets to hit profit, growth, and compliance every quarter.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={quarter} onValueChange={(v) => setQuarter(v as Quarter)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUARTERS.map((q) => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Progress summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              {doneCount} of {totalCount} {quarter} {year} targets complete
            </div>
            <div className="text-sm text-muted-foreground">{progress}%</div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Items list */}
      <Card>
        <CardHeader>
          <CardTitle>{quarter} {year} Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : quarterItems.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No items yet for {quarter} {year}. Add one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {quarterItems.map((item) => (
                <ActionItemRow
                  key={item.id}
                  item={item}
                  onStatusChange={(s) => updateStatus(item.id, s)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultQuarter={quarter}
        defaultYear={year}
        onSubmit={async (data) => {
          await addItem({
            ...data,
            status: "todo",
            completion_notes: null,
            sort_order: quarterItems.length + 1,
          });
          setAddOpen(false);
        }}
      />
    </div>
  );
};

const ActionItemRow: React.FC<{
  item: QuarterlyActionItem;
  onStatusChange: (s: ActionStatus) => void;
  onDelete: () => void;
}> = ({ item, onStatusChange, onDelete }) => {
  const meta = STATUS_META[item.status];
  const Icon = meta.icon;
  const dueHighlight = dueClass(item.target_date, item.status);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${dueHighlight}`}
    >
      <button
        onClick={() => onStatusChange(item.status === "done" ? "todo" : "done")}
        className="mt-0.5 flex-shrink-0"
        aria-label="Toggle done"
      >
        <Icon className={`h-5 w-5 ${item.status === "done" ? "text-green-600" : "text-muted-foreground"}`} />
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
          {item.title}
        </div>
        {item.description && (
          <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
          {item.target_date && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(item.target_date), "MMM d, yyyy")}
            </span>
          )}
          {item.owner && (
            <span className="text-xs text-muted-foreground">Owner: {item.owner}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Select value={item.status} onValueChange={(v) => onStatusChange(v as ActionStatus)}>
          <SelectTrigger className={`h-7 text-xs px-2 ${meta.className} border-0 w-[120px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_META) as ActionStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const AddItemDialog: React.FC<{
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultQuarter: Quarter;
  defaultYear: number;
  onSubmit: (data: {
    quarter: Quarter;
    year: number;
    category: string;
    title: string;
    description: string | null;
    target_date: string | null;
    owner: string | null;
  }) => void;
}> = ({ open, onOpenChange, defaultQuarter, defaultYear, onSubmit }) => {
  const [quarter, setQuarter] = useState<Quarter>(defaultQuarter);
  const [year] = useState<number>(defaultYear);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [targetDate, setTargetDate] = useState("");
  const [owner, setOwner] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      quarter,
      year,
      title: title.trim(),
      description: description.trim() || null,
      category,
      target_date: targetDate || null,
      owner: owner.trim() || null,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setOwner("");
    setCategory("general");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Quarterly Action Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Quarter</Label>
              <Select value={quarter} onValueChange={(v) => setQuarter(v as Quarter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUARTERS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hit TT$100k cumulative revenue" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Target Date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div>
              <Label>Owner</Label>
              <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="optional" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuarterlyActionPlanTab;
