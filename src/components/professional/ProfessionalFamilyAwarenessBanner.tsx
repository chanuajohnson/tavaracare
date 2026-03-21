import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ProfessionalFamilyAwarenessBanner() {
  const [unmatchedCount, setUnmatchedCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUnmatchedFamilies = async () => {
      try {
        const { data, error } = await supabase.rpc('get_unmatched_family_count');
        if (error) throw error;
        console.log("[FamilyAwarenessBanner] Unmatched families:", data);
        setUnmatchedCount(data ?? 0);
      } catch (err) {
        console.error("[FamilyAwarenessBanner] Error:", err);
        setUnmatchedCount(null);
      }
    };

    fetchUnmatchedFamilies();

    const channel = supabase
      .channel("family-awareness")
      .on("postgres_changes", { event: "*", schema: "public", table: "caregiver_assignments" }, () => {
        fetchUnmatchedFamilies();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (unmatchedCount === null || unmatchedCount === 0) return null;

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-blue-900">
                <span className="text-lg">{unmatchedCount}</span>{" "}
                {unmatchedCount === 1 ? "family is" : "families are"} actively looking for caregivers
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Keep your profile updated to improve your match chances
              </p>
            </div>
          </div>
          <Link to="/caregiver/matching" className="shrink-0">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              Browse Families
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
