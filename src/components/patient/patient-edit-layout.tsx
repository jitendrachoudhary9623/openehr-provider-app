import { useState } from "react"
import type { VitalsResponse, VitalsComposition } from "@/services/vitals"
import { PatientBanner } from "./patient-banner"
import { PatientEditSidebar } from "./patient-edit-sidebar"
import { VitalsForm } from "../vitals/vitals-form"
import { VitalsList } from "../vitals/vitals-list"
import { VitalsDashboard } from "../vitals/vitals-dashboard"
import { Card } from "@/components/ui/card"

interface PatientEditLayoutProps {
  patient: {
    name: string
    id: string
    dob: string
    phone: string
    address: string
    gender: string
    age: number
  }
  vitalsTemplate?: Record<string, unknown>
  vitalsData?: VitalsResponse[]
  onSaveVitals?: (data: VitalsComposition | undefined) => void
  onDeleteVitals?: (data: VitalsResponse) => void
}

export function PatientEditLayout({
  patient,
  vitalsTemplate,
  vitalsData,
  onSaveVitals,
  onDeleteVitals
}: PatientEditLayoutProps) {
  const [activeSection, setActiveSection] = useState("vitals")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedVitals, setSelectedVitals] = useState<VitalsResponse>()

  const renderContent = () => {
    switch (activeSection) {
      case "vitals":
        return (
          <div className="container max-w-full space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <VitalsForm
                template={vitalsTemplate}
                initialData={selectedVitals}
                onSave={(data) => {
                  onSaveVitals?.(data)
                  setSelectedVitals(undefined)
                }}
              />
              <VitalsList
                compositions={vitalsData || []}
                onEdit={setSelectedVitals}
                onDelete={onDeleteVitals}
              />
            </div>
          </div>
        )
      case "dashboard":
        return (
          <div className="container max-w-full space-y-6">
            <VitalsDashboard
              compositions={vitalsData || []}
              isLoading={false}
            />
          </div>
        )
      case "demographics":
      case "history":
      case "allergies":
      case "medications":
      case "documents":
      case "notes":
      case "preferences":
        return (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-muted-foreground">
              This section is under development.
            </p>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Patient Banner */}
      <div className="p-4 border-b">
        <PatientBanner patient={patient} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="h-[calc(100vh-13.5rem)]">
          <PatientEditSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onToggle={setSidebarOpen}
          />
        </div>

        {/* Content */}
        <div
          className={`flex-1 py-6 transition-all duration-300 ${
            sidebarOpen ? "ml-56" : "ml-16"
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
