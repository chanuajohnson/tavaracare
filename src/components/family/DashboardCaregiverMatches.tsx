import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Eye, Calendar, MapPin, DollarSign, Sparkles, Star } from "lucide-react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { CaregiverChatModal } from "./CaregiverChatModal";
import { MatchBrowserModal } from "./MatchBrowserModal";
import { MatchDetailModal } from "./MatchDetailModal";
import { MatchLoadingState } from "@/components/ui/match-loading-state";
import { FamilyCaregiverLiveChatModal } from "./FamilyCaregiverLiveChatModal";
import { checkLiveChatEligibilityForFamily } from "@/services/chat/chatEligibility";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const { matches, isLoading } = useUnifiedMatches("family", false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  if (!user) return null;

  const displayMatches = matches.slice(0, 3); // same "preview" feel as Family card
  const bestMatch = matches[0];

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const professionalLabel = (cg: any) => {
    if (cg?.professional_type === "gapp") return "GAPP Certified";
    if (cg?.professional_type) return cg.professional_type;
    if (cg?.certifications?.length) return cg.certifications[0];
    return "Professional Caregiver";
  };

  const pillClass = (score?: number) => {
    const s = score ?? 0;
    if (s >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (s >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

const scheduleLabels: Record<string, string> = {
  flexible: "Flexible",
  mon_fri_6am_6pm: "Mon–Fri, 6 AM–6 PM",
  sat_sun_6am_6pm: "Sat–Sun, 6 AM–6 PM",
  weekday_evening_6pm_6am: "Weekday Evenings (6 PM–6 AM)",
  weekend_evening_6pm_6am: "Weekend Evenings (6 PM–6 AM)",
  mon_fri_8am_4pm: "Mon–Fri, 8 AM–4 PM",
  mon_fri_8am_6pm: "Mon–Fri, 8 AM–6 PM",
  live_in_care: "Live-in Care",
  "24_7_care": "24/7 Care",
  // add more known codes as you use them
};

function formatSchedule(raw?: string | null): string | null {
  if (!raw) return null;
  return raw
    .split(",")
    .map((p) => p.trim())
    .map((p) => scheduleLabels[p] ?? p.replace(/_/g, " "))
    .join(" • ");
}

  const formatRate = (rate?: string | number) => {
    if (!rate) return null;
    if (typeof rate === 'number') return `$${rate}/hr`;
    if (typeof rate === 'string') {
      const match = rate.match(/(\d+)/);
      return match ? `$${match[1]}/hr` : rate;
    }
    return rate;
  };

  return (
    <>
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Your Caregiver Matches</CardTitle>
            <p className="text-sm text-gray-500">
              {matches.length} caregiver{matches.length === 1 ? "" : "s"} match your care needs and schedule
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowBrowserModal(true)}>
            View All Matches
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading || !isLoadingComplete ? (
            <MatchLoadingState duration={1200} onComplete={() => setIsLoadingComplete(true)} />
          ) : displayMatches.length ? (
            <div className="space-y-4">
              {/* TEMP DEBUG — remove after */}
              {(() => { console.debug('[CG matches in card]', displayMatches.slice(0, 1)[0]); return null; })()}
              {displayMatches.map((cg, idx) => {
                const label = professionalLabel(cg);
                const matchScore = cg?.match_score ?? 90;

                return (
                  <div
                    key={cg.id}
                    className={`p-4 rounded-lg border ${cg?.is_premium ? "border-amber-300" : "border-gray-200"} relative`}
                  >
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Best Match
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* LEFT: avatar + identity + match */}
                      <div className="flex flex-col items-center sm:items-start sm:w-1/4">
                        <div className="h-16 w-16 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center overflow-hidden">
                          {cg?.avatar_url ? (
                            <img
                              src={cg.avatar_url}
                              alt={label}
                              className="h-full w-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-primary">{initials(label)}</span>
                          )}
                        </div>

                        <div className="mt-2 text-center sm:text-left">
                          <h3 className="font-semibold">{label}</h3>
                          <div className="text-xs text-blue-600 mt-1">* Name protected until subscription</div>

                          <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{cg?.location || "Trinidad and Tobago"}</span>
                          </div>

                          <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                            <span className="text-sm font-medium text-primary-700">{matchScore}% Match</span>
                          </div>

                          {/* schedule compatibility pill to mirror family UI */}
                          {typeof cg?.shift_compatibility_score === "number" && (
                            <div className={`mt-1 rounded px-2 py-1 text-center border ${pillClass(cg.shift_compatibility_score)}`}>
                              <span className="text-xs font-medium flex items-center justify-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Schedule Compatible
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MIDDLE: details */}
                      <div className="sm:w-2/4 space-y-2">
                         <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              <span>{formatSchedule(cg.care_schedule) ?? "Schedule available upon request"}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                              <span>{cg.hourly_rate ?? "Rate available upon request"}</span>
                            </div>
                         </div>

                        <div className="text-sm">
                          <span className="font-medium block mb-1">Experience</span>
                          <div className="text-gray-700">{cg.years_of_experience ?? 'Experience not specified'}</div>
                        </div>

                        {Array.isArray(cg?.care_types) && cg.care_types.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium block mb-1">Care Services</span>
                            <div className="flex flex-wrap gap-1">
                              {cg.care_types.slice(0, 6).map((t: string, i: number) => (
                                <span key={i} className="px-2 py-1 rounded border bg-gray-50 text-gray-700">
                                  {t}
                                </span>
                              ))}
                              {cg.care_types.length > 6 && (
                                <span className="px-2 py-1 rounded border bg-gray-50 text-gray-700">
                                  +{cg.care_types.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {cg?.match_explanation && (
                          <div className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                            <span className="text-blue-700 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {cg.match_explanation}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* RIGHT: rating + CTAs */}
                      <div className="sm:w-1/4 flex flex-col justify-center space-y-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className="h-4 w-4 text-amber-400" />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">5.0</span>
                        </div>

                        <Button
                          className="w-full flex items-center gap-2"
                          onClick={async () => {
                            setSelectedCaregiver(cg);
                            const eligible = await checkLiveChatEligibilityForFamily(cg.id);
                            if (eligible) {
                              setShowLiveChatModal(true);
                            } else {
                              setShowChatModal(true);
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat with Caregiver
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full flex items-center gap-2"
                          onClick={() => {
                            setSelectedCaregiver(cg);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button variant="outline" className="w-full mt-2" onClick={() => setShowBrowserModal(true)}>
                View All {matches.length} Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">No caregiver matches found</div>
          )}
        </CardContent>
      </Card>

      {selectedCaregiver && (
        <>
          <CaregiverChatModal open={showChatModal} onOpenChange={setShowChatModal} caregiver={selectedCaregiver} />
          <FamilyCaregiverLiveChatModal open={showLiveChatModal} onOpenChange={setShowLiveChatModal} caregiver={selectedCaregiver} />
        </>
      )}

      <MatchBrowserModal
        open={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        onSelectMatch={(id) => {
          const cg = matches.find((m) => m.id === id);
          setSelectedCaregiver(cg);
          setShowDetailModal(true);
        }}
        onStartChat={async (id) => {
          const cg = matches.find((m) => m.id === id) || bestMatch;
          setSelectedCaregiver(cg);
          const eligible = await checkLiveChatEligibilityForFamily(cg.id);
          if (eligible) {
            setShowLiveChatModal(true);
          } else {
            setShowChatModal(true);
          }
        }}
      />

      <MatchDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiver}
        onStartChat={async () => {
          setShowDetailModal(false);
          if (selectedCaregiver) {
            const eligible = await checkLiveChatEligibilityForFamily(selectedCaregiver.id);
            if (eligible) setShowLiveChatModal(true);
            else setShowChatModal(true);
          }
        }}
      />
    </>
  );
};