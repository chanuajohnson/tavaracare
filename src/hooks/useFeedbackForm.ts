
import { useState } from "react";

export const useFeedbackForm = () => {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  return {
    isFeedbackFormOpen,
    setIsFeedbackFormOpen,
  };
};
