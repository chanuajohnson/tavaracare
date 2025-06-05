
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, X, Loader2, Heart, Bug, Lightbulb, Users, Coffee, DollarSign, Building, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackCategories = [
  { 
    value: "general", 
    label: "General Feedback", 
    icon: MessageCircle,
    placeholder: "Share your overall thoughts about Tavara.care..."
  },
  { 
    value: "technical", 
    label: "Technical Issues", 
    icon: Bug,
    placeholder: "Describe any bugs, performance issues, or technical problems you've encountered..."
  },
  { 
    value: "feature_request", 
    label: "Feature Requests", 
    icon: Lightbulb,
    placeholder: "What new features would make Tavara.care even better for you?"
  },
  { 
    value: "excitement", 
    label: "Excitement & Testimonials", 
    icon: Heart,
    placeholder: "We'd love to hear about your positive experiences with Tavara.care!"
  },
  { 
    value: "investor", 
    label: "Investment & Partnership", 
    icon: DollarSign,
    placeholder: "Interested in investment opportunities or business partnerships? Tell us more..."
  },
  { 
    value: "referral", 
    label: "Referrals", 
    icon: Users,
    placeholder: "Know someone who could benefit from Tavara.care? Share their details..."
  },
  { 
    value: "agency", 
    label: "Agency & Professional Services", 
    icon: Building,
    placeholder: "Interested in B2B opportunities or agency partnerships? Let's discuss..."
  },
  { 
    value: "coffee", 
    label: "Buy Us Coffee", 
    icon: Coffee,
    placeholder: "Thanks for wanting to show appreciation! Tell us what you loved most..."
  },
  { 
    value: "user_experience", 
    label: "User Experience", 
    icon: Sparkles,
    placeholder: "How can we make the platform more intuitive and user-friendly?"
  }
];

export const FeedbackForm = ({ isOpen, onClose }: FeedbackFormProps) => {
  const [formData, setFormData] = useState({
    feedback_type: "",
    subject: "",
    message: "",
    rating: 0,
    contact_info: { name: "", email: "", phone: "" }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedCategory = feedbackCategories.find(cat => cat.value === formData.feedback_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feedback_type || !formData.subject || !formData.message) {
      toast.error("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.functions.invoke("send-feedback", {
        body: {
          ...formData,
          metadata: {
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast.success("Thank you for your feedback! We'll review it and get back to you if needed.");
      
      // Reset form
      setFormData({
        feedback_type: "",
        subject: "",
        message: "",
        rating: 0,
        contact_info: { name: "", email: "", phone: "" }
      });
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('contact_info.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact_info: { ...prev.contact_info, [contactField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="feedback_type" className="text-base font-semibold">
              What type of feedback do you have? *
            </Label>
            <Select value={formData.feedback_type} onValueChange={(value) => handleInputChange('feedback_type', value)}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a feedback category" />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {formData.feedback_type && (
            <>
              <div>
                <Label htmlFor="subject" className="text-base font-semibold">
                  Subject *
                </Label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief summary of your feedback"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-base font-semibold">
                  Your Feedback *
                </Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full min-h-[120px] mt-2"
                  placeholder={selectedCategory?.placeholder || "Tell us more about your feedback..."}
                  disabled={isSubmitting}
                />
              </div>

              {!['technical', 'coffee'].includes(formData.feedback_type) && (
                <div>
                  <Label className="text-base font-semibold">
                    Rate Your Experience (Optional)
                  </Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange('rating', star)}
                        className="p-1"
                        disabled={isSubmitting}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Contact Information (Optional - for follow-up)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.contact_info.name}
                    onChange={(e) => handleInputChange('contact_info.name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={formData.contact_info.email}
                    onChange={(e) => handleInputChange('contact_info.email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.contact_info.phone}
                  onChange={(e) => handleInputChange('contact_info.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.feedback_type || !formData.subject || !formData.message}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
