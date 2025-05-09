
import React, { createContext, useContext, useState } from 'react';

interface FeaturesContextType {
  features: string[];
  enabledFeatures: string[];
  isFeatureEnabled: (feature: string) => boolean;
  toggleFeature: (feature: string) => void;
}

const FeaturesContext = createContext<FeaturesContextType>({
  features: [],
  enabledFeatures: [],
  isFeatureEnabled: () => false,
  toggleFeature: () => {},
});

export const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const features = ['legacy_stories', 'caregiver_matching', 'care_needs'];

  const isFeatureEnabled = (feature: string) => {
    return enabledFeatures.includes(feature);
  };

  const toggleFeature = (feature: string) => {
    setEnabledFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  return (
    <FeaturesContext.Provider
      value={{
        features,
        enabledFeatures,
        isFeatureEnabled,
        toggleFeature,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeatures = () => useContext(FeaturesContext);
