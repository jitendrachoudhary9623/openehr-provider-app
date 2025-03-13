import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Activity,
  ClipboardList,
  FileText,
  Heart,
  History,
  User,
  UserCog,
  Pill,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"

interface PatientEditSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeSection: string
  onSectionChange: (section: string) => void
  onToggle?: (isOpen: boolean) => void
}

export function PatientEditSidebar({ 
  className, 
  activeSection,
  onSectionChange,
  onToggle 
}: PatientEditSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleToggle = () => {
    setCollapsed(!collapsed)
    onToggle?.(!collapsed)
  }

  const sections = [
    { id: "demographics", name: "Demographics", icon: User },
    { id: "vitals", name: "Vitals", icon: Activity },
    { id: "dashboard", name: "Dashboard", icon: TrendingUp },
    { id: "history", name: "Medical History", icon: History },
    { id: "allergies", name: "Allergies", icon: Heart },
    { id: "medications", name: "Medications", icon: Pill },
    { id: "documents", name: "Documents", icon: FileText },
    { id: "notes", name: "Clinical Notes", icon: ClipboardList },
    { id: "preferences", name: "Preferences", icon: UserCog },
  ]

  return (
    <div className={cn(
      "relative flex flex-col h-full transition-all duration-300 bg-[rgb(37_99_235/0.02)] border-r border-border/40",
      collapsed ? "w-16" : "w-56",
      className
    )}>
      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-1 px-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 h-10",
                activeSection === section.id ? "bg-[rgb(37_99_235/0.1)] hover:bg-[rgb(37_99_235/0.15)]" : "",
                collapsed ? "px-3" : "px-3"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <section.icon className={cn(
                "h-5 w-5",
                activeSection === section.id ? "text-[rgb(37_99_235)]" : "text-muted-foreground"
              )} />
              <span className={cn(
                "transition-opacity duration-300",
                collapsed ? "opacity-0 w-0" : "opacity-100"
              )}>
                {section.name}
              </span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full border shadow-md bg-background hover:bg-[rgb(37_99_235/0.1)]"
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
