import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProfessionalReference } from '@/hooks/professional/types';

export const ProfessionalReferencesForm = () => {
  const { user } = useAuth();
  const [references, setReferences] = useState<ProfessionalReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRef, setNewRef] = useState({
    reference_name: '',
    reference_phone: '',
    reference_email: '',
    reference_relationship: '',
    years_known: ''
  });

  useEffect(() => {
    if (user) fetchReferences();
  }, [user]);

  const fetchReferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professional_references')
        .select('*')
        .eq('professional_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReferences((data || []) as unknown as ProfessionalReference[]);
    } catch (error) {
      console.error('Error fetching references:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReference = async () => {
    if (!newRef.reference_name || !newRef.reference_relationship) {
      toast.error('Please provide at least the reference name and relationship');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('professional_references')
        .insert({
          professional_id: user?.id,
          reference_name: newRef.reference_name,
          reference_phone: newRef.reference_phone || null,
          reference_email: newRef.reference_email || null,
          reference_relationship: newRef.reference_relationship,
          years_known: newRef.years_known || null
        });

      if (error) throw error;

      toast.success('Reference added successfully');
      setNewRef({ reference_name: '', reference_phone: '', reference_email: '', reference_relationship: '', years_known: '' });
      fetchReferences();
    } catch (error: any) {
      console.error('Error adding reference:', error);
      toast.error(error.message || 'Failed to add reference');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_references')
        .delete()
        .eq('id', id)
        .eq('professional_id', user?.id);

      if (error) throw error;
      toast.success('Reference removed');
      fetchReferences();
    } catch (error: any) {
      console.error('Error deleting reference:', error);
      toast.error('Failed to remove reference');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✓ Verified</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-700 border-red-200">⚠ Flagged</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={references.length >= 2 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {references.length >= 2 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium">
                {references.length >= 2
                  ? `✓ ${references.length} references submitted`
                  : `${references.length}/2 references submitted — ${2 - references.length} more needed`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                You need at least 2 professional references to proceed to matching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing References */}
      {references.map((ref) => (
        <Card key={ref.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{ref.reference_name}</p>
                  {getStatusBadge(ref.status)}
                </div>
                <p className="text-sm text-muted-foreground">{ref.reference_relationship}</p>
                {ref.reference_phone && <p className="text-sm">📞 {ref.reference_phone}</p>}
                {ref.reference_email && <p className="text-sm">📧 {ref.reference_email}</p>}
                {ref.years_known && <p className="text-sm">Known for {ref.years_known}</p>}
              </div>
              {ref.status === 'pending' && (
                <Button variant="ghost" size="sm" onClick={() => handleDeleteReference(ref.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Reference Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add a Reference
          </CardTitle>
          <CardDescription>
            Provide details for a professional reference (former employer, colleague, or client family)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference Name *</Label>
              <Input
                placeholder="Full name"
                value={newRef.reference_name}
                onChange={(e) => setNewRef(prev => ({ ...prev, reference_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship *</Label>
              <Select value={newRef.reference_relationship} onValueChange={(v) => setNewRef(prev => ({ ...prev, reference_relationship: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="former_employer">Former Employer</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="client_family">Client Family</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Phone number"
                value={newRef.reference_phone}
                onChange={(e) => setNewRef(prev => ({ ...prev, reference_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email address"
                value={newRef.reference_email}
                onChange={(e) => setNewRef(prev => ({ ...prev, reference_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Years Known</Label>
              <Input
                placeholder="e.g. 3 years"
                value={newRef.years_known}
                onChange={(e) => setNewRef(prev => ({ ...prev, years_known: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleAddReference} disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving...' : 'Add Reference'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
