import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pill, Calendar, BarChart3, ArrowLeft } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MedicationCard } from "@/components/medication/MedicationCard";
import { MedicationForm } from "@/components/medication/MedicationForm";
import { MedicationScheduleView } from "@/components/medication/MedicationScheduleView";
import { MedicationReportsTab } from "@/components/medication/MedicationReportsTab";
import { ConflictAwareAdministrationForm } from "@/components/medication/ConflictAwareAdministrationForm";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";
import { fetchCarePlanById } from "@/services/care-plans/carePlanService";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MedicationManagementPage() {
  const { carePlanId } = useParams<{ carePlanId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationWithAdministrations | undefined>();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [carePlanTitle, setCarePlanTitle] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [administeringMedication, setAdministeringMedication] = useState<MedicationWithAdministrations | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Care Management", path: "/family/care-management" },
    { label: "Care Plan", path: `/family/care-management/${carePlanId}` },
    { label: "Medications", path: `/family/care-management/${carePlanId}/medications` },
  ];

  useEffect(() => {
    if (carePlanId && user) {
      loadCarePlanData();
      loadMedications();
    }
  }, [carePlanId, user]);

  const loadCarePlanData = async () => {
    if (!carePlanId) return;
    
    try {
      console.log('Loading care plan data for ID:', carePlanId);
      const carePlanData = await fetchCarePlanById(carePlanId);
      
      if (carePlanData) {
        console.log('Care plan loaded successfully:', carePlanData);
        setCarePlan(carePlanData);
        setCarePlanTitle(carePlanData.title);
        setError(null);
      } else {
        console.log('Care plan not found');
        setError('Care plan not found');
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      setError('Failed to load care plan');
    }
  };

  const loadMedications = async () => {
    if (!carePlanId) return;
    
    setIsLoading(true);
    try {
      const medicationData = await medicationService.getMedicationsForCarePlan(carePlanId);
      setMedications(medicationData);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationSaved = (medication: any) => {
    setShowAddForm(false);
    setEditingMedication(undefined);
    loadMedications(); // Refresh the list
  };

  const handleEditMedication = (medication: MedicationWithAdministrations) => {
    setEditingMedication(medication);
    setShowAddForm(true);
  };

  const handleDeleteMedication = async (medication: MedicationWithAdministrations) => {
    if (!confirm(`Are you sure you want to delete ${medication.name}?`)) return;
    
    const success = await medicationService.deleteMedication(medication.id);
    if (success) {
      loadMedications();
    }
  };

  const handleAdministerMedication = (medication: MedicationWithAdministrations) => {
    setAdministeringMedication(medication);
  };

  const handleAdministrationComplete = () => {
    setAdministeringMedication(null);
    loadMedications(); // Refresh the list to show updated status
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.medication_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!carePlanId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Invalid Care Plan</h2>
            <p className="text-muted-foreground mb-4">No care plan ID provided.</p>
            <Button onClick={() => navigate('/family/care-management')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Management
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="mt-8">
            <MedicationForm
              carePlanId={carePlanId}
              medication={editingMedication}
              onSave={handleMedicationSaved}
              onCancel={() => {
                setShowAddForm(false);
                setEditingMedication(undefined);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show administration form if administering a medication
  if (administeringMedication) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Pill className="h-8 w-8 text-blue-500" />
                  Administer Medication
                </h1>
                <p className="text-muted-foreground mt-2">
                  Recording administration for: {administeringMedication.name}
                </p>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setAdministeringMedication(null)}
              >
                Cancel
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <MedicationCard
                  medication={administeringMedication}
                  showEditActions={false}
                  showAdminActions={false}
                  userRole="family"
                />
              </div>
              <div>
                <ConflictAwareAdministrationForm
                  medicationId={administeringMedication.id}
                  medicationName={administeringMedication.name}
                  onAdministrationRecorded={handleAdministrationComplete}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || (carePlan === null && !isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <Card className="p-8 text-center mt-8">
            <h2 className="text-2xl font-semibold mb-2">Care Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The requested care plan could not be found.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/family/care-management')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Care Management
              </Button>
              <Button variant="outline" onClick={loadCarePlanData}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Pill className="h-8 w-8 text-blue-500" />
                Medication Management
              </h1>
              {carePlanTitle && (
                <p className="text-muted-foreground mt-2">
                  Managing medications for: {carePlanTitle}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/family/care-management/${carePlanId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Care Plan
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medications
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Medications List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading medications...</p>
                </div>
              ) : filteredMedications.length === 0 ? (
                <Card className="p-8 text-center">
                  <Pill className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No medications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No medications match your search.' : 'Get started by adding your first medication.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medication
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredMedications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onEdit={() => handleEditMedication(medication)}
                      onDelete={() => handleDeleteMedication(medication)}
                      onAdminister={() => handleAdministerMedication(medication)}
                      showEditActions={true}
                      showAdminActions={true}
                      userRole="family"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <MedicationScheduleView 
                carePlanId={carePlanId}
                onAdministrationUpdate={loadMedications}
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <MedicationReportsTab carePlanId={carePlanId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
