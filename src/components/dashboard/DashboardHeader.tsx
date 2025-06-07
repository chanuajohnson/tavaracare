
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Home, BookOpen } from "lucide-react";

interface DashboardBreadcrumbItem {
  label: string;
  path: string;
}

interface DashboardHeaderProps {
  breadcrumbItems: DashboardBreadcrumbItem[];
}

export const DashboardHeader = ({ breadcrumbItems }: DashboardHeaderProps) => {
  const breadcrumbData = [
    { label: 'Home', href: '/' },
    ...breadcrumbItems.map(item => ({ label: item.label, href: item.path }))
  ];

  return (
    <div className="flex justify-between items-center mb-8">
      <Breadcrumb items={breadcrumbData} />
      
      <Button asChild variant="outline" size="sm" className="hidden md:flex items-center gap-1">
        <Link to="/legacy-stories">
          <BookOpen className="h-4 w-4 mr-1" />
          Legacy Stories
        </Link>
      </Button>
    </div>
  );
};
