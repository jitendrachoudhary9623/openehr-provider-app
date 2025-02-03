import { Bell, Search, Menu } from "lucide-react"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { ThemeProvider } from "./components/theme-provider"
import { Sidebar } from "./components/sidebar"
import { useState } from "react"
import { X } from "lucide-react"
import { useTabStore } from "./store/use-tabs"
import { Outlet, useNavigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { tabs, activeTab, removeTab, setActiveTab } = useTabStore()

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setActiveTab(tabId)
      navigate(tab.path)
    }
  }

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) return // Don't close the last tab
    
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    const currentIndex = tabs.findIndex(t => t.id === tabId)
    const newTab = tabs[currentIndex - 1] || tabs[currentIndex + 1]
    
    if (newTab) {
      setActiveTab(newTab.id)
      navigate(newTab.path)
    }
    
    removeTab(tabId)
  }

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex min-h-screen bg-background">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 z-30 h-screen">
          <Sidebar onToggle={setSidebarOpen} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 min-h-screen ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
          <div className="flex flex-col min-h-screen">
            {/* Fixed Header */}
            <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search patients, records, or documents..." 
                      className="pl-8 bg-background/60 focus:bg-background"
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

              {/* Tabs */}
              <div className="border-t">
                <div className="container flex max-w-full items-center gap-2 px-4 py-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <div
                      key={tab.id}
                      className={`group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 cursor-pointer ${
                        activeTab === tab.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleTabClick(tab.id)}
                    >
                      {tab.title}
                      {tabs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloseTab(tab.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
