
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";

const CommunityRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/community");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 mx-auto">
        <Breadcrumb />
      </div>
    </div>
  );
};

export default CommunityRegistration;
