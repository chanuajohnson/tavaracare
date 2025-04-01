
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const FeatureInterestTracker = () => {
  const [interestData, setInterestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchFeatureInterestData();
  }, []);

  const fetchFeatureInterestData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_interest_tracking')
        .select('*')
        .order('clicked_at', { ascending: false });
      
      if (error) throw error;
      
      setInterestData(data || []);
      
      // Process data for chart
      if (data) {
        const featureCounts = {};
        
        data.forEach(item => {
          if (!featureCounts[item.feature_name]) {
            featureCounts[item.feature_name] = 0;
          }
          featureCounts[item.feature_name]++;
        });
        
        const chartDataArray = Object.keys(featureCounts).map(name => ({
          name: name,
          clicks: featureCounts[name]
        }));
        
        setChartData(chartDataArray);
      }
    } catch (error) {
      console.error("Error fetching feature interest data:", error);
      toast.error("Failed to load feature interest data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feature Interest Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Interest by Feature</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} height={60} tickFormatter={(value) => value.replace(' Access', '')} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clicks" fill="#3b82f6" name="Click Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Recent Interest</h3>
            
            <div className="border rounded-md overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Page</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interestData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(item.clicked_at)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.feature_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.source_page}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.user_id ? item.user_id.substring(0, 8) + '...' : 'Anonymous'}</td>
                    </tr>
                  ))}
                  
                  {interestData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        No feature interest data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
