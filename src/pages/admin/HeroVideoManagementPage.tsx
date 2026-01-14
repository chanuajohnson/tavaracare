
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { HeroVideoManager } from "@/components/admin/HeroVideoManager";

export default function HeroVideoManagementPage() {
  const breadcrumbItems = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Hero Video Management", href: "/admin/hero-video-management" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">Hero Video Management</h1>
        <p className="text-muted-foreground">
          Upload new hero videos, manage existing ones, and control what videos appear on the homepage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroVideoManager />
        </CardContent>
      </Card>
    </div>
  );
}
