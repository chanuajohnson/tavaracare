
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, MessageSquare, Calendar, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const CommunityEngagement = () => {
  // This would normally be fetched from the backend
  const communityEvents = [
    {
      id: 1,
      title: "Caregiver Support Group",
      time: "Tomorrow, 7:00 PM",
      participants: 12,
      type: "Virtual",
      avatars: ["A", "B", "C", "D"]
    },
    {
      id: 2,
      title: "Professional Development Workshop",
      time: "This Friday, 1:00 PM",
      participants: 28,
      type: "In-Person",
      avatars: ["M", "N", "O", "P", "Q"]
    },
    {
      id: 3,
      title: "New Techniques in Elderly Care",
      time: "Next Monday, 10:00 AM",
      participants: 15,
      type: "Hybrid",
      avatars: ["X", "Y", "Z"]
    }
  ];

  const recentDiscussions = [
    {
      id: 1,
      title: "Tips for helping clients with mobility issues",
      replies: 24,
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      title: "Recommended resources for dementia care",
      replies: 16,
      lastActivity: "Yesterday"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-amber-500" />
            Community Engagement
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Connect with peers</p>
            <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
              <Bell className="h-3 w-3" />
              3 New Activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Upcoming Events
            </h3>
            
            {communityEvents.map((event) => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg space-y-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <Badge variant="outline" className="text-xs h-5">
                    {event.type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">{event.time}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5">
                      {event.avatars.slice(0, 3).map((letter, index) => (
                        <Avatar key={index} className="h-5 w-5 border border-white">
                          <AvatarFallback className="text-[8px] bg-gray-200">{letter}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {event.participants} participants
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-500" />
              Recent Discussions
            </h3>
            
            {recentDiscussions.map((discussion) => (
              <div key={discussion.id} className="p-3 bg-gray-50 rounded-lg space-y-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
                <h4 className="font-medium text-sm">{discussion.title}</h4>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">{discussion.replies} replies</p>
                  <p className="text-xs text-gray-500">Last activity: {discussion.lastActivity}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
            <span>Join Community Forum</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
