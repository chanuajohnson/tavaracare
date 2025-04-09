
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LogOut,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Loader2,
  BarChart,
  Users,
  UserPlus,
  Home,
  HeartPulse,
  BookOpen,
  MessageSquare,
  Calendar,
  UserCircle,
  LifeBuoy,
  Building2,
  FileText,
  CreditCard,
  Info,
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
import { toast } from 'sonner';
import { resetAuthState } from '@/lib/supabase';

export function Navigation() {
  const { user, signOut, isLoading, userRole } = useAuth();
  const location = useLocation();

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
    <nav className="bg-background border-b py-3 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center flex-col sm:flex-row">
          <Link to="/" className="text-xl font-bold">Tavara</Link>
          <span className="text-xs text-gray-600 italic sm:ml-2">It takes a village to care</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-gray-700 hover:text-primary">
            About
          </Link>
          
          <Link to="/features" className="text-gray-700 hover:text-primary">
            Features
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
              <span className="hidden sm:inline">
                {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard` : 'Dashboard'}
              </span>
            </Link>
          ) : !user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Navigation</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Dashboards Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/family" className="w-full cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Family Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/professional" className="w-full cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Professional Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/community" className="w-full cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Community Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Registration Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Registration</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/registration/family" className="w-full cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Family Registration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/registration/professional" className="w-full cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Professional Registration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/registration/community" className="w-full cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Community Registration</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Family Features Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Family Features</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/family/features-overview" className="w-full cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      <span>Features Overview</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/family/story" className="w-full cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Family Story</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/family/care-management" className="w-full cursor-pointer">
                      <HeartPulse className="mr-2 h-4 w-4" />
                      <span>Care Management</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/family-matching" className="w-full cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Family Matching</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Professional Features Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Professional Features</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/professional/features-overview" className="w-full cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      <span>Features Overview</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/professional/message-board" className="w-full cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Message Board</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/professional/training-resources" className="w-full cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Training Resources</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/professional/profile" className="w-full cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Professional Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/professional/schedule" className="w-full cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Schedule</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Community Features Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Community Features</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/community/features-overview" className="w-full cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Features Overview</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Caregiver Tools Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Caregiver Tools</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/caregiver-matching" className="w-full cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Caregiver Matching</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/caregiver/health" className="w-full cursor-pointer">
                      <HeartPulse className="mr-2 h-4 w-4" />
                      <span>Caregiver Health</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                
                {/* Support & General Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Support & General</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/features" className="w-full cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      <span>Features</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/about" className="w-full cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      <span>About</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/faq" className="w-full cursor-pointer">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      <span>FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/legacy-stories" className="w-full cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Legacy Stories</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscription" className="w-full cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscription-features" className="w-full cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription Features</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

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
              <span>Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
