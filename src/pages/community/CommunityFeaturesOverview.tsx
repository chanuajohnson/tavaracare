
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Users, Calendar, Heart, Rocket } from "lucide-react";

const CommunityFeaturesOverview = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8 border border-blue-100">
            <h1 className="text-3xl font-bold mb-4">Community Dashboard Features</h1>
            <p className="text-gray-600 mb-4">
              Welcome to the Community Dashboard Features overview! As a valued community member, you have access to a variety of tools and features designed to enhance your experience and allow you to contribute to our growing care community.
            </p>
            <p className="text-gray-600">
              Many features are still under development. You can help shape our roadmap by upvoting the features that matter most to you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <UserCog className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Manage your community profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The Profile Management feature allows you to update your personal information, set community preferences, manage notification settings, and update privacy settings. This ensures your community experience is tailored to your needs and preferences.
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: In Development
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Care Circles</CardTitle>
                <CardDescription>
                  Connect with families and other community members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Care Circles enable you to connect with families and other community members who share similar interests or care needs. Join existing circles or create your own to build a supportive network within the community.
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: Planned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Community Events</CardTitle>
                <CardDescription>
                  Discover and participate in local care events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The Community Events feature lets you discover and participate in local care events. Stay informed about upcoming gatherings, workshops, and activities organized by and for our community members.
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: Planned
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Support Network</CardTitle>
                <CardDescription>
                  Offer and receive community support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The Support Network feature enables you to offer and receive community support. Connect with others who can help with specific needs, or volunteer your time and skills to assist fellow community members.
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: Planned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Tech Innovators Hub</CardTitle>
                <CardDescription>
                  A space for tech enthusiasts and AI builders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The Tech Innovators Hub is a dedicated space for tech enthusiasts, AI builders, and behind-the-scenes explorers who want to follow the platform's development journey, feature rollouts, and upcoming innovations.
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: In Development
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-2xl font-bold mb-4">Help Shape Our Platform</h2>
            <p className="text-gray-600 mb-6">
              Your feedback is crucial in determining which features we prioritize. Visit our Features page to upvote the features you'd like to see developed next. Each upvote helps us understand what matters most to our community members.
            </p>
            <Link to="/features">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View & Upvote Features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityFeaturesOverview;
