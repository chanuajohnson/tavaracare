import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useCarePlanData() {
  const { user } = useAuth();
  
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [loadingCarePlans, setLoadingCarePlans] = useState(true);
  const [careTeamMembers, setCareTeamMembers] = useState<any[]>([]);
  const [loadingCareTeamMembers, setLoadingCareTeamMembers] = useState(true);
  
  const loadCarePlans = async () => {
    try {
      setLoadingCarePlans(true);
      setLoadingCareTeamMembers(true);
      
      if (!user) {
        console.log("No user found, skipping care plans fetch");
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      console.log("Fetching care plans for professional user:", user.id);
      
      // STEP 1: Get all care team assignments for this professional
      const { data: careTeamAssignments, error: teamAssignmentsError } = await supabase
        .from('care_team_members')
        .select(`
          id, 
          care_plan_id, 
          family_id, 
          caregiver_id, 
          role, 
          status, 
          notes, 
          created_at
        `)
        .eq('caregiver_id', user.id);
      
      if (teamAssignmentsError) {
        console.error("Error fetching care team assignments:", teamAssignmentsError);
        throw teamAssignmentsError;
      }
      
      console.log("Raw care team assignments:", careTeamAssignments);
      console.log("Total care team assignments found:", careTeamAssignments?.length || 0);
      
      if (!careTeamAssignments || careTeamAssignments.length === 0) {
        console.log("No care team assignments found for user");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 2: Extract all care plan IDs from assignments
      const carePlanIds = careTeamAssignments
        .map(assignment => assignment.care_plan_id)
        .filter(id => id !== null && id !== undefined) as string[];
      
      console.log("Care plan IDs to fetch:", carePlanIds);
      console.log("Number of care plan IDs to fetch:", carePlanIds.length);
      
      if (carePlanIds.length === 0) {
        console.log("No valid care plan IDs found");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 3: Fetch care plan details
      const { data: carePlansData, error: carePlansError } = await supabase
        .from('care_plans')
        .select(`
          id, 
          title, 
          description, 
          status, 
          family_id
        `)
        .in('id', carePlanIds);
      
      if (carePlansError) {
        console.error("Error fetching care plans:", carePlansError);
        throw carePlansError;
      }
      
      console.log("Raw care plans data:", carePlansData);
      console.log("Number of care plans retrieved:", carePlansData?.length || 0);
      
      if (!carePlansData || carePlansData.length === 0) {
        console.log("No care plans found with the given IDs");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 4: Fetch family profiles for all care plans
      const familyIds = [...new Set((carePlansData || [])
        .map(plan => plan.family_id)
        .filter(id => id !== null && id !== undefined))];
      
      console.log("Family IDs to fetch:", familyIds);
      
      let familyProfiles = [];
      if (familyIds.length > 0) {
        const { data: familyProfilesData, error: familyProfilesError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            phone_number
          `)
          .in('id', familyIds);
        
        if (familyProfilesError) {
          console.error("Error fetching family profiles:", familyProfilesError);
          throw familyProfilesError;
        }
        
        familyProfiles = familyProfilesData || [];
        console.log("Raw family profiles data:", familyProfiles);
      }
      
      // STEP 5: Build transformed care plans with standardized naming and proper validation
      const transformedCarePlans = [];
      
      for (const assignment of careTeamAssignments) {
        // Skip assignments without care_plan_id
        if (!assignment.care_plan_id) {
          console.warn("Skipping assignment without care_plan_id:", assignment);
          continue;
        }
        
        // Find matching care plan
        const carePlan = carePlansData.find(plan => plan.id === assignment.care_plan_id);
        
        // Skip if no matching care plan
        if (!carePlan) {
          console.warn(`No care plan found for assignment ${assignment.id} with plan ID ${assignment.care_plan_id}`);
          continue;
        }
        
        // Find family profile with fallback
        const familyProfile = familyProfiles.find(profile => profile.id === carePlan.family_id) || {
          id: carePlan.family_id,
          full_name: "Family",
          avatar_url: null,
          phone_number: null
        };
        
        // Create transformed object with validated fields and standardized naming
        transformedCarePlans.push({
          id: assignment.id,
          care_plan_id: assignment.care_plan_id,
          family_id: carePlan.family_id,
          role: assignment.role || 'caregiver',
          status: assignment.status || 'pending',
          notes: assignment.notes,
          created_at: assignment.created_at,
          // Use singular care_plan instead of care_plans
          care_plan: {
            id: carePlan.id,
            title: carePlan.title || "Untitled Care Plan",
            description: carePlan.description || "No description provided",
            status: carePlan.status || "active",
            family_id: carePlan.family_id,
            // Use family_profile instead of profiles for consistent naming
            family_profile: familyProfile
          },
          // Keep care_plans for backward compatibility during transition
          care_plans: {
            id: carePlan.id,
            title: carePlan.title || "Untitled Care Plan",
            description: carePlan.description || "No description provided",
            status: carePlan.status || "active",
            family_id: carePlan.family_id,
            profiles: familyProfile
          }
        });
      }
      
      console.log("Transformed care plans:", transformedCarePlans);
      console.log("Number of transformed care plans:", transformedCarePlans.length);
      setCarePlans(transformedCarePlans);
      
      // STEP 6: Fetch ALL team members for these care plans
      const fetchCareTeamMembers = async () => {
        try {
          console.log("Starting to fetch care team members for all plans...");
          const allTeamMembers = [];
          
          for (const carePlanId of carePlanIds) {
            console.log(`Fetching team members for care plan: ${carePlanId}`);
            
            // Improved query to get all team members for this care plan, not just the current user
            const { data: teamMembers, error: membersError } = await supabase
              .from('care_team_members')
              .select(`
                id,
                care_plan_id,
                family_id,
                caregiver_id,
                role,
                status,
                notes,
                created_at,
                updated_at,
                profiles:caregiver_id (
                  full_name,
                  professional_type,
                  avatar_url
                )
              `)
              .eq('care_plan_id', carePlanId);
            
            if (membersError) {
              console.error(`Error fetching team members for plan ${carePlanId}:`, membersError);
              continue;
            }
            
            console.log(`Team members for plan ${carePlanId}:`, teamMembers);
            console.log(`Number of team members for plan ${carePlanId}:`, teamMembers?.length || 0);
            
            if (teamMembers && teamMembers.length > 0) {
              const formattedMembers = teamMembers.map(member => {
                const profileData = member.profiles || {};
                
                return {
                  id: member.id,
                  carePlanId: member.care_plan_id,
                  familyId: member.family_id,
                  caregiverId: member.caregiver_id,
                  role: member.role || 'caregiver',
                  status: member.status || 'invited',
                  notes: member.notes,
                  createdAt: member.created_at,
                  updatedAt: member.updated_at,
                  professionalDetails: {
                    full_name: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).full_name || 'Unknown Professional' 
                      : 'Unknown Professional',
                    professional_type: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).professional_type || 'Care Professional' 
                      : 'Care Professional',
                    avatar_url: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).avatar_url 
                      : null
                  }
                };
              });
              
              allTeamMembers.push(...formattedMembers);
            }
          }
          
          console.log("All team members data:", allTeamMembers);
          console.log("Total team members count:", allTeamMembers.length);
          setCareTeamMembers(allTeamMembers);
        } catch (err) {
          console.error("Error processing team members:", err);
          setCareTeamMembers([]);
        } finally {
          setLoadingCareTeamMembers(false);
        }
      };
      
      fetchCareTeamMembers();
      setLoadingCarePlans(false);
    } catch (err) {
      console.error("Error loading care plans:", err);
      toast.error("Failed to load care assignments");
      setLoadingCarePlans(false);
      setLoadingCareTeamMembers(false);
      setCarePlans([]);
      setCareTeamMembers([]);
    }
  };
  
  useEffect(() => {
    loadCarePlans();
  }, [user]);
  
  return {
    carePlans,
    loadingCarePlans,
    careTeamMembers,
    loadingCareTeamMembers
  };
}
