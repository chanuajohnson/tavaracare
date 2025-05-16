
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  LazyLogOut,
  LazyLogIn,
  LazyLayoutDashboard,
  LazyChevronDown,
  LazyLoader2,
  LazyBarChart, 
  LazyUsers,
  LazyUserPlus,
  LazyHome,
  LazyHeartPulse,
  LazyBookOpen,
  LazyMessageSquare,
  LazyCalendar,
  LazyUserCircle,
  LazyLifeBuoy,
  LazyBuilding2,
  LazyFileText,
  LazyCreditCard,
  LazyInfo,
  LazyMenu
} from '@/utils/lazyIcons';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { isModuleReady, registerModuleInit } from '@/utils/moduleInitTracker';
import { BootPhase, getCurrentPhase, isPhaseReady } from '@/utils/appBootstrap';
import { createStaticIcon } from '@/utils/iconFallbacks';

// Simple non-React icon fallback component
const SimpleIconFallback = ({ className }: { className?: string }) => {
  return (
    <span 
      className={className || "w-5 h-5 inline-block bg-gray-200 rounded-sm"}
      style={{ display: 'inline-block' }}
    />
  );
};

export function Navigation() {
  const { user, signOut, isLoading, userRole } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [renderPhase, setRenderPhase] = useState<'html' | 'basic' | 'full'>('html');

  // Check if React is fully initialized before rendering complex components
  useEffect(() => {
    // Phase 1: Check if we can render basic React components
    if (window.reactInitialized && window.React && window.React.forwardRef) {
      console.log('[Navigation] React is initialized, rendering basic UI');
      setRenderPhase('basic');
      
      // Phase 2: Check if we can render full UI with all dependencies
      if (isModuleReady('icons')) {
        console.log('[Navigation] Icons are ready, rendering full UI');
        setRenderPhase('full');
        registerModuleInit('navigation');
      } else {
        // Retry for icons
        const iconCheckTimer = setInterval(() => {
          if (isModuleReady('icons')) {
            console.log('[Navigation] Icons ready on retry');
            clearInterval(iconCheckTimer);
            setRenderPhase('full');
            registerModuleInit('navigation');
          }
        }, 200);
        
        return () => clearInterval(iconCheckTimer);
      }
    } else {
      console.log('[Navigation] React not fully initialized, using fallbacks');
      // Try again with exponential backoff
      let attempt = 0;
      const checkTimer = setInterval(() => {
        attempt++;
        if (window.reactInitialized && window.React && window.React.forwardRef) {
          console.log('[Navigation] React initialized on retry');
          clearInterval(checkTimer);
          setRenderPhase('basic');
        }
        
        // Stop trying after a while
        if (attempt >= 5) {
          clearInterval(checkTimer);
        }
      }, 100 * Math.pow(2, attempt));
      
      return () => clearInterval(checkTimer);
    }
  }, []);

  console.log('Navigation render phase:', renderPhase, {
    user: !!user, 
    isLoading, 
    userRole, 
    path: location.pathname
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

  // Phase 1: HTML-only fallback navigation during early initialization
  if (renderPhase === 'html') {
    return (
      <nav className="bg-background border-b py-3 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center flex-col sm:flex-row">
            <a href="/" className="text-xl font-bold">Tavara</a>
            <span className="text-xs text-gray-600 italic sm:ml-2">It takes a village to care</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-5 h-5 animate-pulse bg-gray-200 rounded"></span>
          </div>
        </div>
      </nav>
    );
  }

  // Phase 2: Basic React navigation with minimal dependencies
  if (renderPhase === 'basic') {
    return (
      <nav className="bg-background border-b py-3 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center flex-col sm:flex-row">
            <Link to="/" className="text-xl font-bold">Tavara</Link>
            <span className="text-xs text-gray-600 italic sm:ml-2">It takes a village to care</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                <SimpleIconFallback />
                <span>Loading...</span>
              </Button>
            ) : user ? (
              <Button 
                onClick={handleSignOut}
                size="sm"
                className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <SimpleIconFallback />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <SimpleIconFallback />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Phase 3: Full navigation with all dependencies loaded
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
            <LazyMenu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Navigation links - shown on desktop or when menu is open on mobile */}
        <div className={`${isMobile ? (isMenuOpen ? "flex flex-col absolute top-16 left-0 right-0 bg-background border-b z-50 p-4 space-y-3" : "hidden") : "flex items-center gap-4"}`}>
          {(!isMobile || isMenuOpen) && (
            <>
              <Link to="/about" className="text-gray-700 hover:text-primary">
                About
              </Link>
              
              <Link to="/features" className="text-gray-700 hover:text-primary">
                Features
              </Link>
              
              {isSpecificUser && (
                <Link to="/admin/user-journey" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                  <LazyBarChart className="h-4 w-4" />
                  <span className="hidden sm:inline">User Journey</span>
                </Link>
              )}
              
              {user && dashboardPath ? (
                <Link to={dashboardPath} className="flex items-center gap-1 text-gray-700 hover:text-primary">
                  <LazyLayoutDashboard className="h-4 w-4" />
                  <span className={isMobile ? "inline" : "hidden sm:inline"}>
                    {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard` : 'Dashboard'}
                  </span>
                </Link>
              ) : !user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <LazyLayoutDashboard className="h-4 w-4" />
                      <span className={isMobile ? "inline" : "hidden sm:inline"}>Navigation</span>
                      <LazyChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/family">
                          <LazyHome className="mr-2 h-4 w-4" />
                          Family Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/professional">
                          <LazyHeartPulse className="mr-2 h-4 w-4" />
                          Professional Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/community">
                          <LazyUsers className="mr-2 h-4 w-4" />
                          Community Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Resources</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/about">
                          <LazyBookOpen className="mr-2 h-4 w-4" />
                          About Tavara
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/features">
                          <LazyMessageSquare className="mr-2 h-4 w-4" />
                          Features Overview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pricing">
                          <LazyCreditCard className="mr-2 h-4 w-4" />
                          Pricing & Plans
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact">
                          <LazyLifeBuoy className="mr-2 h-4 w-4" />
                          Contact Support
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
              
              {isLoading ? (
                <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                  <LazyLoader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </Button>
              ) : user ? (
                <Button 
                  onClick={handleSignOut}
                  size="sm"
                  className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <LazyLogOut className="h-4 w-4" />
                  <span>{isMobile ? "Sign Out" : "Sign Out"}</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <LazyLogIn className="h-4 w-4" />
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
