import { User, Calendar, Phone, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PatientBannerProps {
  patient: {
    name: string
    id: string
    dob: string
    phone: string
    address: string
    gender: string
    age: number
  }
}

export function PatientBanner({ patient }: PatientBannerProps) {
  return (
    <Card className="bg-[rgb(37_99_235/0.05)] border-none">
      <div className="flex items-start gap-4 p-4">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full bg-[rgb(37_99_235/0.1)] flex items-center justify-center flex-shrink-0">
          <User className="h-8 w-8 text-[rgb(37_99_235)]" />
        </div>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-semibold truncate">{patient.name}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[rgb(37_99_235/0.1)] text-[rgb(37_99_235)]">
              ID: {patient.id}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{patient.dob} ({patient.age} years)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{patient.address}</span>
            </div>
          </div>
        </div>

        {/* Status Tags */}
        <div className="flex flex-col gap-2">
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-[rgb(37_99_235/0.1)] text-[rgb(37_99_235)]">
            {patient.gender}
          </span>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        </div>
      </div>
    </Card>
  )
}
