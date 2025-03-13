import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { usePatientStore, type Patient } from "@/store/use-patient-store"
import { useTabStore } from "@/store/use-tabs"
import { useToast } from "@/hooks/use-toast"
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { VitalsForm } from "@/components/vitals/vitals-form"
import { VitalsList } from "@/components/vitals/vitals-list"
import { VitalsDashboard } from "@/components/vitals/vitals-dashboard"
import "medblocks-ui"
import "medblocks-ui/dist/shoelace"
import { 
  saveVitalsComposition, 
  getVitalsCompositions, 
  deleteVitalsComposition, 
  getVitalsCompositionFlat,
  updateVitalsComposition,
  type VitalsComposition, 
  type VitalsResponse 
} from "@/services/vitals"
import example from "@/templates/example.json"

const defaultEmergencyContact = {
  name: '',
  phone: '',
  relationship: ''
}

export function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("general")
  const getPatientById = usePatientStore((state) => state.getPatientById)
  const updatePatient = usePatientStore((state) => state.updatePatient)
  const { updateTab } = useTabStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vitalsHistory, setVitalsHistory] = useState<VitalsResponse[]>([])
  const [isLoadingVitals, setIsLoadingVitals] = useState(false)
  const [selectedVitals, setSelectedVitals] = useState<VitalsResponse | undefined>()
  const [vitalsToDelete, setVitalsToDelete] = useState<VitalsResponse | undefined>()
  const [formData, setFormData] = useState<Patient>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    address: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    surgeries: '',
    emergencyContact: defaultEmergencyContact
  })

  const loadVitals = useCallback(async (ehrId: string) => {
    try {
      setIsLoadingVitals(true)
      const compositions = await getVitalsCompositions(ehrId)
      setVitalsHistory(compositions)
    } catch (error) {
      console.error('Error loading vitals:', error)
      toast({
        title: "Error",
        description: "Failed to load vitals history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingVitals(false)
    }
  }, [toast])

  useEffect(() => {
    if (id) {
      const patient = getPatientById(id)
      if (patient) {
        setFormData(patient)
        if (patient.ehrId) {
          loadVitals(patient.ehrId)
        }
      } else {
        navigate("/patients")
      }
    }
  }, [id, getPatientById, navigate, loadVitals])

  // Update tab title when name changes
  useEffect(() => {
    const fullName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ")
    const title = fullName ? `Edit Patient - ${fullName}` : "Edit Patient"
    updateTab(location.pathname, { title })
  }, [formData.firstName, formData.lastName, location.pathname, updateTab])

  const handleSaveVitals = async (composition?: VitalsComposition) => {
    // If composition is undefined, just clear selected vitals (cancel edit)
    if (!composition) {
      setSelectedVitals(undefined);
      return;
    }

    if (!formData.ehrId) {
      toast({
        title: "Error",
        description: "No EHR ID found for patient",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedVitals?.uid) {
        // Update existing vitals
        await updateVitalsComposition(formData.ehrId, selectedVitals.uid, composition)
      } else {
        // Create new vitals
        await saveVitalsComposition(formData.ehrId, composition)
      }
      
      // Clear selected vitals and reload data
      setSelectedVitals(undefined)
      await loadVitals(formData.ehrId)
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast({
        title: "Error",
        description: "Failed to save vitals. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditVitals = async (composition: VitalsResponse) => {
    if (!formData.ehrId) return;

    try {
      setActiveTab("vitals");
      // Get flat composition data
      const flatData = await getVitalsCompositionFlat(formData.ehrId, composition.uid);
      // Clear any existing data first
      setSelectedVitals(undefined);
      // Set new data after a brief delay to ensure form is reset
      setTimeout(() => {
        setSelectedVitals({ ...flatData, uid: composition.uid });
        // Scroll to form
        document.querySelector('.vitals-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (error) {
      console.error("Error getting vitals data:", error);
      toast({
        title: "Error",
        description: "Failed to load vitals data for editing",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVitals = (composition: VitalsResponse) => {
    setVitalsToDelete(composition);
  };

  const confirmDelete = async () => {
    if (!formData.ehrId || !vitalsToDelete) return;

    try {
      await deleteVitalsComposition(formData.ehrId, vitalsToDelete.uid);
      await loadVitals(formData.ehrId);
      toast({
        title: "Success",
        description: "Vitals record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vitals:", error);
      toast({
        title: "Error",
        description: "Failed to delete vitals record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVitalsToDelete(undefined);
    }
  };

  const handleInputChange = (field: keyof Patient, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmergencyContactChange = (field: keyof typeof defaultEmergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      if (id) {
        updatePatient(id, formData)
        toast({
          title: "Success",
          description: "Patient information updated successfully"
        })
        navigate("/patients")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update patient record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/patients")
  }

  if (!formData) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
          <p className="text-muted-foreground">
            Update patient information and medical history
          </p>
          <div className="flex flex-col gap-2 mt-2">
            {id && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md max-w-fit">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">Patient ID: {id}</span>
              </div>
            )}
            {formData.ehrId && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md max-w-fit">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">EHR ID: {formData.ehrId}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic patient details and demographics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName} 
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName} 
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={formData.dob} 
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select 
                    value={formData.bloodGroup} 
                    onValueChange={(value) => handleInputChange('bloodGroup', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a+">A+</SelectItem>
                      <SelectItem value="a-">A-</SelectItem>
                      <SelectItem value="b+">B+</SelectItem>
                      <SelectItem value="b-">B-</SelectItem>
                      <SelectItem value="o+">O+</SelectItem>
                      <SelectItem value="o-">O-</SelectItem>
                      <SelectItem value="ab+">AB+</SelectItem>
                      <SelectItem value="ab-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select 
                    value={formData.maritalStatus} 
                    onValueChange={(value) => handleInputChange('maritalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Patient's medical background and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="conditions">Current Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  placeholder="List any current medical conditions..."
                  className="min-h-[100px]"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List current medications and dosages..."
                  className="min-h-[100px]"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any known allergies..."
                  className="min-h-[100px]"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surgeries">Past Surgeries</Label>
                <Textarea
                  id="surgeries"
                  placeholder="List past surgeries and dates..."
                  className="min-h-[100px]"
                  value={formData.surgeries}
                  onChange={(e) => handleInputChange('surgeries', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Patient's contact details and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter full address..."
                  className="min-h-[100px]"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                  <Input 
                    id="emergencyName" 
                    value={formData.emergencyContact.name} 
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input 
                    id="emergencyPhone" 
                    type="tel" 
                    value={formData.emergencyContact.phone} 
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Patient</Label>
                <Input 
                  id="relationship" 
                  value={formData.emergencyContact.relationship} 
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Medical records and important documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>Insurance Information</Label>
                  <div className="flex items-center gap-4">
                    <Input type="file" className="w-full" />
                    <Button variant="outline">Upload</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Medical Records</Label>
                  <div className="flex items-center gap-4">
                    <Input type="file" className="w-full" />
                    <Button variant="outline">Upload</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Consent Forms</Label>
                  <div className="flex items-center gap-4">
                    <Input type="file" className="w-full" />
                    <Button variant="outline">Upload</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <VitalsDashboard
            compositions={vitalsHistory}
            isLoading={isLoadingVitals}
          />
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Latest Blood Pressure
                  {vitalsHistory[0]?.blood_pressure && (
                    <Badge variant={
                      vitalsHistory[0].blood_pressure.systolic.magnitude >= 140 || 
                      vitalsHistory[0].blood_pressure.diastolic.magnitude >= 90 ? 
                      'destructive' : 
                      vitalsHistory[0].blood_pressure.systolic.magnitude <= 90 || 
                      vitalsHistory[0].blood_pressure.diastolic.magnitude <= 60 ? 
                      'secondary' : 'default'
                    }>
                      {vitalsHistory[0].blood_pressure.systolic.magnitude >= 140 || 
                       vitalsHistory[0].blood_pressure.diastolic.magnitude >= 90 ? 'High' :
                       vitalsHistory[0].blood_pressure.systolic.magnitude <= 90 || 
                       vitalsHistory[0].blood_pressure.diastolic.magnitude <= 60 ? 'Low' : 'Normal'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                  {vitalsHistory[0]?.blood_pressure ? 
                    `${vitalsHistory[0].blood_pressure.systolic.magnitude}/${vitalsHistory[0].blood_pressure.diastolic.magnitude} mmHg` : 
                    'No data'
                  }
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {vitalsHistory[0]?.start_time ? 
                      `Last recorded: ${new Date(vitalsHistory[0].start_time).toLocaleDateString()}` :
                      'No records'
                    }
                  </p>
                  {vitalsHistory[1]?.blood_pressure && vitalsHistory[0]?.blood_pressure && (
                    <div className="flex items-center gap-1 text-xs">
                      {vitalsHistory[0].blood_pressure.systolic.magnitude > vitalsHistory[1].blood_pressure.systolic.magnitude ? (
                        <TrendingUp className="h-3 w-3 text-destructive" />
                      ) : vitalsHistory[0].blood_pressure.systolic.magnitude < vitalsHistory[1].blood_pressure.systolic.magnitude ? (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">vs previous</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Latest SpO2
                  {vitalsHistory[0]?.spo2 && (
                    <Badge variant={
                      (vitalsHistory[0].spo2.numerator / vitalsHistory[0].spo2.denominator * 100) < 95 ? 
                      'destructive' : 'default'
                    }>
                      {(vitalsHistory[0].spo2.numerator / vitalsHistory[0].spo2.denominator * 100) < 95 ? 
                       'Low' : 'Normal'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                  {vitalsHistory[0]?.spo2 ? 
                    `${(vitalsHistory[0].spo2.numerator / vitalsHistory[0].spo2.denominator * 100).toFixed(0)}%` : 
                    'No data'
                  }
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {vitalsHistory[0]?.start_time ? 
                      `Last recorded: ${new Date(vitalsHistory[0].start_time).toLocaleDateString()}` :
                      'No records'
                    }
                  </p>
                  {vitalsHistory[1]?.spo2 && vitalsHistory[0]?.spo2 && (
                    <div className="flex items-center gap-1 text-xs">
                      {vitalsHistory[0].spo2.numerator > vitalsHistory[1].spo2.numerator ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : vitalsHistory[0].spo2.numerator < vitalsHistory[1].spo2.numerator ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">vs previous</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Latest Pulse Rate
                  {vitalsHistory[0]?.pulse && (
                    <Badge variant={
                      vitalsHistory[0].pulse.rate > 100 ? 'destructive' :
                      vitalsHistory[0].pulse.rate < 60 ? 'secondary' : 'default'
                    }>
                      {vitalsHistory[0].pulse.rate > 100 ? 'High' :
                       vitalsHistory[0].pulse.rate < 60 ? 'Low' : 'Normal'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                  {vitalsHistory[0]?.pulse ? 
                    `${vitalsHistory[0].pulse.rate} bpm` : 
                    'No data'
                  }
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {vitalsHistory[0]?.start_time ? 
                      `Last recorded: ${new Date(vitalsHistory[0].start_time).toLocaleDateString()}` :
                      'No records'
                    }
                  </p>
                  {vitalsHistory[1]?.pulse && vitalsHistory[0]?.pulse && (
                    <div className="flex items-center gap-1 text-xs">
                      {vitalsHistory[0].pulse.rate > vitalsHistory[1].pulse.rate ? (
                        <TrendingUp className="h-3 w-3 text-destructive" />
                      ) : vitalsHistory[0].pulse.rate < vitalsHistory[1].pulse.rate ? (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">vs previous</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="vitals-form md:sticky md:top-6 md:col-span-2 transition-all duration-200 hover:shadow-lg bg-[rgb(37_99_235/var(--tw-bg-opacity,1))] bg-opacity-5 rounded-lg">
              <VitalsForm 
                onSave={handleSaveVitals}
                template={example}
                initialData={selectedVitals}
                title={selectedVitals?.uid ? "Edit Vitals" : "Record Vitals"}
                description={selectedVitals?.uid ? "Update patient vital signs" : "Enter new vital signs"}
              />
            </div>
            <div className="md:col-span-3 transition-all duration-200 hover:shadow-lg">
              <VitalsList 
                compositions={vitalsHistory}
                onEdit={handleEditVitals}
                onDelete={handleDeleteVitals}
                isLoading={isLoadingVitals}
              />
            </div>
          </div>
          <AlertDialog open={!!vitalsToDelete} onOpenChange={() => setVitalsToDelete(undefined)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Vitals Record</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this vitals record? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
