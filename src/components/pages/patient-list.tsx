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
import { MoreHorizontal, ArrowUpDown, Users, UserCheck, Clock, Filter, Plus, ArrowUpRightFromSquare } from "lucide-react"
import { format } from "date-fns"

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
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.condition}</span>
    ),
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          className={
            status === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30"
              : status === "Pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30"
          }
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
    cell: ({ row }) => {
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Schedule Visit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 gap-2">
              Archive Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PatientList() {
  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
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
          <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Patients</p>
              <p className="text-2xl font-bold">892</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent Visits</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
