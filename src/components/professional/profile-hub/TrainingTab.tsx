
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

interface TrainingTabProps {
  loadingModules: boolean;
  modules: any[];
  totalProgress: number;
}

export function TrainingTab({ loadingModules, modules, totalProgress }: TrainingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
        <CardDescription>
          Your professional development and training modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingModules ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Overall Progress</span>
                <span>{totalProgress}% Complete</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
            
            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{module.title ? `Training module focused on ${module.title}` : 'Learn more about caregiving'}</p>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>{module.progress}% Complete</span>
                          <span>{module.completedLessons}/{module.totalLessons} Lessons</span>
                        </div>
                        <Progress value={module.progress} className="h-1.5" />
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/professional/training-resources?module=${module.id}`}>
                          Continue Training
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No training modules yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  Training modules will be assigned to you based on your role and experience.
                </p>
                <Button asChild variant="outline">
                  <Link to="/professional/training-resources">
                    Browse Training Resources
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
