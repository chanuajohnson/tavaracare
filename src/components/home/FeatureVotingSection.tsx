
import { motion } from "framer-motion";
import { ArrowRight, Check, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FeatureVotingSection = () => {
  return (
    <div className="mt-32 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Shape Our Future Features
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          See our feature roadmap to up-vote the capabilities you'd like to see next and influence our product development priorities.
        </p>
        <Link to="/features">
          <Card className="p-6 text-left bg-white cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary-600" />
                Feature Voting System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our feature voting system lets you:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Vote for features you want to see implemented
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Track feature development progress
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Get notified when features are launched
                </li>
              </ul>
              <div className="mt-6 flex justify-end">
                <span className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
                  View Feature Roadmap
                  <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
};
