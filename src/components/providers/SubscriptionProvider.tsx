
import React, { createContext, useContext, useState } from 'react';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionExpiry: Date | null;
  checkSubscription: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  subscriptionTier: null,
  subscriptionExpiry: null,
  checkSubscription: async () => false,
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);

  const checkSubscription = async (): Promise<boolean> => {
    // In a real app, this would check with a backend service
    // This is just a placeholder implementation
    return isSubscribed;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionTier,
        subscriptionExpiry,
        checkSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
