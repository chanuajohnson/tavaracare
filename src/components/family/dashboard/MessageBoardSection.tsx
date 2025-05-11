
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MessageSquare, Users } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useNavigate } from "react-router-dom";

interface MessageBoardSectionProps {
  messages: any[];
  loading: boolean;
  refreshing: boolean;
  refreshData: () => Promise<void>;
  formatTimePosted: (timestamp: string) => string;
}

export const MessageBoardSection: React.FC<MessageBoardSectionProps> = ({
  messages,
  loading,
  refreshing,
  refreshData,
  formatTimePosted
}) => {
  const navigate = useNavigate();
  
  const handleViewFullBoard = () => {
    navigate('/subscription-features', {
      state: {
        returnPath: '/family/message-board',
        featureType: "Full Message Board"
      }
    });
  };
  
  return (
    <Card className="h-full border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquare className="h-5 w-5 text-primary" />
          Message Board
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Care provider availability in Trinidad and Tobago</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleViewFullBoard} disabled={refreshing}>
              <Clock className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Professional</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.filter(message => message.type === "professional").slice(0, 3).map(message => (
              <div key={message.id} className="p-3 rounded-lg space-y-2 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 bg-gray-50 border-l-primary-400">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="bg-primary-200">
                      <AvatarFallback className="text-primary-800">
                        {message.author_initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{message.title}</h4>
                      <p className="text-xs text-gray-600">{message.author}</p>
                    </div>
                  </div>
                  {message.urgency && (
                    <Badge variant="outline" className={
                      message.urgency === "Immediate" ? "bg-red-50 text-red-700" : 
                      message.urgency === "Short Notice" ? "bg-orange-50 text-orange-700" : 
                      message.urgency === "This Weekend" ? "bg-amber-50 text-amber-700" : 
                      "bg-blue-50 text-blue-700"
                    }>
                      {message.urgency}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-gray-600">{message.details}</p>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.specialties && message.specialties.map((specialty: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Posted {formatTimePosted(message.time_posted)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{message.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No care providers found in Trinidad and Tobago</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={refreshData} disabled={refreshing}>
              Refresh Data
            </Button>
          </div>
        )}
        
        <SubscriptionFeatureLink 
          featureType="Full Message Board" 
          returnPath="/family/message-board" 
          referringPagePath="/dashboard/family" 
          referringPageLabel="Family Dashboard"
        >
          View Full Message Board
        </SubscriptionFeatureLink>
      </CardContent>
    </Card>
  );
};
