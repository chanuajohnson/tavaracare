
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Not Found', href: location.pathname, current: true }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 mx-auto py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
            <p className="text-gray-500 mb-8">
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>
            <Link to="/">
              <Button variant="default" size="lg">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
