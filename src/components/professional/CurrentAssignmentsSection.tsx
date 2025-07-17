import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentAssignments } from "@/hooks/useCurrentAssignments";
import { Users, Calendar, Star, MessageSquare, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const getAssignmentTypeConfig = (type: string) => {
  switch (type) {
    case 'manual':
      return {
        label: 'Manual Match',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Star
      };
    case 'care_team':
      return {
        label: 'Care Team',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Users
      };
    case 'automatic':
      return {
        label: 'Automatic Match',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Calendar
      };
    default:
      return {
        label: 'Assignment',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Users
      };
  }
};

export const CurrentAssignmentsSection = () => {
  const { assignments, loading, error } = useCurrentAssignments();

  // Only render if there are active assignments
  if (loading || error || assignments.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-blue-600" />
            Current Assignments
          </CardTitle>
          <CardDescription>
            Your active family assignments and care team roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const config = getAssignmentTypeConfig(assignment.type);
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {assignment.familyName}
                        </h4>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                      {assignment.carePlanTitle && (
                        <p className="text-sm text-gray-600 mb-1">
                          Care Plan: {assignment.carePlanTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Assigned: {new Date(assignment.assignmentDate).toLocaleDateString()}
                        </span>
                        {assignment.matchScore && (
                          <span>
                            Match Score: {Math.round(assignment.matchScore)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/professional/family-matches`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    {assignment.type === 'care_team' && assignment.carePlanId && (
                      <Link to={`/professional/care-plans/${assignment.carePlanId}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Care Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {assignments.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {assignments.length} active assignment{assignments.length > 1 ? 's' : ''}
                </span>
                <Link to="/professional/family-matches">
                  <Button variant="outline" size="sm">
                    View All Matches
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};