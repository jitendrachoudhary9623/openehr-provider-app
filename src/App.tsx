import { PatientList } from "./components/pages/patient-list"
import { Bell, Search, Menu } from "lucide-react"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { ThemeProvider } from "./components/theme-provider"
import { Sidebar } from "./components/sidebar"
import { useState } from "react"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex min-h-screen bg-background/95">
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 z-50 h-full md:relative md:block ${
          sidebarOpen ? "" : "hidden"
        }`}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Premium Navigation Bar */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-full items-center px-4">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 h-8 w-8 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Global Search */}
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative w-full max-w-[600px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search patients, records, or documents..." 
                    className="pl-8 w-full bg-background/60 focus:bg-background"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-background/80"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">Dr. Jane Smith</p>
                    <p className="text-xs text-muted-foreground">Cardiologist</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">JS</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <PatientList />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
