
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Upload, X, Loader2, Plus, Trash2, Link } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { validateChatInput } from '@/services/chat/utils/inputValidation';

interface EnhancedFeedbackFormProps {
  onClose: () => void;
  prefillData?: any;
}

const FEEDBACK_TYPES = {
  bug_report: { label: 'Bug Report', icon: '🐛', hasRating: false, description: 'Technical issues and bugs' },
  feature_request: { label: 'Feature Request', icon: '✨', hasRating: false, description: 'New feature suggestions' },
  general: { label: 'General Feedback', icon: '💬', hasRating: true, description: 'Overall experience and suggestions' },
  testimonial: { label: 'Share Success Story', icon: '⭐', hasRating: true, description: 'Testimonials and positive experiences' },
  business: { label: 'Business Inquiry', icon: '🤝', hasRating: false, description: 'Partnerships, investment, agency services' }
};

const getPlaceholderText = (feedbackType: string) => {
  const placeholders: Record<string, string> = {
    bug_report: "Please describe the bug in detail, including what you expected to happen and what actually happened.",
    feature_request: "What new feature would you like to see? How would it help you?",
    general: "Share your overall experience with Tavara.care. What's working well? What could be improved?",
    testimonial: "Share your story about how Tavara has helped you or your loved ones.",
    business: "Describe your business inquiry and how we might work together."
  };
  return placeholders[feedbackType] || "Share your feedback with us...";
};

interface AttachmentFile {
  id: string;
  file: File;
}

interface AttachmentUrl {
  id: string;
  url: string;
  description: string;
}

export const EnhancedFeedbackForm: React.FC<EnhancedFeedbackFormProps> = ({ onClose, prefillData }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feedback_type: '',
    category: '',
    subject: '',
    message: '',
    rating: 0,
    contact_info: {
      name: '',
      email: user?.email || '',
      phone: ''
    },
    anonymous: false
  });
  const [formErrors, setFormErrors] = useState({
    feedback_type: '',
    subject: '',
    message: '',
    contact_email: '',
    contact_phone: ''
  });
  
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<AttachmentUrl[]>([]);

  const validateForm = () => {
    const errors = {
      feedback_type: '',
      subject: '',
      message: '',
      contact_email: '',
      contact_phone: ''
    };

    if (!formData.feedback_type) {
      errors.feedback_type = 'Please select a feedback type';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }

    // Validate contact info if not anonymous
    if (!formData.anonymous && formData.contact_info.email) {
      const emailValidation = validateChatInput(formData.contact_info.email, 'email');
      if (!emailValidation.isValid) {
        errors.contact_email = emailValidation.errorMessage || 'Invalid email format';
      }
    }

    if (!formData.anonymous && formData.contact_info.phone) {
      const phoneValidation = validateChatInput(formData.contact_info.phone, 'phone');
      if (!phoneValidation.isValid) {
        errors.contact_phone = phoneValidation.errorMessage || 'Invalid phone format';
      }
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert files to base64
      const filesData = await Promise.all(
        attachmentFiles.map(async (attachment) => {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(attachment.file);
          });
          return {
            name: attachment.file.name,
            type: attachment.file.type,
            size: attachment.file.size,
            data: base64
          };
        })
      );

      // Prepare metadata
      const metadata = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        attachments: {
          files: filesData,
          urls: attachmentUrls
        },
        ...(prefillData || {})
      };

      // Store feedback directly in database
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: formData.anonymous ? null : user?.id,
          feedback_type: formData.feedback_type,
          category: formData.category || null,
          subject: formData.subject,
          message: formData.message,
          rating: formData.rating || null,
          contact_info: formData.anonymous ? {} : formData.contact_info,
          metadata,
          status: 'new',
          priority: 'medium'
        });

      if (error) throw error;

      toast.success('Feedback submitted successfully! Thank you for helping us improve.');
      onClose();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }

      if (attachmentFiles.length >= 3) {
        toast.error('Maximum 3 files allowed');
        return;
      }
      
      setAttachmentFiles(prev => [...prev, { id: Date.now().toString(), file }]);
      e.target.value = '';
    }
  };

  const removeFileAttachment = (id: string) => {
    setAttachmentFiles(prev => prev.filter(att => att.id !== id));
  };

  const addUrlAttachment = () => {
    if (attachmentUrls.length >= 3) {
      toast.error('Maximum 3 URLs allowed');
      return;
    }
    setAttachmentUrls(prev => [...prev, { id: Date.now().toString(), url: '', description: '' }]);
  };

  const updateUrlAttachment = (id: string, field: 'url' | 'description', value: string) => {
    setAttachmentUrls(prev => prev.map(att => 
      att.id === id ? { ...att, [field]: value } : att
    ));
  };

  const removeUrlAttachment = (id: string) => {
    setAttachmentUrls(prev => prev.filter(att => att.id !== id));
  };

  const selectedType = FEEDBACK_TYPES[formData.feedback_type as keyof typeof FEEDBACK_TYPES];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Share Your Feedback</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="feedback_type" className="text-sm font-medium">
              Feedback Type *
            </Label>
            <Select 
              value={formData.feedback_type} 
              onValueChange={(value) => handleInputChange('feedback_type', value)}
            >
              <SelectTrigger className={`mt-1 ${formErrors.feedback_type ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-[200]">
                {Object.entries(FEEDBACK_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.feedback_type && (
              <p className="text-sm text-red-600 mt-1">{formErrors.feedback_type}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject *
            </Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief summary of your feedback"
              className={`mt-1 ${formErrors.subject ? 'border-red-500' : ''}`}
            />
            {formErrors.subject && (
              <p className="text-sm text-red-600 mt-1">{formErrors.subject}</p>
            )}
          </div>

          {selectedType?.hasRating && (
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="p-1 hover:scale-110 transition-transform"
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

          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={selectedType ? getPlaceholderText(formData.feedback_type) : "Share your feedback with us..."}
              className={`mt-1 min-h-[120px] ${formErrors.message ? 'border-red-500' : ''}`}
            />
            {formErrors.message && (
              <p className="text-sm text-red-600 mt-1">{formErrors.message}</p>
            )}
          </div>

          {/* Enhanced Attachments Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Attachments (Optional)</Label>
            
            {/* File Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Files (up to 3)</span>
                {attachmentFiles.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add File
                  </Button>
                )}
              </div>
              
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={addFileAttachment}
                className="hidden"
              />
              
              {attachmentFiles.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border mb-2">
                  <span className="text-sm truncate">{attachment.file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFileAttachment(attachment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* URL Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">URLs (up to 3)</span>
                {attachmentUrls.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUrlAttachment}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add URL
                  </Button>
                )}
              </div>
              
              {attachmentUrls.map((attachment) => (
                <div key={attachment.id} className="space-y-2 p-3 bg-gray-50 rounded border mb-2">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://example.com"
                      value={attachment.url}
                      onChange={(e) => updateUrlAttachment(attachment.id, 'url', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUrlAttachment(attachment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Description (optional)"
                    value={attachment.description}
                    onChange={(e) => updateUrlAttachment(attachment.id, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked) => 
                handleInputChange('anonymous', checked as boolean)
              }
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit anonymously (no contact information will be saved)
            </Label>
          </div>

          {!formData.anonymous && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm">Contact Information (for follow-up)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name" className="text-sm">Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_info.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_info: { ...prev.contact_info, name: e.target.value }
                    }))}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email" className="text-sm">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, email: e.target.value }
                      }));
                      if (formErrors.contact_email) {
                        setFormErrors(prev => ({ ...prev, contact_email: '' }));
                      }
                    }}
                    placeholder="your@email.com"
                    className={`mt-1 ${formErrors.contact_email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.contact_email && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.contact_email}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="contact_phone" className="text-sm">Phone (Optional)</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_info.phone}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      contact_info: { ...prev.contact_info, phone: e.target.value }
                    }));
                    if (formErrors.contact_phone) {
                      setFormErrors(prev => ({ ...prev, contact_phone: '' }));
                    }
                  }}
                  placeholder="Your phone number"
                  className={`mt-1 ${formErrors.contact_phone ? 'border-red-500' : ''}`}
                />
                {formErrors.contact_phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.contact_phone}</p>
                )}
              </div>
            </div>
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
