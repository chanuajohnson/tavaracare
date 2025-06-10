
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Shield, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface VerificationStatusCardProps {
  onStatusChange?: (status: string) => void;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<string>('not_started');
  const [badgeEarnedAt, setBadgeEarnedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        // Use fallback values if the new columns don't exist yet
        const status = (profile as any).background_check_status || 'not_started';
        const badgeDate = (profile as any).verification_badge_earned_at || null;
        
        setVerificationStatus(status);
        setBadgeEarnedAt(badgeDate);
        onStatusChange?.(status);
      }
    } catch (error: any) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          label: 'Verified Professional',
          description: 'Your background check has been verified. You can now receive assignments!',
          color: 'bg-green-100 text-green-800 border-green-200',
          badge: true
        };
      case 'in_progress':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          label: 'Verification In Progress',
          description: 'We have received your documents and they are being reviewed.',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          badge: false
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          label: 'Verification Required',
          description: 'Please upload your Certificate of Character to get verified.',
          color: 'bg-red-100 text-red-800 border-red-200',
          badge: false
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(verificationStatus);

  return (
    <Card className={`border-2 ${statusInfo.color.includes('green') ? 'border-green-200' : statusInfo.color.includes('yellow') ? 'border-yellow-200' : 'border-red-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </div>
          {statusInfo.badge && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              <Award className="h-3 w-3 mr-1" />
              Verified Professional
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${statusInfo.color}`}>
          {statusInfo.icon}
          <div className="flex-1">
            <h3 className="font-medium">{statusInfo.label}</h3>
            <p className="text-sm mt-1">{statusInfo.description}</p>
            {badgeEarnedAt && verificationStatus === 'verified' && (
              <p className="text-xs mt-2 opacity-75">
                Badge earned on: {new Date(badgeEarnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
