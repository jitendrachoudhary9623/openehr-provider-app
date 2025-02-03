import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Clock, Plus, User } from "lucide-react"
import { useState } from "react"

interface Appointment {
  id: string
  time: string
  patient: string
  type: string
  status: string
  duration: string
  notes?: string
  doctor: string
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

export function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const appointments: Appointment[] = [
    {
      id: "1",
      time: "09:00",
      patient: "John Smith",
      type: "Check-up",
      status: "Confirmed",
      duration: "30 min",
      notes: "Regular check-up for diabetes management",
      doctor: "Dr. Jane Smith"
    },
    {
      id: "2",
      time: "10:30",
      patient: "Sarah Johnson",
      type: "Follow-up",
      status: "Confirmed",
      duration: "30 min",
      notes: "Post-surgery follow-up",
      doctor: "Dr. Jane Smith"
    },
    {
      id: "3",
      time: "14:00",
      patient: "Michael Brown",
      type: "Consultation",
      status: "Pending",
      duration: "60 min",
      notes: "Initial consultation for knee pain",
      doctor: "Dr. Jane Smith"
    },
  ]

  const handleSlotClick = (time: string) => {
    setSelectedSlot(time)
    setShowNewAppointment(true)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetails(true)
  }

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(apt => apt.time === time)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your appointments and schedule
          </p>
        </div>
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Smith</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date?.toISOString().split('T')[0]} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Select defaultValue={selectedSlot || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Check-up</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any additional notes..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
                Cancel
              </Button>
              <Button>Save Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Slots</CardTitle>
              <CardDescription>Available appointment slots for {date?.toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {timeSlots.map((time) => {
                  const appointment = getAppointmentForSlot(time)
                  const isBooked = !!appointment

                  return (
                    <Button
                      key={time}
                      variant={isBooked ? "secondary" : "outline"}
                      className={`h-auto py-4 ${isBooked ? 'cursor-pointer' : ''}`}
                      onClick={() => isBooked 
                        ? handleAppointmentClick(appointment)
                        : handleSlotClick(time)
                      }
                    >
                      <div className="flex flex-col items-start gap-2 w-full">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                        {isBooked && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4" />
                              <span>{appointment.patient}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              appointment.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {appointment.status}
                            </span>
                          </>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View and manage appointment information
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <p className="text-sm mt-1">{selectedAppointment.patient}</p>
                </div>
                <div>
                  <Label>Doctor</Label>
                  <p className="text-sm mt-1">{selectedAppointment.doctor}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time</Label>
                  <p className="text-sm mt-1">{selectedAppointment.time}</p>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm mt-1">{selectedAppointment.duration}</p>
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm mt-1">{selectedAppointment.type}</p>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm mt-1">{selectedAppointment.notes}</p>
              </div>
              <div>
                <Label>Status</Label>
                <span className={`inline-flex mt-1 text-sm px-2.5 py-0.5 rounded-full font-medium ${
                  selectedAppointment.status === 'Confirmed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline">Reschedule</Button>
            <Button variant="destructive">Cancel Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
