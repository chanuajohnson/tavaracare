import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function ProfessionalMatchingReadinessBanner() {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <RefreshCw className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-amber-900">
                Matching is active — stay ready!
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Tavara is connecting families with caregivers. Make sure you're prepared:
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-sm text-amber-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  Update your availability &amp; schedule
                </li>
                <li className="flex items-center gap-2 text-sm text-amber-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  Complete all certifications
                </li>
                <li className="flex items-center gap-2 text-sm text-amber-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  Upload required documents
                </li>
              </ul>
            </div>
          </div>
          <Link to="/professional/profile" className="shrink-0">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
              Update Profile
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
