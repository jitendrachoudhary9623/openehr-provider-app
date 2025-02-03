import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import {
  Users,
  Calendar,
  Settings,
  BarChart,
  FileText,
  Moon,
  Sun,
  Laptop,
  Home,
  PlusCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { routes } from "@/lib/routes"
import { useTabStore } from "@/store/use-tabs"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onToggle?: (isOpen: boolean) => void
}

export function Sidebar({ className, onToggle }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { addTab, hasTab } = useTabStore()

  const handleToggle = () => {
    setCollapsed(!collapsed)
    onToggle?.(collapsed)
  }

  const handleNavigation = (path: string, name: string) => {
    if (!hasTab(path)) {
      addTab({
        id: path,
        title: name,
        path: path,
      })
    }
    navigate(path)
  }

  const navigation = [
    { name: "Dashboard", icon: Home, path: routes.dashboard.path },
    { name: "Patients", icon: Users, path: routes.patients.path },
    { name: "Appointments", icon: Calendar, path: routes.appointments.path },
    { name: "Medical Records", icon: FileText, path: routes.medicalRecords.path },
    { name: "Prescriptions", icon: ClipboardList, path: routes.prescriptions.path },
    { name: "Analytics", icon: BarChart, path: routes.analytics.path },
  ]

  return (
    <div className={cn(
      "relative flex flex-col h-screen transition-all duration-300 bg-background border-r border-border/40",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Logo Section */}
      <div className="flex items-center h-14 px-4 border-b border-border/40 bg-background/95">
        <div className="flex items-center gap-2 w-full">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
          <h2 className={cn(
            "text-lg font-semibold tracking-tight transition-opacity duration-300",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            MediCare Pro
          </h2>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 h-10",
                location.pathname === item.path ? "bg-primary/10 hover:bg-primary/15" : "",
                collapsed ? "px-3" : "px-3"
              )}
              onClick={() => handleNavigation(item.path, item.name)}
            >
              <item.icon className={cn(
                "h-5 w-5",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "transition-opacity duration-300",
                collapsed ? "opacity-0 w-0" : "opacity-100"
              )}>
                {item.name}
              </span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Settings Section */}
      <div className="border-t border-border/40 p-4">
        <div className="space-y-1">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-10",
            collapsed ? "px-3" : "px-3"
          )}>
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className={cn(
              "transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              Settings
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-2 h-10",
                collapsed ? "px-3" : "px-3"
              )}>
                {theme === "light" ? (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                ) : theme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Laptop className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(
                  "transition-opacity duration-300",
                  collapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  Theme
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={collapsed ? "center" : "start"}
              className="w-[180px]"
            >
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 rounded-full border shadow-md bg-background hover:bg-accent"
        onClick={handleToggle}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
