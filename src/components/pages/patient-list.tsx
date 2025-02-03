"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../ui/data-table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Users, 
  Clock, 
  Filter, 
  Plus, 
  ArrowUpRightFromSquare,
  TrendingUp,
  Calendar,
  Activity,
  Stethoscope,
  UserCog,
  FileText,
  Search,
  Archive,
  ChevronDown
} from "lucide-react"
import { format } from "date-fns"
import { Input } from "../ui/input"

interface PatientListProps {
  onAddPatient: () => void
}

interface Patient {
  id: string
  name: string
  email: string
  image: string
  lastVisit: Date
  status: "Active" | "Inactive" | "Pending"
  condition: string
}

const data: Patient[] = [
  {
    id: "728ed52f",
    name: "John Smith",
    email: "john.smith@example.com",
    image: "https://ui-avatars.com/api/?name=John+Smith",
    lastVisit: new Date("2024-01-10"),
    status: "Active",
    condition: "Diabetes",
  },
  {
    id: "489e1d42",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    image: "https://ui-avatars.com/api/?name=Sarah+Johnson",
    lastVisit: new Date("2024-02-15"),
    status: "Active",
    condition: "Hypertension",
  },
  {
    id: "573c2b1a",
    name: "Michael Brown",
    email: "m.brown@example.com",
    image: "https://ui-avatars.com/api/?name=Michael+Brown",
    lastVisit: new Date("2024-01-28"),
    status: "Inactive",
    condition: "Arthritis",
  },
  {
    id: "934f8c6d",
    name: "Emily Davis",
    email: "emily.d@example.com",
    image: "https://ui-avatars.com/api/?name=Emily+Davis",
    lastVisit: new Date("2024-02-20"),
    status: "Pending",
    condition: "Asthma",
  },
  {
    id: "621a4e9b",
    name: "David Wilson",
    email: "d.wilson@example.com",
    image: "https://ui-avatars.com/api/?name=David+Wilson",
    lastVisit: new Date("2024-02-01"),
    status: "Active",
    condition: "Migraine",
  },
]

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Name
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.original.name.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-sm text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "condition",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Condition
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const condition = row.original.condition
      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            condition === "Diabetes" ? "bg-red-500/20" :
            condition === "Hypertension" ? "bg-orange-500/20" :
            condition === "Arthritis" ? "bg-blue-500/20" :
            condition === "Asthma" ? "bg-purple-500/20" :
            "bg-primary/20"
          }`} />
          <span className="font-medium">{condition}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "lastVisit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Last Visit
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{format(row.original.lastVisit, "MMM d, yyyy")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Status
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          className={`px-2 py-0.5 ${
            status === "Active"
              ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/20"
              : status === "Pending"
              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/20"
              : "bg-gray-50 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-500/20"
          }`}
        >
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${
              status === "Active"
                ? "bg-green-500"
                : status === "Pending"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`} />
            {status}
          </div>
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2">
              <ArrowUpRightFromSquare className="h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Visit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FileText className="h-4 w-4" />
              View Records
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
              <Archive className="h-4 w-4" />
              Archive Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PatientList({ onAddPatient }: PatientListProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header Section with Quick Actions */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
            <p className="text-muted-foreground">
              Manage and monitor your patient records efficiently
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 shadow-sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button 
              className="gap-2 shadow-sm bg-primary hover:bg-primary/90"
              onClick={onAddPatient}
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Schedule Visit", color: "text-blue-500" },
            { icon: FileText, label: "New Prescription", color: "text-green-500" },
            { icon: Stethoscope, label: "Start Checkup", color: "text-purple-500" },
            { icon: UserCog, label: "Patient Settings", color: "text-orange-500" },
          ].map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors"
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <Badge variant="secondary" className="text-xs">+12.5%</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">1,234</p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <Badge variant="secondary" className="text-xs">+5.2%</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">892</p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Recent Visits</p>
                <Badge variant="secondary" className="text-xs">Today</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">48</p>
                <span className="text-sm text-muted-foreground">visits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Table */}
      <div className="rounded-xl border bg-card shadow-sm space-y-4">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search patients..." 
                className="pl-8 bg-muted/50 focus:bg-muted"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
