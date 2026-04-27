import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Star } from "lucide-react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { SimpleMatchCard } from "./SimpleMatchCard";
import { MatchLoadingState } from "@/components/ui/match-loading-state";

interface MatchBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMatch?: (caregiverId: string) => void;
  onStartChat?: (caregiverId: string) => void;
}

export const MatchBrowserModal = ({ 
  open, 
  onOpenChange,
  onSelectMatch,
  onStartChat
}: MatchBrowserModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCareType, setSelectedCareType] = useState<string | null>(null);
  
  const { matches, isLoading: dataLoading } = useUnifiedMatches('family', false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setSearchTerm("");
      setSelectedCareType(null);
    }
  }, [open]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = !searchTerm || 
      match.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.care_types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCareType = !selectedCareType || 
      match.care_types?.includes(selectedCareType);

    return matchesSearch && matchesCareType;
  });

  const allCareTypes = Array.from(
    new Set(matches.flatMap(match => match.care_types || []))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Browse All Matches</DialogTitle>
          <DialogDescription>
            Explore all available caregivers in your area
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="px-6 pb-6">
            <MatchLoadingState 
              title="Loading All Matches"
              duration={2000}
              onComplete={handleLoadingComplete}
            />
          </div>
        ) : (
          <div className="flex flex-col h-[70vh]">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Care Type Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCareType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCareType(null)}
                >
                  All Types
                </Button>
                {allCareTypes.slice(0, 5).map(type => (
                  <Button
                    key={type}
                    variant={selectedCareType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCareType(type)}
                  >
                    {type}
                  </Button>
                ))}
                {allCareTypes.length > 5 && (
                  <Badge variant="outline">+{allCareTypes.length - 5} more</Badge>
                )}
              </div>
            </div>

            {/* Results */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {filteredMatches.length} caregivers found
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-amber-400" />
                    Sorted by match score
                  </div>
                </div>
                
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No caregivers match your search criteria</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCareType(null);
                      }}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                     {filteredMatches.map(match => (
                      <SimpleMatchCard
                        key={match.id}
                        caregiver={match}
                        variant="modal"
                        onChatClick={() => {
                          console.log('[MatchBrowserModal] DEBUG - Chat clicked for match:', {
                            matchId: match.id,
                            matchObject: match,
                            caregiverName: match.full_name,
                            location: match.location,
                            careTypes: match.care_types,
                            hasCompleteData: !!(match.id && match.full_name),
                            component: 'MatchBrowserModal',
                            timestamp: new Date().toISOString()
                          });
                          onStartChat?.(match.id);
                        }}
                        onViewDetails={() => {
                          console.log('[MatchBrowserModal] DEBUG - View details clicked for match:', {
                            matchId: match.id,
                            matchObject: match,
                            component: 'MatchBrowserModal'
                          });
                          onSelectMatch?.(match.id);
                        }}
                        className="hover:shadow-md transition-shadow"
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};