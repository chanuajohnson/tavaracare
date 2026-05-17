
import React from "react";
import { StoryList } from "@/components/legacy/StoryList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Container } from "@/components/ui/container";
import { SEO } from "@/components/seo/SEO";

const LegacyStoriesPage = () => {
  return (
    <Container className="py-8">
      <SEO
        title="Honoring Loved Ones' Legacies | Tavara Legacy Stories"
        description="Tributes to people who shaped lives and communities. Read and share legacy stories from families across the Tavara care network."
        canonicalPath="/legacy-stories"
      />
      <PageViewTracker 
        actionType="legacy_stories_page_view" 
        journeyStage="content_discovery"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Legacy Stories", path: "/legacy-stories" }
        ]} 
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Honoring Loved Ones' Legacies</h1>
        <p className="text-lg text-gray-600">
          A tribute to those we love. Discover the stories of individuals who shaped lives, made an impact, and deserve to be remembered.
        </p>
      </div>
      
      <StoryList />
    </Container>
  );
};

export default LegacyStoriesPage;
