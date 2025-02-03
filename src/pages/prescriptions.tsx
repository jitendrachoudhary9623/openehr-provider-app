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
import { Search, Plus, FileText, Printer } from "lucide-react"

export function Prescriptions() {
  const prescriptions = [
    {
      id: "PRE001",
      date: "2024-03-01",
      patient: "John Smith",
      medication: "Amoxicillin 500mg",
      dosage: "1 tablet 3x daily",
      duration: "7 days",
      doctor: "Dr. Jane Smith",
      status: "Active",
    },
    {
      id: "PRE002",
      date: "2024-02-28",
      patient: "Sarah Johnson",
      medication: "Lisinopril 10mg",
      dosage: "1 tablet daily",
      duration: "30 days",
      doctor: "Dr. Michael Brown",
      status: "Active",
    },
    {
      id: "PRE003",
      date: "2024-02-27",
      patient: "Michael Brown",
      medication: "Ibuprofen 400mg",
      dosage: "1 tablet as needed",
      duration: "5 days",
      doctor: "Dr. Jane Smith",
      status: "Completed",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage and track patient prescriptions
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[500px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search prescriptions by patient name, medication, or ID..." 
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prescription ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell className="font-medium">{prescription.id}</TableCell>
                <TableCell>{prescription.date}</TableCell>
                <TableCell>{prescription.patient}</TableCell>
                <TableCell>{prescription.medication}</TableCell>
                <TableCell>{prescription.dosage}</TableCell>
                <TableCell>{prescription.duration}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    prescription.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {prescription.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
