import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserCircle, 
  Calendar, 
  GraduationCap, 
  ClipboardList, 
  ListChecks, 
  FileText,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Briefcase,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  HelpCircle,
  BookOpen,
  Home
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useTracking } from "@/hooks/useTracking";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { ensureUserProfile } from "@/lib/profile-utils";
import { CareAssignmentCard } from "@/components/professional/CareAssignmentCard";
import { ProfessionalCalendar } from "@/components/professional/ProfessionalCalendar";
import { useCareShifts } from "@/hooks/useCareShifts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrackableButton } from "@/components/tracking/TrackableButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ProfessionalProfileHub = () => {
  // ... keep existing code (component implementation)

  return (
    <div className="container py-6 max-w-6xl">
      <DashboardHeader 
        title="Professional Profile Hub" 
        description="Manage your professional profile, view assignments, and track your progress"
        icon={<UserCircle className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" /> Profile
                </CardTitle>
                <CardDescription>Your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || ""} alt="Profile image" />
                    <AvatarFallback className="text-lg">
                      {userName ? userName.charAt(0).toUpperCase() : "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{userName || "Professional Name"}</h3>
                    <p className="text-sm text-gray-500">{specialization || "Healthcare Professional"}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile completion</h4>
                  <div className="space-y-2">
                    <Progress value={profileCompletionPercentage} className="h-2" />
                    <p className="text-xs text-gray-500 text-right">{profileCompletionPercentage}% complete</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{email || "email@example.com"}</p>
                      <p className="text-xs text-gray-500">Email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{phone || "Not provided"}</p>
                      <p className="text-xs text-gray-500">Phone</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{location || "Not provided"}</p>
                      <p className="text-xs text-gray-500">Location</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{availability || "Not provided"}</p>
                      <p className="text-xs text-gray-500">Availability</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Certifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {certifications && certifications.length > 0 ? (
                      certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No certifications added yet</p>
                    )}
                  </div>
                </div>

                <TrackableButton
                  variant="outline"
                  className="w-full"
                  actionType="profile_edit_click"
                  additionalData={{ source: "professional_profile_hub" }}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </TrackableButton>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Assignments</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Training</span>
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Assistant</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sun className="h-5 w-5 text-primary" /> Today's Overview
                    </CardTitle>
                    <CardDescription>Your assignments and schedule for today</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <h3 className="text-sm font-medium mb-2">Next Assignment</h3>
                          {isLoadingAssignments ? (
                            <div className="border rounded-md p-4">
                              <Skeleton className="h-8 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2 mb-4" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            </div>
                          ) : assignments.length > 0 ? (
                            <div className="border rounded-md p-4 bg-blue-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{assignments[0].title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{assignments[0].description}</p>
                                </div>
                                <Badge>{assignments[0].status || "Upcoming"}</Badge>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {new Date(assignments[0].scheduled_time).toLocaleDateString()} at {new Date(assignments[0].scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <div className="mt-4">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  asChild
                                >
                                  <Link to={`/professional/assignments/${assignments[0].id}`}>
                                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-md p-4 text-center bg-gray-50">
                              <p className="text-gray-500">No upcoming assignments</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Today's Stats</h3>
                          <div className="space-y-3">
                            <div className="border rounded-md p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Assignments</span>
                                <Badge variant="outline">{todayStats.assignments}</Badge>
                              </div>
                            </div>
                            <div className="border rounded-md p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Hours Scheduled</span>
                                <Badge variant="outline">{todayStats.hours}h</Badge>
                              </div>
                            </div>
                            <div className="border rounded-md p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Training Progress</span>
                                <Badge variant="outline">{trainingProgress}%</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {careShifts && careShifts.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Upcoming Shifts</h3>
                          <div className="border rounded-md p-4 bg-gray-50">
                            <div className="space-y-2">
                              {careShifts.slice(0, 3).map((shift) => (
                                <div 
                                  key={shift.id} 
                                  className="p-2 bg-white rounded-md border flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>{shift.title}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(shift.start_time).toLocaleDateString()} • 
                                    {new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {careShifts.length > 3 && (
                              <div className="mt-2 text-right">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => setActiveTab("schedule")}
                                >
                                  View all shifts
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assignments" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" /> Care Assignments
                    </CardTitle>
                    <CardDescription>View and manage your care assignments</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      {isLoadingAssignments ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <Skeleton className="h-6 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                  <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : assignments.length > 0 ? (
                        <>
                          <div className="space-y-4">
                            {assignments.map((assignment) => (
                              <CareAssignmentCard 
                                key={assignment.id} 
                                assignment={assignment} 
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 border rounded-md">
                          <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <h3 className="text-lg font-medium">No Assignments Yet</h3>
                          <p className="text-gray-500 mb-4">You don't have any care assignments yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <ProfessionalCalendar shifts={careShifts} loading={isLoadingCareShifts} />
              </TabsContent>
              
              <TabsContent value="training" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" /> Training Progress
                    </CardTitle>
                    <CardDescription>Track your professional training journey</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
                        <div className="space-y-1">
                          <Progress value={trainingProgress} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{trainingProgress}% Complete</span>
                            <span>{completedLessons} of {totalLessons} Lessons</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Training Modules</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link to="/professional/training-resources">
                              View All <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                        
                        {isLoadingTraining ? (
                          <div className="space-y-3">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="border rounded-md p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <div className="space-y-2">
                                  <Skeleton className="h-3 w-full" />
                                  <Skeleton className="h-2 w-full" />
                                  <Skeleton className="h-2 w-1/2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {trainingModules.map((module) => (
                              <div key={module.id} className="border rounded-md p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{module.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{module.lessons?.length || 0} lessons • {module.estimatedHours || 1} hours</p>
                                  </div>
                                  <Badge variant={module.completed ? "success" : "outline"}>
                                    {module.completed ? "Completed" : `${module.progress || 0}%`}
                                  </Badge>
                                </div>
                                
                                <Progress value={module.progress} className="h-1 mt-3" />
                                
                                <div className="mt-3 text-right">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs p-0 h-auto"
                                    asChild
                                  >
                                    <Link to={`/professional/module/${module.id}`}>
                                      Continue Learning
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Certificates</h3>
                        {certificates.length > 0 ? (
                          <div className="space-y-2">
                            {certificates.map((cert, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-primary" />
                                  <span>{cert.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">{cert.date}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md">
                            <Award className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm">Complete training modules to earn certificates</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assistant" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" /> Admin Assistant
                    </CardTitle>
                    <CardDescription>Request administrative help and documents</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border p-4 rounded-md bg-blue-50">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                          Job Verification Letters
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Need a letter confirming your employment status? Request a job verification letter that will be sent to you.
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Button 
                            onClick={() => handleRequestLetter('email')}
                            className="flex items-center gap-2"
                            disabled={isRequestingLetter}
                          >
                            <Mail className="h-4 w-4" />
                            Request via Email
                            {isRequestingLetter === 'email' && (
                              <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                          </Button>
                          
                          <Button 
                            onClick={() => handleRequestLetter('whatsapp')}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={isRequestingLetter}
                          >
                            <Phone className="h-4 w-4" />
                            Request via WhatsApp
                            {isRequestingLetter === 'whatsapp' && (
                              <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Recent Requests</h3>
                        {letterRequests.length > 0 ? (
                          <div className="space-y-2">
                            {letterRequests.map((request, index) => (
                              <div key={index} className="p-3 border rounded-md">
                                <div className="flex justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span>Job Verification Letter</span>
                                  </div>
                                  <Badge variant={request.status === 'completed' ? 'success' : 'outline'}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  Requested on {new Date(request.requestDate).toLocaleDateString()} via {request.method}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md">
                            <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm">No document requests yet</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Help Resources</h3>
                        <div className="space-y-2">
                          <div className="p-3 border rounded-md flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">Professional Guidelines</h4>
                              <p className="text-xs text-gray-500">View company policies and guidelines</p>
                            </div>
                          </div>
                          <div className="p-3 border rounded-md flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">FAQ</h4>
                              <p className="text-xs text-gray-500">Common questions and answers</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full mt-1"
                            asChild
                          >
                            <Link to="/faq">
                              View All Help Resources
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      
      <Dialog open={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
            <DialogDescription>
              Update your professional profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center">
              <p className="text-sm text-gray-500">Profile editing functionality coming soon!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalProfileHub;
