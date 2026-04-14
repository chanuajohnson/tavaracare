import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { fetchEmployerSettings, upsertEmployerSettings } from "@/services/care-plans/team/employerSettingsService";
import type { EmployerSettings } from "@/types/careTypes";

interface EmployerSettingsFormProps {
  familyId: string;
}

export const EmployerSettingsForm: React.FC<EmployerSettingsFormProps> = ({ familyId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tradeName, setTradeName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [serviceCentre, setServiceCentre] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const settings = await fetchEmployerSettings(familyId);
      if (settings) {
        setTradeName(settings.tradeName || '');
        setRegNumber(settings.employerRegistrationNumber || '');
        setServiceCentre(settings.serviceCentreCode || '');
        setAddress(settings.address || '');
        setPhone(settings.phone || '');
      }
      setLoading(false);
    };
    load();
  }, [familyId]);

  const handleSave = async () => {
    setSaving(true);
    await upsertEmployerSettings(familyId, {
      tradeName,
      employerRegistrationNumber: regNumber,
      serviceCentreCode: serviceCentre,
      address,
      phone,
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          Employer / NIS Settings
        </CardTitle>
        <CardDescription>
          Required for NI 184 & NI 187 government filings. Enter your employer NIS registration details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tradeName">Trade Name</Label>
            <Input
              id="tradeName"
              placeholder="Your business/trade name"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regNumber">Employer Registration Number</Label>
            <Input
              id="regNumber"
              placeholder="5-digit NIS employer reg"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceCentre">Service Centre Code</Label>
            <Input
              id="serviceCentre"
              placeholder="e.g. POS, SFO"
              value={serviceCentre}
              onChange={(e) => setServiceCentre(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employerPhone">Phone</Label>
            <Input
              id="employerPhone"
              placeholder="Contact phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employerAddress">Address</Label>
          <Input
            id="employerAddress"
            placeholder="Employer address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? 'Saving...' : 'Save Employer Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
