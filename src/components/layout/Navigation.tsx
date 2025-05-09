
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LogOut,
  LogIn,
  LayoutDashboard,
  Loader2,
  Menu,
} from 'lucide-react';
import { resetAuthState } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { toast } from 'sonner';

export function Navigation() {
  const { user, signOut, isLoading, userRole } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log('Navigation render -', { 
    user: !!user, 
    isLoading, 
    userRole, 
    path: location.pathname,
    userDetails: user ? {
      id: user.id,
      email: user.email,
      // Fixed type error here - safely accessing nested property
      hasMetadataRole: !!(user.user_metadata && user.user_metadata.role)
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
        
        {/* Navigation links */}
        <div className={`${isMobile ? (isMenuOpen ? "flex flex-col absolute top-16 left-0 right-0 bg-background border-b z-50 p-4 space-y-3" : "hidden") : "flex items-center gap-4"}`}>
          {(!isMobile || isMenuOpen) && (
            <>
              <Link to="/about" className="text-gray-700 hover:text-primary">
                About
              </Link>
              
              <Link to="/features" className="text-gray-700 hover:text-primary">
                Features
              </Link>
              
              {user && dashboardPath && (
                <Link to={dashboardPath} className="flex items-center gap-1 text-gray-700 hover:text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className={isMobile ? "inline" : "hidden sm:inline"}>
                    {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard` : 'Dashboard'}
                  </span>
                </Link>
              )}
              
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
  );
}
