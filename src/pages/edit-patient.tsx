import { Button } from "@/components/ui/button"
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
import { FileText } from "lucide-react"
import { VitalsForm } from "@/components/vitals/vitals-form"
import { VitalsList } from "@/components/vitals/vitals-list"
import "medblocks-ui"
import "medblocks-ui/dist/shoelace"
import { saveVitalsComposition, getVitalsCompositions } from "@/services/vitals"
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([])
  const [isLoadingVitals, setIsLoadingVitals] = useState(false)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveVitals = async (composition: any) => {
    if (!formData.ehrId) {
      toast({
        title: "Error",
        description: "No EHR ID found for patient",
        variant: "destructive",
      })
      return
    }

    try {
      await saveVitalsComposition(formData.ehrId, composition)
      await loadVitals(formData.ehrId)
      
      toast({
        title: "Success",
        description: "Vitals recorded successfully",
      });
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast({
        title: "Error",
        description: "Failed to save vitals. Please try again.",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectVitals = (composition: any) => {
    console.log("Selected vitals:", composition);
    // Handle viewing/editing selected vitals
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

        <TabsContent value="vitals" className="space-y-6">
          <VitalsForm 
            onSave={handleSaveVitals}
            template={example}
          />
          <VitalsList 
            compositions={vitalsHistory}
            onSelect={handleSelectVitals}
            isLoading={isLoadingVitals}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
