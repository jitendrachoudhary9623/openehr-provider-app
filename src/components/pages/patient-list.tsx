import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Edit, Trash, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePatientStore } from "@/store/use-patient-store"
import { useState } from "react"
import { useTabStore } from "@/store/use-tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function PatientList() {
  const navigate = useNavigate()
  const patients = usePatientStore((state) => state.patients)
  const deletePatient = usePatientStore((state) => state.deletePatient)
  const [searchQuery, setSearchQuery] = useState("")
  const addTab = useTabStore((state) => state.addTab)

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchQuery) ||
      patient.ehrId?.toLowerCase().includes(searchLower)
    )
  })

  const handleEditPatient = (patientId: string) => {
    const path = `/patients/${patientId}/edit`
    const patient = patients.find(p => p.id === patientId)
    addTab({
      id: path,
      title: patient ? `Edit Patient - ${patient.firstName} ${patient.lastName}` : "Edit Patient",
      path: path,
    })
    navigate(path)
  }

  const handleAddPatient = () => {
    const path = "/patients/new"
    addTab({
      id: path,
      title: "New Patient",
      path: path,
    })
    navigate(path)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view patient information
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddPatient}>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[500px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients by name, email, phone, or EHR ID..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>EHR ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell className="capitalize">{patient.gender}</TableCell>
                <TableCell className="uppercase">{patient.bloodGroup}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {patient.ehrId ? patient.ehrId.slice(0, 8) + '...' : 'No EHR'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      {patient.ehrId && (
                        <TooltipContent>
                          <p>Full EHR ID: {patient.ehrId}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPatient(patient.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePatient(patient.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
