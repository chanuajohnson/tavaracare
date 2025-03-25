
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

interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface DashboardHeaderProps {
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  description?: string;
}

export const DashboardHeader = ({ breadcrumbItems = [], title, description }: DashboardHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
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
      
      {title && (
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm" className="hidden md:flex items-center gap-1">
          <Link to="/legacy-stories">
            <BookOpen className="h-4 w-4 mr-1" />
            Legacy Stories
          </Link>
        </Button>
      </div>
    </div>
  );
};
