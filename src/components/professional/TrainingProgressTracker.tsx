
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Award, BookOpen, Shield, Heart, HandHeart, Users, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TrainingProgressTracker = () => {
  const { modules, loading, error, totalProgress } = useTrainingProgress();

  // Function to get the icon component based on the icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return BookOpen;
      case 'Heart': return Heart;
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'HandHeart': return HandHeart;
      case 'FileText': return FileText;
      default: return BookOpen;
    }
  };

  // Get the first module ID for the Continue Training button
  const getFirstModuleId = () => {
    if (modules.length > 0) {
      return modules[0].id;
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
            <div className="flex justify-center items-center p-6">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              <span className="ml-2 text-primary-600">Loading training progress...</span>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  const firstModuleId = getFirstModuleId();
  // Changed to always link to the training resources page
  const continueTrainingUrl = "/professional/training-resources";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-xl font-semibold">Training Progress</CardTitle>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600">Your learning journey</p>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{totalProgress}%</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Training Program Sections */}
          <div className="mb-2">
            <h3 className="text-sm font-medium mb-2 text-primary-700">Step 1: Self-Paced Online Training</h3>
          </div>

          {/* Training Modules */}
          <div className="space-y-3">
            {modules.map((module) => {
              const IconComponent = getIconComponent(module.icon);
              
              return (
                <Link 
                  key={module.id} 
                  to={`/professional/training-resources/module/${module.id}`} 
                  className="block"
                >
                  <div className="space-y-1 hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {module.completed ? (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                            <Award className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600">
                            <IconComponent className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span className="font-medium text-sm">{module.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {module.completedLessons}/{module.totalLessons} • {module.estimatedTime}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          module.completed 
                            ? 'bg-green-500' 
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Continue Training Button - Updated link to go to training resources */}
          <Link to="/professional/training-resources" className="block w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex justify-between items-center border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg py-4"
            >
              <span className="text-sm">Continue Training</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Certificates Section */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600">
                <Award className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-sm">
                {modules.filter(m => m.completed).length} {modules.filter(m => m.completed).length === 1 ? 'Certificate' : 'Certificates'} Earned
              </span>
            </div>
            {/* Updated View All link to go to training resources */}
            <Link to="/professional/training-resources">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 text-sm h-8 px-3">
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
