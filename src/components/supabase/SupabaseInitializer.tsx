
import { useEffect, useState } from 'react';
import { initializeSupabase, isSupabaseExperiencingIssues } from "@/lib/supabase";

export function SupabaseInitializer() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'available' | 'issues'>('checking');
  
  useEffect(() => {
    initializeSupabase()
      .then(success => {
        setSupabaseStatus(success ? 'available' : 'issues');
      })
      .catch(() => {
        setSupabaseStatus('issues');
      });
    
    const style = document.createElement('style');
    style.textContent = `
      .lovable-badge {
        bottom: auto !important;
        right: auto !important;
        top: 10px !important;
        left: 10px !important;
        z-index: 100 !important;
        opacity: 0.7 !important;
        transform: scale(0.8) !important;
      }
      .lovable-badge:hover {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    const checkInterval = setInterval(() => {
      setSupabaseStatus(isSupabaseExperiencingIssues() ? 'issues' : 'available');
    }, 30000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  if (supabaseStatus === 'issues') {
    return (
      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 fixed top-0 left-0 right-0 z-50 text-center">
        Supabase is currently experiencing issues. Some features may not work properly.
      </div>
    );
  }

  return null;
}
