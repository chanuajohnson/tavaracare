import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Check, X, Pencil, Trash2, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { adminTestimonialService, TestimonialInput, Testimonial } from "@/services/adminTestimonialService";

const RELATIONSHIP_OPTIONS = [
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "grandchild", label: "Grandchild" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other Family Member" },
];

const TestimonialManagementPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<TestimonialInput>({
    caregiverId: "",
    familyName: "",
    familyRelationship: "",
    content: "",
    rating: 5,
    carePeriodStart: "",
    carePeriodEnd: "",
  });

  // Fetch caregivers for dropdown
  const { data: caregivers } = useQuery({
    queryKey: ["professional-caregivers"],
    queryFn: () => adminTestimonialService.getProfessionalCaregivers(),
  });

  // Fetch testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials", activeTab],
    queryFn: () => adminTestimonialService.getAllTestimonials(activeTab),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (input: TestimonialInput) => adminTestimonialService.createTestimonial(input),
    onSuccess: () => {
      toast.success("Testimonial created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create testimonial");
      console.error(error);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminTestimonialService.updateTestimonialStatus(id, isApproved),
    onSuccess: () => {
      toast.success("Testimonial status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TestimonialInput> }) =>
      adminTestimonialService.updateTestimonial(id, input),
    onSuccess: () => {
      toast.success("Testimonial updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update testimonial");
      console.error(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminTestimonialService.deleteTestimonial(id),
    onSuccess: () => {
      toast.success("Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete testimonial");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      caregiverId: "",
      familyName: "",
      familyRelationship: "",
      content: "",
      rating: 5,
      carePeriodStart: "",
      carePeriodEnd: "",
    });
    setEditingTestimonial(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caregiverId || !formData.familyName || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, input: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      caregiverId: testimonial.caregiverId,
      familyName: testimonial.familyName,
      familyRelationship: testimonial.familyRelationship || "",
      content: testimonial.content,
      rating: testimonial.rating || 5,
      carePeriodStart: testimonial.carePeriodStart || "",
      carePeriodEnd: testimonial.carePeriodEnd || "",
    });
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link 
              to="/dashboard/admin" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Testimonial Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, review, and manage caregiver testimonials
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "approved")}>
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : testimonials && testimonials.length > 0 ? (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">
                                {testimonial.caregiverName}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                from {testimonial.familyName}
                                {testimonial.familyRelationship && ` (${testimonial.familyRelationship})`}
                              </span>
                              <Badge variant={testimonial.isApproved ? "default" : "secondary"}>
                                {testimonial.isApproved ? "Approved" : "Pending"}
                              </Badge>
                              {testimonial.source && (
                                <Badge variant="outline" className="text-xs">
                                  {testimonial.source}
                                </Badge>
                              )}
                            </div>
                            
                            {testimonial.rating && renderStars(testimonial.rating)}
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              "{testimonial.content}"
                            </p>
                            
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {!testimonial.isApproved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => updateStatusMutation.mutate({ id: testimonial.id, isApproved: true })}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => setDeletingId(testimonial.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No {activeTab} testimonials found.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial 
                  ? "Update the testimonial details below." 
                  : "Enter the details for the new testimonial."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver">Caregiver *</Label>
                <Select
                  value={formData.caregiverId}
                  onValueChange={(v) => setFormData({ ...formData, caregiverId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a caregiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers?.map((cg) => (
                      <SelectItem key={cg.id} value={cg.id}>
                        {cg.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name *</Label>
                  <Input
                    id="familyName"
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="e.g., The Johnson Family"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.familyRelationship}
                    onValueChange={(v) => setFormData({ ...formData, familyRelationship: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the testimonial text..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (formData.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carePeriodStart">Care Period Start</Label>
                  <Input
                    id="carePeriodStart"
                    type="date"
                    value={formData.carePeriodStart}
                    onChange={(e) => setFormData({ ...formData, carePeriodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carePeriodEnd">Care Period End</Label>
                  <Input
                    id="carePeriodEnd"
                    type="date"
                    value={formData.carePeriodEnd}
                    onChange={(e) => setFormData({ ...formData, carePeriodEnd: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTestimonial ? "Update" : "Create"} Testimonial
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The testimonial will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TestimonialManagementPage;
