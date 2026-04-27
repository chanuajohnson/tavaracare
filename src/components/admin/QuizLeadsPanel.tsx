import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Mail, RefreshCw, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { readinessStages, type ReadinessStage } from "@/data/familyReadinessQuiz";
import { cn } from "@/lib/utils";

const TAVARA_WHATSAPP = "18687865357";

interface QuizLead {
  id: string;
  name: string;
  contact_method: string;
  whatsapp_number: string | null;
  email: string | null;
  client_stage: number;
  reflection: string | null;
  source_path: string | null;
  converted_user_id: string | null;
  created_at: string;
}

export const QuizLeadsPanel: React.FC = () => {
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_leads")
      .select(
        "id, name, contact_method, whatsapp_number, email, client_stage, reflection, source_path, converted_user_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[QuizLeadsPanel] load failed:", error);
      toast.error("Failed to load quiz leads");
    } else {
      setLeads((data || []) as QuizLead[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleNudge = (lead: QuizLead) => {
    if (!lead.whatsapp_number) {
      toast.error("This lead doesn't have a WhatsApp number on file.");
      return;
    }
    const stageDef = readinessStages[lead.client_stage as ReadinessStage];
    const message = encodeURIComponent(
      `Hi ${lead.name.split(" ")[0]} 💙 — this is Tavara following up on your Care Readiness Check. ` +
        `Your result was "${stageDef?.badgeText || "your stage"}". ` +
        `${stageDef?.title || ""} ` +
        `Would love to chat about how we can help.`
    );
    const cleaned = lead.whatsapp_number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleaned}?text=${message}`, "_blank");
  };

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.name?.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s) ||
      l.whatsapp_number?.includes(s) ||
      l.reflection?.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: leads.length,
    whatsapp: leads.filter((l) => l.contact_method === "whatsapp").length,
    email: leads.filter((l) => l.contact_method === "email").length,
    converted: leads.filter((l) => l.converted_user_id).length,
  };

  const stageBadgeClass = (stage: number) => {
    const def = readinessStages[stage as ReadinessStage];
    return cn("border-current", def?.iconTextClass || "text-muted-foreground");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Quiz Leads
          <Badge variant="secondary" className="ml-2">
            {stats.total}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total leads</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.whatsapp}
            </div>
            <div className="text-xs text-muted-foreground">WhatsApp</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.email}</div>
            <div className="text-xs text-muted-foreground">Email</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-2xl font-bold text-primary">
              {stats.converted}
            </div>
            <div className="text-xs text-muted-foreground">Converted to user</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, reflection…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="hidden md:table-cell">Reflection</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {leads.length === 0
                      ? "No quiz leads yet. They'll appear here when anonymous visitors complete the Care Readiness Check."
                      : "No leads match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => {
                  const stageDef = readinessStages[lead.client_stage as ReadinessStage];
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {lead.contact_method === "whatsapp" ? (
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                          )}
                          <span className="text-sm text-foreground/80">
                            {lead.whatsapp_number || lead.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stageBadgeClass(lead.client_stage)}>
                          {stageDef?.badgeText || `Stage ${lead.client_stage}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        {lead.reflection ? (
                          <span className="text-xs text-foreground/70 italic line-clamp-2">
                            "{lead.reflection}"
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.converted_user_id ? (
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            Converted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNudge(lead)}
                          disabled={!lead.whatsapp_number}
                          title={
                            lead.whatsapp_number
                              ? "Nudge via WhatsApp"
                              : "No WhatsApp number on file"
                          }
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          Nudge
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizLeadsPanel;
