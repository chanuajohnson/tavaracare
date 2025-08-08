
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageCircle, Eye } from "lucide-react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { SimpleMatchCard } from "./SimpleMatchCard";
import { CaregiverChatModal } from "./CaregiverChatModal";
import { MatchBrowserModal } from "./MatchBrowserModal";
import { MatchDetailModal } from "./MatchDetailModal";
import { MatchLoadingState } from "@/components/ui/match-loading-state";

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const { matches, isLoading } = useUnifiedMatches('family', false); // Show all matches
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  if (!user) {
    return null;
  }

  const displayMatches = matches.slice(0, 6); // Show top 6 matches on dashboard
  const bestMatch = matches[0];

  const handleStartChat = () => {
    setSelectedCaregiver(bestMatch);
    setShowChatModal(true);
  };

  const handleViewDetails = () => {
    setSelectedCaregiver(bestMatch);
    setShowDetailModal(true);
  };

  return (
    <>
      <Card id="caregiver-matches-section" className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Your Caregiver Matches
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </CardTitle>
            <p className="text-sm text-gray-500">
              {matches.length} caregiver{matches.length === 1 ? '' : 's'} match your care needs and schedule
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowBrowserModal(true)}>
            <span>View All Matches</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Debug logging without JSX expression */}
          {(() => {
            if (matches.length > 0) {
              console.log('🔍 Debug caregiver data:', matches.slice(0, 3).map((c, i) => ({
                index: i,
                id: c.id,
                full_name: c.full_name,
                years_of_experience: c.years_of_experience,
                hourly_rate: (c as any).hourly_rate,
                expected_rate: (c as any).expected_rate,
                professional_type: (c as any).professional_type
              })));
            }
            return null;
          })()}
          
          {(isLoading || !isLoadingComplete) ? (
            <MatchLoadingState 
              duration={2000}
              onComplete={() => setIsLoadingComplete(true)}
            />
          ) : displayMatches.length > 0 ? (
            <div className="space-y-6">
              {displayMatches.map((caregiver, index) => {
                const getInitials = (name: string) => {
                  return name.split(' ').map(n => n[0]).join('').toUpperCase();
                };

                const getCompatibilityColor = (score: number) => {
                  if (score >= 85) return 'text-green-600';
                  if (score >= 70) return 'text-blue-600';
                  if (score >= 50) return 'text-yellow-600';
                  return 'text-red-600';
                };

                const getCompatibilityIcon = (score: number) => {
                  if (score >= 85) return '🟢';
                  if (score >= 70) return '🔵';
                  if (score >= 50) return '🟡';
                  return '🔴';
                };

                const formatExperience = (exp?: string | number | null): string => {
                  if (exp == null || exp === '') return 'Experience available upon request';

                  // If the hook already returns phrases like "6-10 years" or "More than 10 years"
                  const str = String(exp).trim();
                  const hasYears = /\byear\b|\byears\b/i.test(str);
                  // If it already contains "year(s)", show it as-is. Otherwise add "years experience".
                  return hasYears ? str : `${str} years experience`;
                };

                const formatRate = (
                  rate?: number | string | null,
                  currency: string = 'TTD'
                ): string => {
                  if (rate == null || rate === '') return 'Rate available upon request';

                  // Numeric → "TTD $40/hour"
                  if (typeof rate === 'number') {
                    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(rate) + '/hour';
                  }

                  // String cases: "40/hr", "$40/hr", "TTD 40", "40"
                  const raw = rate.trim();

                  // Extract the first number in the string
                  const match = raw.replace(',', '').match(/(\d+(\.\d+)?)/);
                  if (match) {
                    const num = Number(match[1]);
                    if (!Number.isNaN(num)) {
                      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num) +
                        (/\bhour|hr\b/i.test(raw) ? (raw.toLowerCase().includes('hr') ? '/hr' : '/hour') : '/hour');
                    }
                  }

                  // Fallback: show original string (already formatted)
                  return raw;
                };

                const formatAvailability = (schedule?: string) => {
                  if (!schedule) return 'Flexible schedule';
                  
                  const scheduleMap: { [key: string]: string } = {
                    'mon_fri_8am_4pm': 'Mon-Fri, 8 AM - 4 PM',
                    'mon_fri_8am_6pm': 'Mon-Fri, 8 AM - 6 PM',
                    'weekday_evening_6pm_6am': 'Weekday evenings, 6 PM - 6 AM',
                    'sat_sun_8am_4pm': 'Weekends, 8 AM - 4 PM',
                    'flexible': 'Flexible schedule',
                    'live_in_care': 'Live-in care available',
                    '24_7_care': '24/7 care available'
                  };

                  const schedules = schedule.split(',').map(s => s.trim());
                  const formatted = schedules.map(s => scheduleMap[s] || s).join(', ');
                  return formatted || 'Flexible schedule';
                };

                const getProfessionalDisplay = () => {
                  const profType = (caregiver as any).professional_type;
                  if (profType === 'gapp') return 'GAPP Certified';
                  if (profType) return profType;
                  if ((caregiver as any).certifications?.length > 0) return (caregiver as any).certifications[0];
                  return 'Professional Caregiver';
                };

                const getCareServices = () => {
                  if (!caregiver.care_types) return [];
                  if (Array.isArray(caregiver.care_types)) return caregiver.care_types;
                  return [];
                };

                return (
                  <Card key={caregiver.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1: Avatar & Basic Info */}
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                          <div className="relative mb-4">
                            {caregiver.avatar_url ? (
                              <img
                                src={caregiver.avatar_url}
                                alt={caregiver.full_name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">
                                  {getInitials(caregiver.full_name || 'CG')}
                                </span>
                              </div>
                            )}
                            {index === 0 && (
                              <div className="absolute -top-2 -right-6 sm:-right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full whitespace-nowrap z-10">
                                Best Match
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-1">
                            {caregiver.full_name || 'Professional Caregiver'}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                            <span>📍</span>
                            {caregiver.location || 'Location available upon contact'}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl font-bold text-primary">
                              {caregiver.match_score || 92}%
                            </span>
                            <span className="text-sm text-muted-foreground">Match</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm">
                            <span>{getCompatibilityIcon(caregiver.match_score || 92)}</span>
                            <span className={getCompatibilityColor(caregiver.match_score || 92)}>
                              Schedule Compatible
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Details & Services */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-primary font-medium">
                                {getProfessionalDisplay()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatExperience(caregiver.years_of_experience)}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Care Services</h4>
                            <div className="flex flex-wrap gap-2">
                              {getCareServices().slice(0, 4).map((service, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-muted rounded-md text-sm"
                                >
                                  {service}
                                </span>
                              ))}
                              {getCareServices().length > 4 && (
                                <span className="px-2 py-1 bg-muted rounded-md text-sm">
                                  +{getCareServices().length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              🕒 {formatAvailability((caregiver as any).care_schedule)}
                            </span>
                          </div>

                           <div className="flex items-center gap-4 text-sm">
                             <span className="flex items-center gap-1">
                               💰 {formatRate((caregiver as any).hourly_rate ?? (caregiver as any).expected_rate, 'TTD')}
                             </span>
                           </div>

                          {(caregiver as any).transportation_available && (
                            <div className="flex items-center gap-1 text-sm">
                              🚗 Own transportation
                            </div>
                          )}

                          {caregiver.match_explanation && (
                            <div className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                              <span className="text-primary">✨</span>
                              <span>{caregiver.match_explanation}</span>
                            </div>
                          )}
                        </div>

                        {/* Column 3: Actions & Rating */}
                        <div className="flex flex-col items-center lg:items-end space-y-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-yellow-400 text-lg">
                                ⭐
                              </span>
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">5.0</span>
                          </div>

                          <div className="space-y-2 w-full lg:w-auto">
                            <Button
                              onClick={() => {
                                setSelectedCaregiver(caregiver);
                                setShowChatModal(true);
                              }}
                              className="w-full lg:w-auto"
                              size="sm"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat with Caregiver
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedCaregiver(caregiver);
                                setShowDetailModal(true);
                              }}
                              className="w-full lg:w-auto"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>

                          {(caregiver as any).background_check && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              ✅ Background Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={handleStartChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Best Match
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBrowserModal(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All {matches.length} Matches
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Matches Found</h3>
              <p className="text-gray-500 mt-2 mb-4">
                Complete your care assessment to get personalized caregiver matches.
              </p>
              <Button variant="outline" onClick={() => setShowBrowserModal(true)}>
                Find Matches
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCaregiver && (
        <CaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={selectedCaregiver}
        />
      )}

      <MatchBrowserModal
        open={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        onSelectMatch={(id) => {
          const caregiver = matches.find(m => m.id === id);
          setSelectedCaregiver(caregiver);
          setShowDetailModal(true);
        }}
        onStartChat={(id) => {
          const caregiver = matches.find(m => m.id === id) || bestMatch;
          setSelectedCaregiver(caregiver);
          setShowChatModal(true);
        }}
      />

      <MatchDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiver}
        onStartChat={() => {
          setShowDetailModal(false);
          setShowChatModal(true);
        }}
      />
    </>
  );
};
