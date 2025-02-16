
import { motion } from "framer-motion";
import { Users, Heart, Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const CommunityDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
          <p className="text-gray-600 mt-2">Connect and contribute to your local care community.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Join Care Circles</CardTitle>
                <CardDescription>Connect with families and other community members</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Find Circles <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Community Events</CardTitle>
                <CardDescription>Discover and participate in local care events</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Events <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Support Network</CardTitle>
                <CardDescription>Offer and receive community support</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Get Involved <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
