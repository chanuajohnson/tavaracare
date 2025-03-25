
import { motion } from "framer-motion";
import { Book, UserCog, FileText, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface DashboardCardGridProps {
  sectionTitle?: string;
  cards?: DashboardCardProps[];
}

export const DashboardCardGrid: React.FC<DashboardCardGridProps> = ({ 
  sectionTitle, 
  cards = []
}) => {
  // If cards are provided, use those; otherwise, use the default cards
  const cardData = cards.length > 0 ? cards : [
    {
      title: "Profile Management",
      description: "Update your profile information and preferences",
      buttonText: "Manage Profile",
      buttonLink: "/registration/professional",
      icon: UserCog
    },
    {
      title: "Resources",
      description: "Access training materials and documentation",
      buttonText: "View Resources",
      buttonLink: "/resources",
      icon: Book
    },
    {
      title: "Documentation",
      description: "Review and manage your documents",
      buttonText: "View Documentation",
      buttonLink: "/documentation",
      icon: FileText
    }
  ];

  return (
    <div className="space-y-4">
      {sectionTitle && <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {card.icon && <card.icon className="h-5 w-5" />}
                  {card.title}
                </CardTitle>
                <CardDescription>
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Feature highlights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Key capabilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Available tools</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link to={card.buttonLink}>{card.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
