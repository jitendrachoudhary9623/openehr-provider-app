import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type VitalsResponse } from "@/services/vitals";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
// Removed unused imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TemplateSelector } from "@/components/vitals/template-selector";

interface VitalsDashboardProps {
  compositions: VitalsResponse[];
  isLoading: boolean;
  allCompositions?: VitalsResponse[];
  showAllData?: boolean;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

type ChartDataItem = {
  date: string;
  patientId?: string;
  templateId?: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  spo2?: string;
  temperature?: number;
  height?: number;
  weight?: number;
  uid?: string;
  start_time?: string;
};

// Custom tooltip component to display templateId
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: unknown;
    payload: ChartDataItem;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded p-2 shadow-md">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        {data.patientId && (
          <p className="text-xs text-muted-foreground mt-1">
            Patient ID: {data.patientId}
          </p>
        )}
        {data.templateId && (
          <p className="text-xs text-muted-foreground">
            Template ID: {data.templateId}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function VitalsDashboard({ 
  compositions, 
  isLoading,
  allCompositions,
  showAllData = false,
  selectedTemplate,
  onTemplateChange
}: VitalsDashboardProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // Determine which data set to use based on the toggle
  const dataToUse = showAllData && allCompositions ? allCompositions : compositions;
  
  // Debug log to check data
  useEffect(() => {
    if (showAllData && allCompositions) {
      console.log("All compositions data:", allCompositions);
      console.log("Templates in all compositions:", [...new Set(allCompositions.map(comp => comp.templateId))]);
    }
    console.log("Chart data:", chartData);
    console.log("Data to use:", dataToUse);
  }, [showAllData, allCompositions, chartData, dataToUse]);

  useEffect(() => {
    // Add some dummy data for testing
    const dummyData: ChartDataItem[] = [
      {
        uid: "dummy1",
        start_time: "2023-01-01T10:00:00",
        date: "1/1/2023",
        patientId: "123",
        templateId: "test.template.v1",
        systolic: 120,
        diastolic: 80,
        pulse: 72,
        spo2: "98",
        temperature: 36.6,
        height: 175,
        weight: 70
      },
      {
        uid: "dummy2",
        start_time: "2023-01-02T10:00:00",
        date: "1/2/2023",
        patientId: "123",
        templateId: "test.template.v1",
        systolic: 122,
        diastolic: 82,
        pulse: 74,
        spo2: "97",
        temperature: 36.7,
        height: 175,
        weight: 70.5
      },
      {
        uid: "dummy3",
        start_time: "2023-01-03T10:00:00",
        date: "1/3/2023",
        patientId: "123",
        templateId: "test.template.v2",
        systolic: 118,
        diastolic: 78,
        pulse: 70,
        spo2: "99",
        temperature: 36.5,
        height: 175,
        weight: 69.5
      }
    ];
    
    if (dataToUse.length === 0) {
      console.log("Using dummy data for testing");
      setChartData(dummyData);
      return;
    }

    // Transform compositions into chart data
    const data = dataToUse.map(comp => {
      const date = new Date(comp.start_time).toLocaleDateString();
      
      // Safely access nested properties with type guards
      let systolic: number | undefined = undefined;
      let diastolic: number | undefined = undefined;
      
      if (comp.blood_pressure && typeof comp.blood_pressure === 'object') {
        if (comp.blood_pressure.systolic && typeof comp.blood_pressure.systolic === 'object' && 
            'magnitude' in comp.blood_pressure.systolic) {
          systolic = comp.blood_pressure.systolic.magnitude as number;
        }
        
        if (comp.blood_pressure.diastolic && typeof comp.blood_pressure.diastolic === 'object' && 
            'magnitude' in comp.blood_pressure.diastolic) {
          diastolic = comp.blood_pressure.diastolic.magnitude as number;
        }
      }
      
      return {
        uid: comp.uid,
        start_time: comp.start_time,
        date,
        patientId: comp.patient_id ? String(comp.patient_id) : 'Unknown',
        templateId: comp.templateId || 'Unknown',
        systolic,
        diastolic,
        pulse: comp.pulse?.rate,
        spo2: comp.spo2 ? (comp.spo2.numerator / comp.spo2.denominator * 100).toFixed(0) : undefined,
        temperature: comp.temperature?.magnitude,
        height: comp.height?.magnitude,
        weight: comp.body_weight?.magnitude,
      };
    });

    // Sort by date (oldest to newest)
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.start_time || '').getTime();
      const dateB = new Date(b.start_time || '').getTime();
      return dateA - dateB;
    });
    
    console.log("Sorted chart data:", sortedData);
    setChartData(sortedData);
  }, [dataToUse]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Always show the dashboard, even if there's no real data
  // We'll use dummy data in that case

  // Render the chart based on the selected chart type
  const renderChart = (
    dataKey: string, 
    stroke: string, 
    name: string, 
    yAxisId?: string,
    domain?: [number, number] | [string, string]
  ) => {
    if (chartType === "line") {
      return (
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          name={name} 
          strokeWidth={2}
          yAxisId={yAxisId} 
        />
      );
    } else if (chartType === "bar") {
      return <Bar dataKey={dataKey} fill={stroke} name={name} yAxisId={yAxisId} />;
    } else if (chartType === "area") {
      return (
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          fill={`${stroke}33`} 
          name={name}
          yAxisId={yAxisId}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 shadow-lg border-t-4 border-t-primary">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Vitals Dashboard</h3>
              <p className="text-sm text-muted-foreground">Monitor patient vitals data and trends over time</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  All Vitals
                </TabsTrigger>
                <TabsTrigger value="blood-pressure" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-pulse"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4 .5-1h6.78"/></svg>
                  BP
                </TabsTrigger>
                <TabsTrigger value="pulse" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Pulse
                </TabsTrigger>
                <TabsTrigger value="spo2" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lungs"><path d="M6.081 20c-2.163-.573-4.35-1.184-5.376-3.691A5.5 5.5 0 0 1 2.81 8.373C3.922 6.087 6.083 5.074 8.5 4.5"/><path d="M17.92 20c2.164-.573 4.35-1.184 5.376-3.691a5.5 5.5 0 0 0-2.105-7.936c-1.112-2.286-3.273-3.3-5.69-3.873"/><path d="M8.5 4.5V4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v.5"/><path d="M8.5 9v11"/><path d="M15.5 9v11"/></svg>
                  SpO2
                </TabsTrigger>
                <TabsTrigger value="temperature" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thermometer"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
                  Temp
                </TabsTrigger>
                <TabsTrigger value="body" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ruler"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>
                  Body
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="w-full max-w-xs">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {!showAllData ? "Selected Template" : "Data Source"}
                </label>
                
                {!showAllData ? (
                  <TemplateSelector
                    value={selectedTemplate}
                    onChange={onTemplateChange}
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center p-3 border rounded-md bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
                    <Badge variant="secondary" className="mr-2 bg-primary/20 hover:bg-primary/30 text-primary font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers mr-1"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"/></svg>
                      Comprehensive View
                    </Badge>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">All Templates Combined</span>
                      <span className="text-xs text-muted-foreground">Displaying aggregated data across all templates</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode === "chart" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Chart Type</label>
                <div className="flex items-center gap-2">
                  <button 
                    className={`p-2 rounded-md flex items-center gap-1 ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={() => setChartType('line')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    <span className="text-sm">Line</span>
                  </button>
                  <button 
                    className={`p-2 rounded-md flex items-center gap-1 ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={() => setChartType('bar')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
                    <span className="text-sm">Bar</span>
                  </button>
                  <button 
                    className={`p-2 rounded-md flex items-center gap-1 ${chartType === 'area' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={() => setChartType('area')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M3 15 9 9l4 4 8-8"/><path d="m3 11 6-6 4 4 8-8"/></svg>
                    <span className="text-sm">Area</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">View Mode</label>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "chart" | "table")}>
                <TabsList>
                  <TabsTrigger value="chart" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                    Chart
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </Card>

      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Vitals Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Template</TableHead>
                    {(activeTab === "all" || activeTab === "blood-pressure") && (
                      <>
                        <TableHead>Systolic</TableHead>
                        <TableHead>Diastolic</TableHead>
                      </>
                    )}
                    {(activeTab === "all" || activeTab === "pulse") && (
                      <TableHead>Pulse Rate</TableHead>
                    )}
                    {(activeTab === "all" || activeTab === "spo2") && (
                      <TableHead>SpO2</TableHead>
                    )}
                    {(activeTab === "all" || activeTab === "temperature") && (
                      <TableHead>Temperature</TableHead>
                    )}
                    {(activeTab === "all" || activeTab === "body") && (
                      <>
                        <TableHead>Height</TableHead>
                        <TableHead>Weight</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item) => (
                    <TableRow key={item.uid}>
                      <TableCell>
                        {new Date(item.start_time || '').toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.templateId}</Badge>
                      </TableCell>
                      {(activeTab === "all" || activeTab === "blood-pressure") && (
                        <>
                          <TableCell>{item.systolic ? `${item.systolic} mmHg` : '-'}</TableCell>
                          <TableCell>{item.diastolic ? `${item.diastolic} mmHg` : '-'}</TableCell>
                        </>
                      )}
                      {(activeTab === "all" || activeTab === "pulse") && (
                        <TableCell>{item.pulse ? `${item.pulse} bpm` : '-'}</TableCell>
                      )}
                      {(activeTab === "all" || activeTab === "spo2") && (
                        <TableCell>{item.spo2 ? `${item.spo2}%` : '-'}</TableCell>
                      )}
                      {(activeTab === "all" || activeTab === "temperature") && (
                        <TableCell>{item.temperature ? `${item.temperature} °C` : '-'}</TableCell>
                      )}
                      {(activeTab === "all" || activeTab === "body") && (
                        <>
                          <TableCell>{item.height ? `${item.height} cm` : '-'}</TableCell>
                          <TableCell>{item.weight ? `${item.weight} kg` : '-'}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "chart" && (
        <Tabs value={activeTab} className="mt-4">
          <TabsContent value="all" className="space-y-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4 .5-1h6.78"/></svg>
                  Blood Pressure Trends
                </CardTitle>
                <p className="text-xs text-muted-foreground">Systolic and diastolic pressure over time</p>
              </CardHeader>
              <CardContent className="h-[400px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={2} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pulse Rate & SpO2</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[90, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="pulse" stroke="#f97316" name="Pulse Rate" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2 %" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Temperature</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#8b5cf6" name="Temperature °C" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blood-pressure">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" && (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={2} />
                    </LineChart>
                  )}
                  {chartType === "bar" && (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="systolic" fill="#ef4444" name="Systolic" />
                      <Bar dataKey="diastolic" fill="#3b82f6" name="Diastolic" />
                    </BarChart>
                  )}
                  {chartType === "area" && (
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="systolic" stroke="#ef4444" fill="#ef444433" name="Systolic" />
                      <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" fill="#3b82f633" name="Diastolic" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pulse">
            <Card>
              <CardHeader>
                <CardTitle>Pulse Rate Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" && (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="pulse" stroke="#f97316" name="Pulse Rate (bpm)" strokeWidth={2} />
                    </LineChart>
                  )}
                  {chartType === "bar" && (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="pulse" fill="#f97316" name="Pulse Rate (bpm)" />
                    </BarChart>
                  )}
                  {chartType === "area" && (
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="pulse" stroke="#f97316" fill="#f9731633" name="Pulse Rate (bpm)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spo2">
            <Card>
              <CardHeader>
                <CardTitle>SpO2 Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" && (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2 %" strokeWidth={2} />
                    </LineChart>
                  )}
                  {chartType === "bar" && (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="spo2" fill="#10b981" name="SpO2 %" />
                    </BarChart>
                  )}
                  {chartType === "area" && (
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="spo2" stroke="#10b981" fill="#10b98133" name="SpO2 %" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temperature">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" && (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#8b5cf6" name="Temperature °C" strokeWidth={2} />
                    </LineChart>
                  )}
                  {chartType === "bar" && (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="temperature" fill="#8b5cf6" name="Temperature °C" />
                    </BarChart>
                  )}
                  {chartType === "area" && (
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="temperature" stroke="#8b5cf6" fill="#8b5cf633" name="Temperature °C" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Height Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" && (
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="height" stroke="#0ea5e9" name="Height (cm)" strokeWidth={2} />
                      </LineChart>
                    )}
                    {chartType === "bar" && (
                      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="height" fill="#0ea5e9" name="Height (cm)" />
                      </BarChart>
                    )}
                    {chartType === "area" && (
                      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="height" stroke="#0ea5e9" fill="#0ea5e933" name="Height (cm)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weight Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" && (
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="weight" stroke="#f43f5e" name="Weight (kg)" strokeWidth={2} />
                      </LineChart>
                    )}
                    {chartType === "bar" && (
                      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="weight" fill="#f43f5e" name="Weight (kg)" />
                      </BarChart>
                    )}
                    {chartType === "area" && (
                      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="weight" stroke="#f43f5e" fill="#f43f5e33" name="Weight (kg)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
