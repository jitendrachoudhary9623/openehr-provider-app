import { Card } from "@/components/ui/card"
import { Activity, Users, Calendar, TrendingUp } from "lucide-react"

export function Dashboard() {
  const stats = [
    {
      title: "Total Patients",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Active Patients",
      value: "892",
      change: "+5.2%",
      icon: Activity,
      trend: "up",
    },
    {
      title: "Appointments Today",
      value: "48",
      change: "+8.1%",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Revenue",
      value: "$12,345",
      change: "+15.3%",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Dr. Smith
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="text-sm text-green-500">{stat.change}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
