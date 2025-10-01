import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LogOut,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Loader2,
  BarChart,
  HelpCircle,
  FileQuestion,
  Phone,
  MessageSquare,
  X,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackForm } from "@/components/ui/feedback-form";
import { toast } from 'sonner';
import { resetAuthState } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { useContactForm } from '@/hooks/useContactForm';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import { useSupportActions } from '@/hooks/useSupportActions';

export function Navigation() {
  const { user, signOut, isLoading, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Support functionality hooks
  const {
    isContactFormOpen,
    setIsContactFormOpen,
    isSubmitting,
    contactFormData,
    formErrors,
    screenshotFile,
    handleContactFormSubmit,
    handleInputChange,
    handleFileChange,
  } = useContactForm();

  const { isFeedbackFormOpen, setIsFeedbackFormOpen } = useFeedbackForm();
  const { handleOpenWhatsApp, handleFAQClick } = useSupportActions();

  console.log('Navigation render -', { 
    user: !!user, 
    isLoading, 
    userRole, 
    path: location.pathname,
    userDetails: user ? {
      id: user.id,
      email: user.email,
      hasMetadataRole: !!user.user_metadata?.role
    } : null
  });

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      toast.loading("Signing out...");
      
      try {
        await signOut();
      } catch (error) {
        console.error('Error in Navigation signOut handler:', error);
        
        // Force reset auth state on any sign out error
        console.log('Attempting to force reset auth state...');
        await resetAuthState();
        
        // Refresh the page to ensure clean state
        window.location.href = '/';
      }
    } catch (finalError) {
      console.error('Critical error during sign out recovery:', finalError);
      toast.dismiss();
      toast.error('Error signing out. Please try refreshing the page.');
    } finally {
      toast.dismiss();
      toast.success('You have been signed out successfully');
    }
  };

  const getDashboardPath = () => {
    if (!userRole) return null;
    
    switch (userRole) {
      case 'family':
        return '/dashboard/family';
      case 'professional':
        return '/dashboard/professional';
      case 'community':
        return '/dashboard/community';
      case 'admin':
        return '/dashboard/admin';
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath();
  const isSpecificUser = user?.id === '605540d7-ae87-4a7c-9bd0-5699937f0670';
  const isAdmin = userRole === 'admin';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b py-3 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center flex-col sm:flex-row">
            <Link to="/" className="flex items-center">
              <img 
                src="/TAVARACARElogo.JPG"
                alt="Tavara" 
                className="h-6 w-auto sm:h-7"
              />
            </Link>
            <span className="text-xs text-gray-600 italic sm:ml-2">It takes a village to care</span>
          </div>
          
          {/* Mobile menu button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className={`${isMobile ? (isMenuOpen ? "flex flex-col absolute top-16 left-0 right-0 bg-background border-b z-50 p-4 space-y-3" : "hidden") : "flex items-center gap-4"}`}>
            {(!isMobile || isMenuOpen) && (
              <>
                <Link to="/about" className="text-gray-700 hover:text-primary">
                  About
                </Link>
                <Link to="/errands" className="text-gray-700 hover:text-primary">
                  Errands
                </Link>
                <Link to="/tav-demo" className="text-gray-700 hover:text-primary">
                  TAV Demo
                </Link>
                
                {isSpecificUser && (
                  <Link to="/admin/user-journey" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">User Journey</span>
                  </Link>
                )}
                
                {user && dashboardPath ? (
                  <Link to={dashboardPath} className="flex items-center gap-1 text-gray-700 hover:text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className={isMobile ? "inline" : "hidden sm:inline"}>
                      {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard` : 'Dashboard'}
                    </span>
                  </Link>
                ) : !user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className={isMobile ? "inline" : "hidden sm:inline"}>Navigation</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-[100]">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate('/dashboard/family')}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Family Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate('/dashboard/professional')}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Professional Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate('/dashboard/community')}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Community Dashboard</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/auth/register')}
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Create Account</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/auth/reset-password')}
                      >
                        <FileQuestion className="h-4 w-4" />
                        <span>Forgot Password</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                {/* Help Support Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" />
                      <span className={isMobile ? "inline" : "hidden sm:inline"}>Support</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-[100]">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={handleFAQClick}
                    >
                      <FileQuestion className="h-4 w-4" />
                      <span>FAQ Section</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={handleOpenWhatsApp}
                    >
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setIsContactFormOpen(true)}
                    >
                      <FileQuestion className="h-4 w-4" />
                      <span>Contact Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setIsFeedbackFormOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Give Feedback</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {isLoading ? (
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </Button>
                ) : user ? (
                  <Button 
                    onClick={handleSignOut}
                    size="sm"
                    className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isMobile ? "Sign Out" : "Sign Out"}</span>
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button variant="default" size="sm" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contact Form Modal */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Contact Support</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsContactFormOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleContactFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={contactFormData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={contactFormData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={contactFormData.message}
                    onChange={handleInputChange}
                    className={`w-full min-h-[100px] ${
                      formErrors.message ? 'border-red-500' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.message && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="screenshot" className="block text-sm font-medium mb-1">
                    Screenshot (optional)
                  </label>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  />
                  {screenshotFile && (
                    <p className="text-sm text-green-600 mt-1">
                      Screenshot attached: {screenshotFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContactFormOpen(false)}
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
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {isFeedbackFormOpen && (
        <FeedbackForm 
          onClose={() => setIsFeedbackFormOpen(false)}
        />
      )}
    </>
  );
};
