
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <>
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
