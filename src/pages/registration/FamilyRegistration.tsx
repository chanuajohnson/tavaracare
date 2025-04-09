
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChatbotPrefill } from "@/hooks/useChatbotPrefill";
import { updateConversionStatus } from "@/services/chatbotService";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  relationship?: string;
  careType?: string;
  careSchedule?: string;
  location?: string;
  additionalNotes?: string;
}

const FamilyRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<RegistrationFormData>();
  const { contactInfo, careNeeds, conversationId } = useChatbotPrefill();

  // Prefill form with chatbot data
  useEffect(() => {
    if (contactInfo) {
      if (contactInfo.firstName) setValue('firstName', contactInfo.firstName);
      if (contactInfo.lastName) setValue('lastName', contactInfo.lastName);
      if (contactInfo.email) setValue('email', contactInfo.email);
      if (contactInfo.location) setValue('location', contactInfo.location);
    }
    
    if (careNeeds) {
      if (careNeeds.relationship) setValue('relationship', careNeeds.relationship);
      if (careNeeds.careType && careNeeds.careType.length > 0) {
        setValue('careType', careNeeds.careType[0]);
      }
      if (careNeeds.schedule) setValue('careSchedule', careNeeds.schedule);
    }
  }, [contactInfo, careNeeds, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Register user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: 'family'
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        setIsSubmitting(false);
        return;
      }

      // Update profile with additional info
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            relationship: data.relationship,
            care_services: data.careType ? [data.careType] : undefined,
            care_schedule: data.careSchedule,
            location: data.location,
            additional_notes: data.additionalNotes
          })
          .eq('id', authData.user.id);

        if (profileError) {
          toast.error("Error updating profile: " + profileError.message);
        }
      }

      // If we came from chatbot, update conversion status
      if (conversationId) {
        await updateConversionStatus(conversationId, true);
      }

      toast.success("Registration successful! Welcome to Tavara Care.");
      navigate("/dashboard/family");

    } catch (error: any) {
      toast.error("Registration failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Family Registration</CardTitle>
          <CardDescription>
            Create your family account to connect with caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName", { required: "First name is required" })}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName", { required: "Last name is required" })}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: value => value === watch('password') || "Passwords do not match"
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Care Recipient</Label>
              <Input
                id="relationship"
                placeholder="e.g. Son, Daughter, Spouse"
                {...register("relationship")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="careType">Type of Care Needed</Label>
                <Input
                  id="careType"
                  placeholder="e.g. Senior Care"
                  {...register("careType")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careSchedule">Care Schedule</Label>
                <Input
                  id="careSchedule"
                  placeholder="e.g. Daily, Weekly"
                  {...register("careSchedule")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                {...register("location")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Tell us more about your care needs..."
                {...register("additionalNotes")}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{" "}
              <a
                href="/auth"
                className="text-primary-500 hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyRegistration;
