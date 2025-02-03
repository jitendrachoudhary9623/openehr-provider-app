import { createBrowserRouter } from "react-router-dom"
import { Dashboard } from "@/pages/dashboard"
import { PatientList } from "@/components/pages/patient-list"
import { NewPatient } from "@/components/pages/new-patient"
import { EditPatient } from "@/pages/edit-patient"
import { Appointments } from "@/pages/appointments"
import { MedicalRecords } from "@/pages/medical-records"
import { Prescriptions } from "@/pages/prescriptions"
import { Analytics } from "@/pages/analytics"
import App from "@/App"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/patients",
        element: <PatientList />,
      },
      {
        path: "/patients/new",
        element: <NewPatient />,
      },
      {
        path: "/patients/:id/edit",
        element: <EditPatient />,
      },
      {
        path: "/appointments",
        element: <Appointments />,
      },
      {
        path: "/medical-records",
        element: <MedicalRecords />,
      },
      {
        path: "/prescriptions",
        element: <Prescriptions />,
      },
      {
        path: "/analytics",
        element: <Analytics />,
      },
    ],
  },
])

export const routes = {
  dashboard: {
    path: "/",
    name: "Dashboard",
  },
  patients: {
    path: "/patients",
    name: "Patients",
  },
  newPatient: {
    path: "/patients/new",
    name: "New Patient",
  },
  editPatient: {
    path: "/patients/:id/edit",
    name: "Edit Patient",
  },
  appointments: {
    path: "/appointments",
    name: "Appointments",
  },
  medicalRecords: {
    path: "/medical-records",
    name: "Medical Records",
  },
  prescriptions: {
    path: "/prescriptions",
    name: "Prescriptions",
  },
  analytics: {
    path: "/analytics",
    name: "Analytics",
  },
}
