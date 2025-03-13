import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type VitalsResponse } from "@/services/vitals";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VitalsDashboardProps {
  compositions: VitalsResponse[];
  isLoading: boolean;
  allCompositions?: VitalsResponse[];
  showAllData?: boolean;
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
  showAllData = false
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Vitals</TabsTrigger>
            <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
            <TabsTrigger value="pulse">Pulse Rate</TabsTrigger>
            <TabsTrigger value="spo2">SpO2</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="body">Height & Weight</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-4">
          {viewMode === "chart" && (
            <Select value={chartType} onValueChange={(value) => setChartType(value as "line" | "bar" | "area")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "chart" | "table")}>
            <TabsList>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

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
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
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
