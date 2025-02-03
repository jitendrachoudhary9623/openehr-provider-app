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
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { usePatientStore, type Patient } from "@/store/use-patient-store"
import { useTabStore } from "@/store/use-tabs"
import { useToast } from "@/hooks/use-toast"
import { FileText } from "lucide-react"

const defaultEmergencyContact = {
  name: '',
  phone: '',
  relationship: ''
}

const defaultPatient: Omit<Patient, "id"> = {
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
}

export function NewPatient() {
  const navigate = useNavigate()
  const location = useLocation()
  const addPatient = usePatientStore((state) => state.addPatient)
  const { updateTab } = useTabStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Omit<Patient, "id">>(defaultPatient)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update tab title when name changes
  useEffect(() => {
    const fullName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ")
    const title = fullName ? `New Patient - ${fullName}` : "New Patient"
    updateTab(location.pathname, { title })
  }, [formData.firstName, formData.lastName, location.pathname, updateTab])

  const handleInputChange = (field: keyof Omit<Patient, "id">, value: string) => {
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const id = await addPatient(formData)
      const patient = usePatientStore.getState().getPatientById(id)
      
      toast({
        title: "Success",
        description: (
          <div className="flex flex-col gap-2">
            <p>Patient added successfully</p>
            {patient?.ehrId && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">EHR ID: {patient.ehrId}</span>
              </div>
            )}
          </div>
        ),
      })
      navigate("/patients")
    } catch {
      toast({
        title: "Error",
        description: "Failed to create patient record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/patients")
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Patient</h1>
          <p className="text-muted-foreground">
            Add a new patient to your records
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Save Patient"}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input 
              id="dob" 
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea 
            id="address" 
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea 
            id="medicalConditions" 
            placeholder="Enter medical conditions"
            value={formData.medicalConditions}
            onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medications">Current Medications</Label>
          <Textarea 
            id="medications" 
            placeholder="Enter current medications"
            value={formData.medications}
            onChange={(e) => handleInputChange('medications', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea 
            id="allergies" 
            placeholder="Enter allergies"
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="surgeries">Past Surgeries</Label>
          <Textarea 
            id="surgeries" 
            placeholder="Enter past surgeries"
            value={formData.surgeries}
            onChange={(e) => handleInputChange('surgeries', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name</Label>
              <Input 
                id="emergencyName" 
                placeholder="Enter emergency contact name"
                value={formData.emergencyContact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              <Input 
                id="emergencyPhone" 
                placeholder="Enter emergency contact phone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to Patient</Label>
            <Input 
              id="relationship" 
              placeholder="Enter relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
