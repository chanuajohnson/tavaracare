
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

interface LessonCompletionButtonProps {
  moduleId: string;
  lessonId: string;
  totalLessons: number;
  onComplete: () => void;
}

const LessonCompletionButton = ({ 
  moduleId, 
  lessonId, 
  totalLessons, 
  onComplete 
}: LessonCompletionButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleMarkAsComplete = async () => {
    if (!user) {
      toast.error("You must be logged in to track progress");
      return;
    }

    try {
      setIsSubmitting(true);

      // First check if there's already a progress record
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProgress) {
        // Update existing progress
        const newCompletedCount = existingProgress.completed_lessons + 1;
        const isModuleComplete = newCompletedCount >= totalLessons;
        
        const { error: updateError } = await supabase
          .from('user_module_progress')
          .update({
            completed_lessons: newCompletedCount,
            last_accessed: new Date().toISOString(),
            status: isModuleComplete ? 'completed' : 'in_progress'
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_module_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            completed_lessons: 1,
            status: totalLessons === 1 ? 'completed' : 'in_progress'
          });

        if (insertError) throw insertError;
      }

      toast.success("Lesson completed! Your progress has been updated.");
      onComplete();
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      toast.error("Failed to update progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleMarkAsComplete}
      disabled={isSubmitting}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Progress...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  );
};

export default LessonCompletionButton;
