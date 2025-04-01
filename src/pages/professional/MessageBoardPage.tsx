import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  MapPin, 
  Plus, 
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type MessageType = "family" | "professional" | "all";
type UrgencyType = "Today" | "Short Notice" | "This Weekend" | "Regular" | "all";

interface Message {
  id: number;
  type: "family" | "professional";
  author: string;
  authorInitial: string;
  title: string;
  timePosted: string;
  urgency: UrgencyType;
  location: string;
  details: string;
  careNeeds?: string[];
  specialties?: string[];
}

const MessageBoardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageType, setMessageType] = useState<MessageType>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postType, setPostType] = useState<"need" | "availability">("need");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    location: "Trinidad and Tobago",
    urgency: "Regular" as UrgencyType,
    details: "",
    careNeeds: [] as string[],
    specialties: [] as string[]
  });

  const [messages, setMessages] = useState<Message[]>([
    // ... keep existing message data
  ]);

  const handleInitialAction = () => {
    const action = searchParams.get("action");
    if (action === "post-need") {
      setShowPostForm(true);
      setPostType("need");
    } else if (action === "post-availability") {
      setShowPostForm(true);
      setPostType("availability");
    }
  };

  useState(() => {
    handleInitialAction();
  });

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Message Board",
      path: "/professional/message-board",
    },
  ];

  const filteredMessages = messages.filter(message => {
    if (messageType !== "all" && message.type !== messageType) return false;
    if (urgencyFilter !== "all" && message.urgency !== urgencyFilter) return false;
    if (searchQuery && !message.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderMessageTypeFilter = (label: string, value: MessageType, currentValue: MessageType) => (
    <Badge 
      variant={currentValue === value ? "default" : "outline"} 
      className={`cursor-pointer ${currentValue === value ? "bg-primary" : "hover:bg-primary/10"}`}
      onClick={() => setMessageType(value)}
    >
      {label}
    </Badge>
  );

  const renderUrgencyFilter = (label: string, value: UrgencyType | "all", currentValue: UrgencyType | "all") => (
    <Badge 
      variant={currentValue === value ? "default" : "outline"} 
      className={`cursor-pointer ${currentValue === value ? "bg-primary" : "hover:bg-primary/10"}`}
      onClick={() => setUrgencyFilter(value)}
    >
      {label}
    </Badge>
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean, type: "careNeeds" | "specialties") => {
    setFormData(prev => {
      const currentItems = [...prev[type]];
      if (checked) {
        if (!currentItems.includes(id)) {
          return { ...prev, [type]: [...currentItems, id] };
        }
      } else {
        return { ...prev, [type]: currentItems.filter(item => item !== id) };
      }
      return prev;
    });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMessage: Message = {
      id: messages.length + 1,
      type: postType === "need" ? "family" : "professional",
      author: user?.email || "Anonymous User",
      authorInitial: (user?.email?.[0] || "A").toUpperCase(),
      title: formData.title,
      timePosted: "Just now",
      urgency: formData.urgency,
      location: formData.location,
      details: formData.details,
      ...(postType === "need" ? { careNeeds: formData.careNeeds } : { specialties: formData.specialties })
    };

    setMessages(prev => [newMessage, ...prev]);
    setFormData({
      title: "",
      location: "Trinidad and Tobago",
      urgency: "Regular",
      details: "",
      careNeeds: [],
      specialties: []
    });
    setShowPostForm(false);
    toast.success(`Successfully posted ${postType === "need" ? "care need" : "availability"}`);
    setSearchParams({});
  };

  const careNeedsOptions = [
    "Medication Management", 
    "Meal Preparation", 
    "Personal Care", 
    "Transportation", 
    "Mobility Assistance", 
    "Companion Care",
    "Child Care"
  ];

  const specialtiesOptions = [
    "Senior Care", 
    "Special Needs", 
    "Dementia Care", 
    "Post-Surgery", 
    "Respite Care", 
    "Overnight Care",
    "Child Care"
  ];

  const regionOptions = [
    "Port of Spain, Trinidad and Tobago",
    "San Fernando, Trinidad and Tobago",
    "Arima, Trinidad and Tobago",
    "Chaguanas, Trinidad and Tobago",
    "Couva, Trinidad and Tobago",
    "Point Fortin, Trinidad and Tobago",
    "Princes Town, Trinidad and Tobago",
    "Sangre Grande, Trinidad and Tobago",
    "San Juan, Trinidad and Tobago",
    "Scarborough, Tobago",
    "Other area, Trinidad and Tobago"
  ];

  const handleRequestService = (messageId) => {
    navigate('/subscription', { 
      state: { 
        returnPath: `/professional/message/${messageId}/contact`,
        featureType: "Requesting Service" 
      } 
    });
  };

  const handleOfferHelp = (messageId) => {
    navigate('/subscription', { 
      state: { 
        returnPath: `/professional/message/${messageId}/contact`,
        featureType: "Offering Help" 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Message Board</h1>
            <div className="flex gap-2">
              <Button 
                onClick={() => { setShowPostForm(true); setPostType("need"); }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post Care Need
              </Button>
              <Button 
                onClick={() => { setShowPostForm(true); setPostType("availability"); }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post Availability
              </Button>
            </div>
          </div>
          
          {showPostForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {postType === "need" ? "Post a Care Need" : "Post Your Availability"}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPostForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {postType === "need" 
                    ? "Share your care requirements to find suitable care providers in Trinidad and Tobago"
                    : "Let families know when you're available to provide care in Trinidad and Tobago"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <Input 
                      id="title" 
                      placeholder="Enter a clear, descriptive title" 
                      value={formData.title}
                      onChange={handleFormChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                      <select 
                        id="location" 
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={formData.location}
                        onChange={handleFormChange}
                        required
                      >
                        {regionOptions.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="urgency" className="block text-sm font-medium mb-1">Urgency/Timing</label>
                      <select 
                        id="urgency" 
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={formData.urgency}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="Today">Today (Urgent)</option>
                        <option value="Short Notice">Short Notice (Within 48 hours)</option>
                        <option value="This Weekend">This Weekend</option>
                        <option value="Regular">Regular (Planned in advance)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium mb-1">Details</label>
                    <Textarea 
                      id="details" 
                      placeholder={postType === "need" 
                        ? "Describe care needs, schedule, requirements, etc." 
                        : "Describe your experience, availability, services offered, etc."
                      } 
                      className="min-h-[120px]"
                      value={formData.details}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  {postType === "need" ? (
                    <div>
                      <label className="block text-sm font-medium mb-1">Care Needs (select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {careNeedsOptions.map((need) => (
                          <div key={need} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`need-${need}`} 
                              onCheckedChange={(checked) => 
                                handleCheckboxChange(need, checked === true, "careNeeds")
                              }
                              checked={formData.careNeeds.includes(need)}
                            />
                            <label 
                              htmlFor={`need-${need}`} 
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {need}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-1">Specialties (select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {specialtiesOptions.map((specialty) => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`specialty-${specialty}`} 
                              onCheckedChange={(checked) => 
                                handleCheckboxChange(specialty, checked === true, "specialties")
                              }
                              checked={formData.specialties.includes(specialty)}
                            />
                            <label 
                              htmlFor={`specialty-${specialty}`} 
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {specialty}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      {postType === "need" ? "Post Care Need" : "Post Availability"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          placeholder="Search by keyword or care type..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium mr-1">Filter:</span>
                      <div className="flex flex-wrap gap-2">
                        {renderMessageTypeFilter("All Types", "all", messageType)}
                        {renderMessageTypeFilter("Family", "family", messageType)}
                        {renderMessageTypeFilter("Professional", "professional", messageType)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-sm font-medium mr-2">Urgency:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {renderUrgencyFilter("All", "all", urgencyFilter)}
                      {renderUrgencyFilter("Today", "Today", urgencyFilter)}
                      {renderUrgencyFilter("Short Notice", "Short Notice", urgencyFilter)}
                      {renderUrgencyFilter("This Weekend", "This Weekend", urgencyFilter)}
                      {renderUrgencyFilter("Regular", "Regular", urgencyFilter)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {messageType === "family" ? "Family Care Needs" : messageType === "professional" ? "Professional Availability" : "All Messages"}
                  <Badge className="ml-2">{filteredMessages.length}</Badge>
                </h2>
                
                {filteredMessages.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-500">No messages found</h3>
                      <p className="text-gray-400 mt-2">Try adjusting your filters or search query</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMessages.map((message) => (
                    <Card 
                      key={message.id} 
                      className={`hover:shadow-md transition-shadow ${
                        message.type === "family" ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-green-400"
                      }`}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Avatar className={message.type === "family" ? "bg-blue-100" : "bg-green-100"}>
                                <AvatarFallback className={message.type === "family" ? "text-blue-700" : "text-green-700"}>
                                  {message.authorInitial}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <h3 className="font-medium text-lg">{message.title}</h3>
                                <p className="text-sm text-gray-500">{message.author}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-gray-700">{message.details}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              {message.type === "family" && message.careNeeds ? (
                                message.careNeeds.map((need, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                    {need}
                                  </Badge>
                                ))
                              ) : message.specialties ? (
                                message.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                                    {specialty}
                                  </Badge>
                                ))
                              ) : null}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                            <Badge 
                              className={`${
                                message.urgency === "Today" 
                                  ? "bg-red-100 text-red-700" 
                                  : message.urgency === "Short Notice" 
                                    ? "bg-orange-100 text-orange-700" 
                                    : message.urgency === "This Weekend"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {message.urgency}
                            </Badge>
                            
                            <div className="flex flex-col gap-2 text-xs text-gray-500 items-end">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Posted {message.timePosted}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{message.location}</span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => message.type === "family" 
                                ? handleOfferHelp(message.id) 
                                : handleRequestService(message.id)
                              }
                            >
                              {message.type === "family" ? "Offer Help" : "Request Service"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MessageBoardPage;
