
import React from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
