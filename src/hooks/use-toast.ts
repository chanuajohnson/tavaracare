
import { toast as sonnerToast } from "sonner";

// Simple wrapper around Sonner toast to maintain a similar API to the previous implementation
type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
};

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds default duration

// Create a wrapper function to maintain similar API
function toast(options: ToastOptions) {
  const { 
    title, 
    description, 
    duration = DEFAULT_TOAST_DURATION, 
    variant = "default", 
    action 
  } = options;

  // Map our variant to Sonner's type
  const type = variant === "destructive" ? "error" : 
               variant === "default" ? "normal" : variant;

  // Create the toast with Sonner
  return sonnerToast(title || "", {
    description,
    duration,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    // @ts-ignore - Sonner types don't fully match but this works
    type,
  });
}

// Enhanced helper methods with more consistent API
toast.success = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return toast({
    title: message,
    variant: "success",
    ...options
  });
};

toast.error = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return toast({
    title: message,
    variant: "destructive",
    ...options
  });
};

toast.warning = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return toast({
    title: message,
    variant: "warning",
    ...options
  });
};

toast.info = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return toast({
    title: message,
    description: options?.description,
    duration: options?.duration || DEFAULT_TOAST_DURATION,
    variant: "info",
    action: options?.action,
  });
};

// Simple dismiss function for backward compatibility
const dismiss = () => {
  sonnerToast.dismiss();
};

function useToast() {
  return {
    toast,
    dismiss
  };
}

export { useToast, toast };
