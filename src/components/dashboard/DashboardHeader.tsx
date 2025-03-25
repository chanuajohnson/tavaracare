import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Home, BookOpen } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { IncompleteProfileBanner } from "@/components/profile/IncompleteProfileBanner";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface DashboardHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  title?: string;
  description?: string;
}

export const DashboardHeader = ({ breadcrumbItems, title, description }: DashboardHeaderProps) => {
  const { userRole, isProfileComplete, user } = useAuth();
  
  // Check if we should show the banner (user has skipped registration)
  const showBanner = !isProfileComplete && 
                     user?.user_metadata?.registrationSkipped === true && 
                     userRole;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator />
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button asChild variant="outline" size="sm" className="hidden md:flex items-center gap-1">
          <Link to="/legacy-stories">
            <BookOpen className="h-4 w-4 mr-1" />
            Legacy Stories
          </Link>
        </Button>
      </div>
      
      {title && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {/* Show incomplete profile banner if needed */}
      {showBanner && userRole && (
        <IncompleteProfileBanner userRole={userRole} />
      )}
    </div>
  );
};

