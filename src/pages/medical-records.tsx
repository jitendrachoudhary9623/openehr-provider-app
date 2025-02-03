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
import { Search, FileText, Download, Eye } from "lucide-react"

export function MedicalRecords() {
  const records = [
    {
      id: "REC001",
      date: "2024-03-01",
      patient: "John Smith",
      type: "Lab Report",
      doctor: "Dr. Jane Smith",
      status: "Complete",
    },
    {
      id: "REC002",
      date: "2024-02-28",
      patient: "Sarah Johnson",
      type: "X-Ray Report",
      doctor: "Dr. Michael Brown",
      status: "Pending",
    },
    {
      id: "REC003",
      date: "2024-02-27",
      patient: "Michael Brown",
      type: "Prescription",
      doctor: "Dr. Jane Smith",
      status: "Complete",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            View and manage patient medical records
          </p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          New Record
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[500px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search records by patient name, ID, or type..." 
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Record ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.patient}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.doctor}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'Complete' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
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
