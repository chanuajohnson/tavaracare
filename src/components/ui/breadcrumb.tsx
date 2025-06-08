
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {item.current ? (
              <span className="text-sm font-medium text-gray-500 cursor-default">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Hook to automatically generate breadcrumbs based on current route
export const useBreadcrumbs = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard/admin' }
    ];

    // Admin specific breadcrumbs
    if (pathSegments.includes('admin')) {
      if (pathSegments.includes('visit-schedule')) {
        breadcrumbs.push({ 
          label: 'Visit Schedule Management', 
          href: '/admin/visit-schedule',
          current: true 
        });
      } else if (pathSegments.includes('user-journey')) {
        breadcrumbs.push({ 
          label: 'User Journey Analytics', 
          href: '/admin/user-journey',
          current: true 
        });
      } else if (pathSegments.includes('feedback')) {
        breadcrumbs.push({ 
          label: 'Feedback Management', 
          href: '/admin/feedback',
          current: true 
        });
      }
    }

    return breadcrumbs;
  };

  return generateBreadcrumbs();
};
