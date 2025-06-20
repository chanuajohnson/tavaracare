
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, Calendar, MapPin, Clock, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface FamilyMatch {
  id: string;
  family_name: string;
  location: string;
  care_recipient_name: string;
  care_types: string[];
  schedule_preference: string;
  match_score: number;
  distance: string;
  hourly_rate: string;
  description: string;
}

export const DashboardFamilyMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<FamilyMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll show some sample matches
      // In a real app, this would fetch actual matches from the database
      const sampleMatches: FamilyMatch[] = [
        {
          id: "1",
          family_name: "The Johnson Family",
          location: "Downtown, 2.3 miles away",
          care_recipient_name: "Margaret Johnson",
          care_types: ["Personal Care", "Companionship", "Medication Management"],
          schedule_preference: "Monday-Friday, 8 AM - 4 PM",
          match_score: 92,
          distance: "2.3 miles",
          hourly_rate: "$18-22/hour",
          description: "Looking for a caring and experienced caregiver for our mother who has early-stage dementia."
        },
        {
          id: "2", 
          family_name: "The Williams Family",
          location: "Westside, 4.1 miles away",
          care_recipient_name: "Robert Williams",
          care_types: ["Mobility Assistance", "Meal Preparation", "Transportation"],
          schedule_preference: "Tuesday, Thursday, Saturday, 10 AM - 6 PM",
          match_score: 88,
          distance: "4.1 miles", 
          hourly_rate: "$20-25/hour",
          description: "Seeking a reliable caregiver to help our father with daily activities and mobility support."
        }
      ];
      
      setMatches(sampleMatches);
    } catch (error) {
      console.error("Error loading family matches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      id="family-matches"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-green-600" />
            Family Matches
          </CardTitle>
          <p className="text-sm text-gray-500">
            Families looking for caregivers with your skills and availability
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Finding your perfect matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{match.family_name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{match.match_score}% match</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Care Recipient:</p>
                      <p className="text-sm text-gray-600">{match.care_recipient_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hourly Rate:</p>
                      <p className="text-sm text-gray-600">{match.hourly_rate}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Care Types Needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {match.care_types.map((type) => (
                        <span
                          key={type}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Schedule:
                    </p>
                    <p className="text-sm text-gray-600">{match.schedule_preference}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{match.description}</p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      Contact Family
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center pt-4">
                <Button variant="outline">
                  View All Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Matches Yet</h3>
              <p className="text-gray-500 mb-4">
                Complete your profile to start receiving family match recommendations.
              </p>
              <Button variant="outline">
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
