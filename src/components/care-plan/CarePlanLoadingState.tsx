
import React from 'react';
import { Container } from "@/components/ui/container";

export const CarePlanLoadingState: React.FC = () => {
  return (
    <Container className="py-12">
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </Container>
  );
};
