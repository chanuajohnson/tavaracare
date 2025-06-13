import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DatabaseFeatureCard } from './DatabaseFeatureCard';
import { TechInnovatorsHub } from './TechInnovatorsHub';
import { 
  User, Briefcase, ClipboardList, Calculator, FileText, 
  Clock, UserCog, Building2, BookOpen, Calendar, Users, Heart,
  Pill, BookMarked, ScrollText, Utensils
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  _count?: {
    votes: number;
  };
  icon?: React.ReactNode;
  category?: string;
  roleType?: 'family' | 'professional' | 'community' | 'general';
}

const FeatureCategory = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode 
}) => {
  return (
    <Card className="w-full col-span-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturesGrid = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const databaseFeatures: Feature[] = [
    {
      id: '15',
      title: 'Profile Management (Family)',
      description: 'Comprehensive profile management for families to manage care details, preferences, and scheduling.',
      status: 'in_development',
      icon: <User className="h-5 w-5" />,
      category: 'Profile Management',
      roleType: 'family'
    },
    {
      id: '17',
      title: 'Profile Management (Caregiver)',
      description: 'A profile management tool for professional caregivers to update credentials, experience, and skills.',
      status: 'planned',
      icon: <UserCog className="h-5 w-5" />,
      category: 'Profile Management',
      roleType: 'professional'
    },
    {
      id: '18',
      title: 'Profile Management (Agency)',
      description: 'A dynamic agency profile management tool for services, caregiver availability, and operational details.',
      status: 'planned',
      icon: <Building2 className="h-5 w-5" />,
      category: 'Profile Management',
      roleType: 'professional'
    },
    {
      id: '22',
      title: 'Profile Management (Community)',
      description: 'A centralized hub for community engagement, support, and caregiving advocacy.',
      status: 'planned',
      icon: <Users className="h-5 w-5" />,
      category: 'Profile Management',
      roleType: 'community'
    },

    {
      id: '7',
      title: 'Activity & Care Logs',
      description: 'A daily or weekly log where caregivers record completed tasks, notes, or observations. Keeps families informed about care routines and helps identify patterns or issues early, serving as a record for agencies.',
      status: 'planned',
      icon: <ScrollText className="h-5 w-5" />,
      category: 'Care Management',
      roleType: 'general'
    },
    {
      id: '3',
      title: 'Care Team Chat',
      description: 'Real-time messaging between family members and care professionals',
      status: 'in_development',
      icon: <Users className="h-5 w-5" />,
      category: 'Care Management',
      roleType: 'general'
    },
    {
      id: '4',
      title: 'Care Reports',
      description: 'Generate detailed care reports for health providers',
      status: 'planned',
      icon: <FileText className="h-5 w-5" />,
      category: 'Care Management',
      roleType: 'general'
    },
    {
      id: '12',
      title: 'Task & Routine Templates',
      description: 'Pre-built or customizable care plan templates for daily routines. Saves time for caregivers by standardizing routines and ensures consistency in care delivery.',
      status: 'planned',
      icon: <ClipboardList className="h-5 w-5" />,
      category: 'Care Management',
      roleType: 'general'
    },

    {
      id: '2',
      title: 'Medication Reminders',
      description: 'Smart notifications for medication schedules',
      status: 'planned',
      icon: <Clock className="h-5 w-5" />,
      category: 'Medication Management',
      roleType: 'general'
    },
    {
      id: '5',
      title: 'Medication Tracking',
      description: 'Automated reminders, dosage tracking, and refill alerts. Ensures patients never miss critical medications and keeps families and caregivers in sync about dosage changes or refill schedules.',
      status: 'planned',
      icon: <Pill className="h-5 w-5" />,
      category: 'Medication Management',
      roleType: 'general'
    },

    {
      id: '8',
      title: 'Meal Planning & Nutrition Tracking',
      description: 'Tools for scheduling meals, noting dietary restrictions, and logging nutritional intake. Maintains consistent meal plans and ensures dietary needs are met, supporting better health outcomes through structured meal tracking.',
      status: 'in_development',
      icon: <Utensils className="h-5 w-5" />,
      category: 'Meal Planning',
      roleType: 'general'
    },

    {
      id: '11',
      title: 'HR and Admin Services',
      description: 'Tools to manage caregiver onboarding, track certifications, handle payroll, and maintain compliance with regulations. Streamlines administration and ensures regulatory compliance.',
      status: 'planned',
      icon: <Briefcase className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '13',
      title: 'Billing & Invoicing',
      description: 'A system for tracking hours, generating invoices, or processing payments. Simplifies the administrative side of care and reduces errors in payment workflows.',
      status: 'planned',
      icon: <Calculator className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '14',
      title: 'On-Demand Care Requests',
      description: 'A short-notice request system for quickly finding and booking available caregivers. Provides immediate relief for unexpected care needs and flexible work opportunities.',
      status: 'planned',
      icon: <Clock className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '16',
      title: 'Professional Dashboard',
      description: 'A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.',
      status: 'planned',
      icon: <Briefcase className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '19',
      title: 'Access Professional Tools',
      description: 'A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.',
      status: 'planned',
      icon: <ClipboardList className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '20',
      title: 'Caregiver Learning Hub',
      description: 'A dedicated learning space with courses, certifications, and best practices for career advancement.',
      status: 'planned',
      icon: <BookOpen className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },
    {
      id: '21',
      title: 'Agency Training & Development Hub',
      description: 'A training center for agencies offering certifications, compliance training, and workforce development.',
      status: 'planned',
      icon: <BookOpen className="h-5 w-5" />,
      category: 'Professional Tools',
      roleType: 'professional'
    },

    {
      id: '23',
      title: 'Find Care Circles',
      description: 'A community-driven support system for knowledge sharing and mutual support.',
      status: 'planned',
      icon: <Heart className="h-5 w-5" />,
      category: 'Community Tools',
      roleType: 'community'
    },
    {
      id: '24',
      title: 'View Events',
      description: 'A calendar system for community meetups, workshops, and advocacy events.',
      status: 'planned',
      icon: <Calendar className="h-5 w-5" />,
      category: 'Community Tools',
      roleType: 'community'
    },
    {
      id: '25',
      title: 'Get Involved',
      description: 'A volunteer portal for supporting families and caregivers through mentorship and assistance.',
      status: 'planned',
      icon: <Heart className="h-5 w-5" />,
      category: 'Community Tools',
      roleType: 'community'
    },

    {
      id: '1',
      title: 'Calendar Integration',
      description: 'Sync your care schedule with popular calendar apps',
      status: 'planned',
      icon: <Calendar className="h-5 w-5" />,
      category: 'Scheduling',
      roleType: 'general'
    },
    {
      id: '6',
      title: 'Calendar & Scheduling Integration',
      description: 'Syncing appointments and tasks with Google Calendar, Outlook, or an internal scheduler. Centralizes all care-related events and reduces scheduling conflicts, providing a clear overview for both families and caregivers.',
      status: 'planned',
      icon: <Calendar className="h-5 w-5" />,
      category: 'Scheduling',
      roleType: 'general'
    },
    {
      id: '9',
      title: 'Emergency Alerts & Fall Detection',
      description: 'A panic button, sensor integration, or automated alerts for sudden changes (e.g., fall, wandering, vital sign fluctuations). Provides peace of mind and offers rapid response options when urgent help is needed.',
      status: 'planned',
      icon: <Clock className="h-5 w-5" />,
      category: 'Safety',
      roleType: 'general'
    },
    {
      id: '10',
      title: 'Resource Library & Training Modules',
      description: 'Articles, videos, and best practices for handling specific conditions. Empowers caregivers and families with up-to-date knowledge and enhances care quality by providing accessible training resources.',
      status: 'planned',
      icon: <BookMarked className="h-5 w-5" />,
      category: 'Learning',
      roleType: 'general'
    }
  ];

  const getFeaturesByCategory = (category: string) => {
    return features.filter(feature => feature.category === category);
  };

  useEffect(() => {
    setFeatures(databaseFeatures);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <FeatureCategory 
        title="Profile Management" 
        description="Customize and manage profiles for different user roles"
      >
        {getFeaturesByCategory('Profile Management').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Care Management" 
        description="Tools and features for managing care activities and coordination"
      >
        {getFeaturesByCategory('Care Management').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Medication Management" 
        description="Features for tracking, reminding, and managing medications"
      >
        {getFeaturesByCategory('Medication Management').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Meal Planning" 
        description="Tools for planning, tracking, and managing nutritional needs"
      >
        {getFeaturesByCategory('Meal Planning').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Professional Features" 
        description="Specialized tools for caregivers and agencies"
      >
        {getFeaturesByCategory('Professional Tools').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Community Features" 
        description="Tools for community engagement and support"
      >
        {getFeaturesByCategory('Community Tools').map((feature) => (
          <DatabaseFeatureCard key={feature.id} feature={feature} />
        ))}
      </FeatureCategory>

      <FeatureCategory 
        title="Additional Features" 
        description="Calendar integration, safety features, and resources"
      >
        {features
          .filter(feature => 
            !['Profile Management', 'Care Management', 'Medication Management', 
             'Meal Planning', 'Professional Tools', 'Community Tools'].includes(feature.category || ''))
          .map((feature) => (
            <DatabaseFeatureCard key={feature.id} feature={feature} />
          ))}
      </FeatureCategory>

      <div className="col-span-full">
        <TechInnovatorsHub />
      </div>
    </div>
  );
};

export default FeaturesGrid;
