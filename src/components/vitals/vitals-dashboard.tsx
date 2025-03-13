import { useState, useMemo } from "react";
import type { VitalsResponse } from "@/services/vitals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface VitalsDashboardProps {
  compositions: VitalsResponse[];
  isLoading?: boolean;
}

type VitalType = "blood_pressure" | "pulse" | "spo2" | "body_weight" | "height" | "all";
type TimeRange = "all" | "week" | "month" | "year";

export function VitalsDashboard({ compositions, isLoading }: VitalsDashboardProps) {
  const [selectedVital, setSelectedVital] = useState<VitalType>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const formatDateTime = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredData = useMemo(() => {
    if (!compositions.length) return [];

    let filtered = [...compositions];

    // Apply time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (comp) => new Date(comp.start_time) >= cutoffDate
      );
    }

    // Sort by date (oldest to newest)
    return filtered.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [compositions, timeRange]);

  const chartData = useMemo(() => {
    return filteredData.map((comp) => ({
      date: formatDateTime(comp.start_time),
      timestamp: new Date(comp.start_time).getTime(),
      systolic: comp.blood_pressure?.systolic.magnitude,
      diastolic: comp.blood_pressure?.diastolic.magnitude,
      pulse: comp.pulse?.rate,
      spo2: comp.spo2 ? (comp.spo2.numerator / comp.spo2.denominator) * 100 : undefined,
      weight: comp.body_weight?.magnitude,
      height: comp.height?.magnitude,
    }));
  }, [filteredData]);

  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return null;
    
    if (systolic >= 140 || diastolic >= 90) {
      return <Badge variant="destructive">High</Badge>;
    }
    if (systolic <= 90 || diastolic <= 60) {
      return <Badge variant="secondary">Low</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const getSpo2Status = (spo2?: number) => {
    if (!spo2) return null;
    
    if (spo2 < 95) {
      return <Badge variant="destructive">Low</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const getPulseStatus = (pulse?: number) => {
    if (!pulse) return null;
    
    if (pulse > 100) {
      return <Badge variant="destructive">High</Badge>;
    }
    if (pulse < 60) {
      return <Badge variant="secondary">Low</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const getLatestVitals = () => {
    if (!compositions.length) return null;
    
    // Sort by date (newest first)
    const sorted = [...compositions].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
    
    return sorted[0];
  };

  const latestVitals = getLatestVitals();

  const renderVitalChart = (vitalType: VitalType) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No vitals data available
        </div>
      );
    }

    switch (vitalType) {
      case "blood_pressure":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                yAxisId="left"
                domain={[60, 180]} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                label={{ value: 'mmHg', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} mmHg`, 
                  name === "systolic" ? "Systolic" : "Diastolic"
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="systolic"
                name="Systolic"
                stroke="#ef4444"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="diastolic"
                name="Diastolic"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pulse":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={[40, 120]} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                label={{ value: 'bpm', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value) => [`${value} bpm`, "Pulse Rate"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="pulse"
                name="Pulse Rate"
                stroke="#8b5cf6"
                fill="#8b5cf680"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "spo2":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={[90, 100]} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                label={{ value: '%', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, "SpO2"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="spo2"
                name="SpO2"
                stroke="#10b981"
                fill="#10b98180"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "body_weight":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value) => [`${value} kg`, "Weight"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#f59e0b"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "height":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                label={{ value: 'cm', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value) => [`${value} cm`, "Height"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="height"
                name="Height"
                stroke="#6366f1"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "all":
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Blood Pressure Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[60, 180]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pulse Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[40, 120]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="pulse"
                      name="Pulse"
                      stroke="#8b5cf6"
                      fill="#8b5cf680"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">SpO2 Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="spo2"
                      name="SpO2"
                      stroke="#10b981"
                      fill="#10b98180"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weight & Height Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      name="Weight (kg)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="height"
                      name="Height (cm)"
                      stroke="#6366f1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Card className="hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Blood Pressure
                {getBPStatus(
                  latestVitals?.blood_pressure?.systolic.magnitude,
                  latestVitals?.blood_pressure?.diastolic.magnitude
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                {latestVitals?.blood_pressure
                  ? `${latestVitals.blood_pressure.systolic.magnitude}/${latestVitals.blood_pressure.diastolic.magnitude} mmHg`
                  : "No data"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {latestVitals?.start_time
                  ? `Last recorded: ${new Date(latestVitals.start_time).toLocaleDateString()}`
                  : "No records"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                SpO2
                {getSpo2Status(
                  latestVitals?.spo2
                    ? (latestVitals.spo2.numerator / latestVitals.spo2.denominator) * 100
                    : undefined
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                {latestVitals?.spo2
                  ? `${((latestVitals.spo2.numerator / latestVitals.spo2.denominator) * 100).toFixed(0)}%`
                  : "No data"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {latestVitals?.start_time
                  ? `Last recorded: ${new Date(latestVitals.start_time).toLocaleDateString()}`
                  : "No records"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Pulse Rate
                {getPulseStatus(latestVitals?.pulse?.rate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold group-hover:text-[rgb(37_99_235/var(--tw-bg-opacity,1))] transition-colors">
                {latestVitals?.pulse ? `${latestVitals.pulse.rate} bpm` : "No data"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {latestVitals?.start_time
                  ? `Last recorded: ${new Date(latestVitals.start_time).toLocaleDateString()}`
                  : "No records"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Vitals Dashboard</CardTitle>
              <CardDescription>
                Visualize patient vital signs over time
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label htmlFor="vital-select">Vital Sign</Label>
                <Select
                  value={selectedVital}
                  onValueChange={(value) => setSelectedVital(value as VitalType)}
                >
                  <SelectTrigger id="vital-select" className="w-[180px]">
                    <SelectValue placeholder="Select vital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vitals</SelectItem>
                    <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                    <SelectItem value="pulse">Pulse Rate</SelectItem>
                    <SelectItem value="spo2">SpO2</SelectItem>
                    <SelectItem value="body_weight">Weight</SelectItem>
                    <SelectItem value="height">Height</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-select">Time Range</Label>
                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as TimeRange)}
                >
                  <SelectTrigger id="time-select" className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="space-y-4">
              {renderVitalChart(selectedVital)}
            </TabsContent>
            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        Blood Pressure
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        Pulse Rate
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        SpO2
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        Weight
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                        Height
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        </td>
                      </tr>
                    ) : chartData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                          No vitals data available
                        </td>
                      </tr>
                    ) : (
                      chartData.map((data, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {new Date(data.timestamp).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {data.systolic && data.diastolic
                              ? `${data.systolic}/${data.diastolic} mmHg`
                              : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {data.pulse ? `${data.pulse} bpm` : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {data.spo2 ? `${data.spo2.toFixed(0)}%` : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {data.weight ? `${data.weight} kg` : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {data.height ? `${data.height} cm` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
