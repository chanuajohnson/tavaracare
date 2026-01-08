import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, MapPin, Download, Loader2, Trash2, BarChart3, Edit2, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { FLYER_CATEGORIES, generateLocationCode, getCategoryByCode } from '@/constants/flyerCategories';
import { CaregivingFlyerTemplate } from '@/components/marketing/CaregivingFlyerTemplate';
import { FlyerAnalyticsDashboard } from '@/components/marketing/FlyerAnalyticsDashboard';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlyerLocation {
  id: string;
  code: string;
  category: string;
  business_name: string;
  address: string | null;
  variant: string;
  flyers_count: number;
  placed_date: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

const FlyerLocations = () => {
  const [locations, setLocations] = useState<FlyerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FlyerLocation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [batchDownloading, setBatchDownloading] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('flyer_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!category || !businessName) {
      toast.error('Please fill in category and business name');
      return;
    }

    setSubmitting(true);
    const code = generateLocationCode(category, businessName);

    try {
      const { error } = await supabase
        .from('flyer_locations')
        .insert({
          code,
          category,
          business_name: businessName,
          address: address || null,
          variant,
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success('Location added successfully');
      setAddDialogOpen(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error adding location:', error);
      if (error.code === '23505') {
        toast.error('A location with this code already exists');
      } else {
        toast.error('Failed to add location');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory('');
    setBusinessName('');
    setAddress('');
    setVariant('A');
    setContactName('');
    setContactPhone('');
    setNotes('');
  };

  const handleEditLocation = (loc: FlyerLocation) => {
    setEditingLocation(loc);
    setCategory(loc.category);
    setBusinessName(loc.business_name);
    setAddress(loc.address || '');
    setVariant(loc.variant as 'A' | 'B');
    setContactName(loc.contact_name || '');
    setContactPhone(loc.contact_phone || '');
    setNotes(loc.notes || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLocation || !category || !businessName) {
      toast.error('Please fill in category and business name');
      return;
    }

    setSubmitting(true);
    const newCode = generateLocationCode(category, businessName);

    try {
      const { error } = await supabase
        .from('flyer_locations')
        .update({
          code: newCode,
          category,
          business_name: businessName,
          address: address || null,
          variant,
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          notes: notes || null,
        })
        .eq('id', editingLocation.id);

      if (error) throw error;

      toast.success('Location updated successfully');
      setEditDialogOpen(false);
      setEditingLocation(null);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error updating location:', error);
      if (error.code === '23505') {
        toast.error('A location with this code already exists');
      } else {
        toast.error('Failed to update location');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFlyer = async (location: FlyerLocation) => {
    setDownloadingId(location.id);
    
    // Temporarily render the flyer
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const flyerId = `temp-flyer-${location.id}`;
    container.innerHTML = `<div id="${flyerId}"></div>`;

    // We need to render the React component
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(document.getElementById(flyerId)!);
    
    await new Promise<void>((resolve) => {
      root.render(
        <CaregivingFlyerTemplate 
          id={flyerId} 
          variant={location.variant as 'A' | 'B'} 
          locationCode={location.code}
        />
      );
      setTimeout(resolve, 100);
    });

    try {
      const flyerElement = document.getElementById(flyerId);
      if (!flyerElement) throw new Error('Flyer not found');

      const canvas = await html2canvas(flyerElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `tavara-flyer-${location.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success(`Flyer for ${location.business_name} downloaded!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download flyer');
    } finally {
      root.unmount();
      document.body.removeChild(container);
      setDownloadingId(null);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('flyer_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Location deleted');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete location');
    }
  };

  const handleSelectAll = () => {
    if (selectedLocations.size === locations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(locations.map(l => l.id)));
    }
  };

  const handleToggleSelection = (id: string) => {
    const newSet = new Set(selectedLocations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLocations(newSet);
  };

  const handleBatchDownload = async () => {
    const selected = locations.filter(l => selectedLocations.has(l.id));
    if (selected.length === 0) return;

    setBatchDownloading(true);
    let successCount = 0;

    for (const location of selected) {
      try {
        await handleDownloadFlyer(location);
        successCount++;
        // Small delay between downloads to prevent browser issues
        await new Promise(r => setTimeout(r, 400));
      } catch (error) {
        console.error(`Failed to download flyer for ${location.business_name}:`, error);
      }
    }

    toast.success(`Downloaded ${successCount} of ${selected.length} flyers!`);
    setSelectedLocations(new Set());
    setBatchDownloading(false);
  };

  const handleUpdateFlyerCount = async (id: string, count: number) => {
    try {
      const { error } = await supabase
        .from('flyer_locations')
        .update({ 
          flyers_count: count,
          placed_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
      fetchLocations();
    } catch (error) {
      console.error('Error updating count:', error);
    }
  };

  const groupedLocations = locations.reduce((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = [];
    acc[loc.category].push(loc);
    return acc;
  }, {} as Record<string, FlyerLocation[]>);

  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Flyer Distribution & Analytics</h1>
          <p className="text-muted-foreground">
            Manage distribution locations and track performance
          </p>
        </div>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{locations.length}</div>
                    <p className="text-sm text-muted-foreground">Total Locations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{Object.keys(groupedLocations).length}</div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{locations.reduce((sum, l) => sum + l.flyers_count, 0)}</div>
                    <p className="text-sm text-muted-foreground">Flyers Distributed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{locations.filter(l => l.placed_date).length}</div>
                    <p className="text-sm text-muted-foreground">Active Placements</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Batch Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={locations.length === 0}
                >
                  {selectedLocations.size === locations.length && locations.length > 0 ? (
                    <>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>
                {selectedLocations.size > 0 && (
                  <Button 
                    onClick={handleBatchDownload} 
                    disabled={batchDownloading}
                    size="sm"
                  >
                    {batchDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download {selectedLocations.size} Flyer{selectedLocations.size > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Distribution Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {FLYER_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.code} value={cat.code}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Business Name *</Label>
                    <Input 
                      value={businessName} 
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Allied Pharmacy"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g., Port of Spain"
                    />
                  </div>
                  <div>
                    <Label>Flyer Variant</Label>
                    <Select value={variant} onValueChange={(v) => setVariant(v as 'A' | 'B')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Variant A - "Find care now"</SelectItem>
                        <SelectItem value="B">Variant B - "Match with a caregiver today"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Name</Label>
                      <Input 
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input 
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleAddLocation} disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add Location
                  </Button>
                </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Locations by Category */}
          {Object.entries(groupedLocations).map(([catCode, locs]) => {
            const cat = getCategoryByCode(catCode);
            return (
              <Card key={catCode}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{cat?.icon || '📍'}</span>
                    {cat?.label || catCode}
                    <span className="text-sm font-normal text-muted-foreground">({locs.length})</span>
                  </CardTitle>
                  <CardDescription>{cat?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locs.map((loc) => (
                      <div 
                        key={loc.id} 
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 ${selectedLocations.has(loc.id) ? 'bg-primary/5 border-primary/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={selectedLocations.has(loc.id)}
                            onCheckedChange={() => handleToggleSelection(loc.id)}
                            className="mt-1"
                          />
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{loc.business_name}</p>
                            {loc.address && <p className="text-sm text-muted-foreground">{loc.address}</p>}
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                Variant {loc.variant}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Code: {loc.code}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <Input
                              type="number"
                              value={loc.flyers_count}
                              onChange={(e) => handleUpdateFlyerCount(loc.id, parseInt(e.target.value) || 0)}
                              className="w-20 h-8 text-center"
                              min={0}
                            />
                            <p className="text-xs text-muted-foreground">flyers</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditLocation(loc)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadFlyer(loc)}
                            disabled={downloadingId === loc.id}
                          >
                            {downloadingId === loc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteLocation(loc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {locations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first distribution location to start tracking
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <FlyerAnalyticsDashboard dateRange={dateRange} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingLocation(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FLYER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Business Name *</Label>
              <Input 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Allied Pharmacy"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Port of Spain"
              />
            </div>
            <div>
              <Label>Flyer Variant</Label>
              <Select value={variant} onValueChange={(v) => setVariant(v as 'A' | 'B')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Variant A - "Find care now"</SelectItem>
                  <SelectItem value="B">Variant B - "Match with a caregiver today"</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input 
                  value={contactName} 
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input 
                  value={contactPhone} 
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
            <Button onClick={handleSaveEdit} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit2 className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlyerLocations;
