import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgentBadgeProps {
  urgencyLevel?: "high" | "medium" | "low";
  label?: string;
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
}

export const UrgentBadge = ({
  urgencyLevel = "high",
  label,
  className,
  showIcon = true,
  animate = true,
}: UrgentBadgeProps) => {
  const getLevelStyles = () => {
    switch (urgencyLevel) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "low":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (urgencyLevel) {
      case "high":
        return "Available Now";
      case "medium":
        return "Seeking Work";
      case "low":
        return "Open to Opportunities";
      default:
        return "Available";
    }
  };

  const Icon = urgencyLevel === "high" ? Zap : Clock;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        getLevelStyles(),
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {getLabel()}
    </span>
  );

  if (animate && urgencyLevel === "high") {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};
