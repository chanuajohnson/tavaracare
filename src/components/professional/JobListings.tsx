
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, ArrowRight, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";

export const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isInProfessionalDashboard = currentPath.includes("/dashboard/professional");
  const referringPagePath = isInProfessionalDashboard ? "/dashboard/professional" : currentPath;
  const referringPageLabel = isInProfessionalDashboard ? "Professional Dashboard" : "Dashboard";

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .ilike('location', '%Trinidad and Tobago%')
        .order('posted_at', { ascending: false })
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Fetched Trinidad and Tobago jobs:", data);
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job opportunities");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      toast.info("Refreshing Trinidad and Tobago job data...");
      
      const { data, error } = await supabase.functions.invoke('update-job-data', {
        body: { region: 'Trinidad and Tobago' }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(`Successfully refreshed data with ${data.jobsCount} jobs`);
        await fetchJobs();
      } else {
        throw new Error(data.error || "Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh job data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (jobId) => {
    navigate('/subscription-features', { 
      state: { 
        returnPath: `/professional/job/${jobId}`,
        featureType: "Job Details" 
      } 
    });
  };

  const handleViewAllJobs = () => {
    navigate('/subscription-features', { 
      state: { 
        returnPath: '/professional/jobs',
        featureType: "All Job Listings" 
      } 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Job Opportunities
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Matched to your profile in Trinidad and Tobago</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 bg-white/80 hover:bg-white"
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1 bg-white/80 hover:bg-white">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map(job => (
              <div 
                key={job.id} 
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{job.title}</h3>
                  <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-200">
                    {job.match_percentage}% Match
                  </Badge>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>{job.type}</span>
                  </div>
                  <div>
                    <span>{job.salary}</span>
                  </div>
                  {job.urgency === "Immediate" && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      {job.urgency}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.tags && job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Posted {new Date(job.posted_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 p-0 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    onClick={() => handleViewDetails(job.id)}
                  >
                    View Details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No job opportunities found in Trinidad and Tobago</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={refreshData}
                disabled={refreshing}
              >
                Refresh Data
              </Button>
            </div>
          )}
          
          <SubscriptionFeatureLink 
            featureType="All Job Listings"
            returnPath="/dashboard/professional"
            referringPagePath={referringPagePath}
            referringPageLabel={referringPageLabel}
            className="w-full"
          >
            <span className="flex justify-between items-center w-full">
              <span>View All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </SubscriptionFeatureLink>
        </CardContent>
      </Card>
    </motion.div>
  );
};
