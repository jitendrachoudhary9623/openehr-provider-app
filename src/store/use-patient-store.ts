import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createEhr } from '@/services/openehr'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  gender: string
  bloodGroup: string
  maritalStatus: string
  address: string
  medicalConditions: string
  medications: string
  allergies: string
  surgeries: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  ehrId?: string
}

interface PatientState {
  patients: Patient[]
  addPatient: (patient: Omit<Patient, "id">) => Promise<string>
  updatePatient: (id: string, patient: Partial<Patient>) => void
  deletePatient: (id: string) => void
  getPatientById: (id: string) => Patient | undefined
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      addPatient: async (patient) => {
        try {
          // Create EHR record first
          const ehrResponse = await createEhr()
          const ehrId = ehrResponse.ehr_id.value

          const id = crypto.randomUUID()
          set((state) => ({
            patients: [...state.patients, { ...patient, id, ehrId }],
          }))
          return id
        } catch (error) {
          console.error('Failed to create EHR:', error)
          throw error
        }
      },
      updatePatient: (id, updatedPatient) => {
        set((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === id ? { ...patient, ...updatedPatient } : patient
          ),
        }))
      },
      deletePatient: (id) => {
        set((state) => ({
          patients: state.patients.filter((patient) => patient.id !== id),
        }))
      },
      getPatientById: (id) => {
        return get().patients.find((patient) => patient.id === id)
      },
    }),
    {
      name: 'patient-storage',
    }
  )
)

// Add some sample data if the store is empty
if (usePatientStore.getState().patients.length === 0) {
  const samplePatients: Omit<Patient, "id" | "ehrId">[] = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      dob: "1990-01-01",
      gender: "male",
      bloodGroup: "a+",
      maritalStatus: "married",
      address: "123 Main St, New York, NY 10001",
      medicalConditions: "Hypertension, Type 2 Diabetes",
      medications: "Metformin 500mg twice daily, Lisinopril 10mg daily",
      allergies: "Penicillin",
      surgeries: "Appendectomy (2015)",
      emergencyContact: {
        name: "Jane Smith",
        phone: "+1 (555) 987-6543",
        relationship: "Spouse"
      }
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 234-5678",
      dob: "1985-03-15",
      gender: "female",
      bloodGroup: "o+",
      maritalStatus: "single",
      address: "456 Park Ave, New York, NY 10002",
      medicalConditions: "Asthma",
      medications: "Albuterol inhaler as needed",
      allergies: "None",
      surgeries: "None",
      emergencyContact: {
        name: "Robert Johnson",
        phone: "+1 (555) 876-5432",
        relationship: "Father"
      }
    }
  ]

  // Create EHR records for sample patients
  samplePatients.forEach(async (patient) => {
    try {
      await usePatientStore.getState().addPatient(patient)
    } catch (error) {
      console.error('Failed to create sample patient:', error)
    }
  })
}
