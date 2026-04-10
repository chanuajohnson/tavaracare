
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown, ClipboardCheck, Monitor, FileText,
  Pill, UtensilsCrossed, ListChecks, LayoutDashboard, MessageSquare,
  Heart, Users, CalendarCheck, DollarSign
} from "lucide-react";
import { ONBOARDING_SECTION_DEFS } from "@/components/admin/onboarding/onboardingSections";

const ICON_MAP: Record<string, React.ReactNode> = {
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Pill: <Pill className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
  ListChecks: <ListChecks className="h-5 w-5" />,
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  CalendarCheck: <CalendarCheck className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
};

export default function OnboardingGuidePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tavara.Care Family Onboarding Guide</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This is the comprehensive onboarding checklist our care coordinators follow when welcoming new families. 
            It covers everything from discovery to care plan setup and first-week follow-up.
          </p>
        </div>

        <div className="space-y-3">
          {ONBOARDING_SECTION_DEFS.map((section) => {
            const isOpen = openSections[section.id] ?? false;

            return (
              <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <Card>
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                          {ICON_MAP[section.iconName] || <ClipboardCheck className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">
                            {section.title}
                            <Badge variant="secondary" className="text-xs ml-2">
                              {section.items.length} items
                            </Badge>
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      <ul className="space-y-2 pl-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tavara.Care — Empowering families with compassionate care coordination.</p>
        </div>
      </div>
    </div>
  );
}
