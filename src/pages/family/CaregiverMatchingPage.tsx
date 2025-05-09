
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, Filter, MapPin, Clock, UserCheck, Medal, Calendar } from "lucide-react";

const CaregiverMatchingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [caregivers, setCaregivers] = useState([]);
  const [filters, setFilters] = useState({
    careType: 'all',
    location: '',
    experience: 'all'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockCaregivers = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: null,
        initials: 'SJ',
        rating: 4.8,
        location: 'Port of Spain',
        experience: '5+ years',
        specialties: ['Dementia Care', 'Mobility Assistance', 'Medication Management'],
        availability: 'Weekdays, Evenings',
        bio: 'Compassionate caregiver with extensive experience in dementia care and elderly assistance.',
        hourlyRate: '$25-30'
      },
      {
        id: '2',
        name: 'Michael Thomas',
        avatar: null,
        initials: 'MT',
        rating: 4.7,
        location: 'San Fernando',
        experience: '3+ years',
        specialties: ['Post-Surgery Care', 'Physical Therapy', 'Diabetes Management'],
        availability: 'Full-time, Weekends',
        bio: 'Former healthcare professional with specialized training in post-surgery recovery and rehabilitation.',
        hourlyRate: '$22-28'
      },
      {
        id: '3',
        name: 'Alicia Rampersad',
        avatar: null,
        initials: 'AR',
        rating: 5.0,
        location: 'Arima',
        experience: '7+ years',
        specialties: ['Alzheimer\'s Care', 'Companionship', 'Meal Preparation'],
        availability: 'Flexible',
        bio: 'Dedicated caregiver with a warm personality and specialized training in memory care.',
        hourlyRate: '$25-35'
      },
      {
        id: '4',
        name: 'David Williams',
        avatar: null,
        initials: 'DW',
        rating: 4.6,
        location: 'Chaguanas',
        experience: '2+ years',
        specialties: ['Transportation', 'Errands', 'Household Tasks'],
        availability: 'Part-time, Weekends',
        bio: 'Reliable assistant focusing on practical day-to-day help for seniors who need support with daily tasks.',
        hourlyRate: '$20-25'
      }
    ];
    
    setCaregivers(mockCaregivers);
    setIsLoading(false);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    if (filters.location && !caregiver.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    if (filters.experience !== 'all') {
      const years = parseInt(caregiver.experience);
      if (filters.experience === '0-2' && years > 2) return false;
      if (filters.experience === '3-5' && (years < 3 || years > 5)) return false;
      if (filters.experience === '5+' && years < 5) return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Caregiver</h1>
          <p className="text-gray-600">Connect with qualified caregivers who match your specific care needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Caregivers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Search by city..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Select
                    value={filters.experience}
                    onValueChange={(value) => handleFilterChange('experience', value)}
                  >
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Experience</SelectItem>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="careType">Care Type</Label>
                  <Select
                    value={filters.careType}
                    onValueChange={(value) => handleFilterChange('careType', value)}
                  >
                    <SelectTrigger id="careType">
                      <SelectValue placeholder="Select care type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Care Types</SelectItem>
                      <SelectItem value="dementia">Dementia Care</SelectItem>
                      <SelectItem value="mobility">Mobility Assistance</SelectItem>
                      <SelectItem value="companionship">Companionship</SelectItem>
                      <SelectItem value="medication">Medication Management</SelectItem>
                      <SelectItem value="postSurgery">Post-Surgery Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">
              {filteredCaregivers.length} Caregivers Available
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCaregivers.map(caregiver => (
                  <Card key={caregiver.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 md:w-1/4 flex flex-col items-center justify-center border-r border-gray-100">
                        <Avatar className="h-24 w-24 mb-2">
                          <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                            {caregiver.initials}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-lg text-center">{caregiver.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                          <Star className="fill-amber-500 h-4 w-4" />
                          <span>{caregiver.rating}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 md:w-3/4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {caregiver.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{caregiver.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{caregiver.availability}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{caregiver.experience} experience</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{caregiver.hourlyRate}/hr</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{caregiver.bio}</p>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button variant="default">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact
                          </Button>
                          
                          <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </Button>
                          
                          <Button variant="secondary">
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredCaregivers.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <p className="text-center text-gray-500 mb-4">
                        No caregivers match your current filters.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setFilters({
                          careType: 'all', 
                          location: '', 
                          experience: 'all'
                        })}
                      >
                        Reset Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CaregiverMatchingPage;
