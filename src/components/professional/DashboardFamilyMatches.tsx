
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, VideoOff, Users, MapPin, Clock, Star } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFamilyMatches } from '@/hooks/useFamilyMatches';
import { useVideoAvailability } from '@/hooks/useVideoAvailability';

export const DashboardFamilyMatches = () => {
  const { user } = useAuth();
  const { matches, loading: matchesLoading } = useFamilyMatches();
  const { videoAvailable, loading: videoLoading, updating, toggleVideoAvailability } = useVideoAvailability();

  if (matchesLoading || videoLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family Matches</CardTitle>
          <CardDescription>Loading your potential matches...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Matches
          </CardTitle>
          <CardDescription>
            Families looking for care that match your profile
          </CardDescription>
        </div>
        
        {/* Video Availability Toggle - Replaces "View All" button */}
        <Button
          onClick={toggleVideoAvailability}
          disabled={updating}
          variant={videoAvailable ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-2 min-w-[160px] ${
            videoAvailable 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : videoAvailable ? (
            <>
              <Video className="w-4 h-4" />
              Video Calls Enabled
            </>
          ) : (
            <>
              <VideoOff className="w-4 h-4" />
              Enable Video Calls
            </>
          )}
        </Button>
      </CardHeader>
      
      <CardContent>
        {/* Video Availability Status Banner */}
        <div className={`mb-4 p-3 rounded-lg border ${
          videoAvailable 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {videoAvailable ? (
              <>
                <Video className="w-4 h-4" />
                Video consultations enabled - Stand out to families!
              </>
            ) : (
              <>
                <VideoOff className="w-4 h-4" />
                Enable video calls to differentiate your services
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No matches yet</p>
              <p className="text-sm">
                Complete your profile to start receiving family matches
              </p>
            </div>
          ) : (
            matches.slice(0, 3).map((match) => (
              <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={match.avatar_url} />
                      <AvatarFallback>
                        {match.full_name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {match.full_name || 'Family Member'}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {match.match_percentage || 85}% match
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {match.care_recipient_name && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Care for {match.care_recipient_name}
                          </div>
                        )}
                        {match.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{match.address}</span>
                          </div>
                        )}
                        {match.care_schedule && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Array.isArray(match.care_schedule) 
                              ? match.care_schedule.slice(0, 2).join(', ')
                              : match.care_schedule
                            }
                          </div>
                        )}
                      </div>
                      
                      {match.care_types && match.care_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.care_types.slice(0, 3).map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                          {match.care_types.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.care_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    
                    {/* Show video indicator if professional has video enabled */}
                    {videoAvailable && (
                      <div className="flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video Available
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {matches.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View {matches.length - 3} more matches
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
