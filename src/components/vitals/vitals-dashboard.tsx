import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type VitalsResponse } from "@/services/vitals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    value: any;
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
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // Determine which data set to use based on the toggle
  const dataToUse = showAllData && allCompositions ? allCompositions : compositions;
  
  // Debug log to check data
  useEffect(() => {
    if (showAllData && allCompositions) {
      console.log("All compositions data:", allCompositions);
      console.log("Templates in all compositions:", [...new Set(allCompositions.map(comp => comp.templateId))]);
    }
  }, [showAllData, allCompositions]);

  useEffect(() => {
    if (dataToUse.length === 0) return;

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
    setChartData(data.reverse());
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

  if (compositions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Vitals Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No vitals records found for this patient. Add vitals data from the Vitals tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "chart" | "table")}>
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </Tabs>
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
                    {activeTab === "all" || activeTab === "blood-pressure" ? (
                      <>
                        <TableHead>Systolic</TableHead>
                        <TableHead>Diastolic</TableHead>
                      </>
                    ) : null}
                    {activeTab === "all" || activeTab === "pulse" ? (
                      <TableHead>Pulse Rate</TableHead>
                    ) : null}
                    {activeTab === "all" || activeTab === "spo2" ? (
                      <TableHead>SpO2</TableHead>
                    ) : null}
                    {activeTab === "all" || activeTab === "temperature" ? (
                      <TableHead>Temperature</TableHead>
                    ) : null}
                    {activeTab === "all" || activeTab === "body" ? (
                      <>
                        <TableHead>Height</TableHead>
                        <TableHead>Weight</TableHead>
                      </>
                    ) : null}
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
                      {activeTab === "all" || activeTab === "blood-pressure" ? (
                        <>
                          <TableCell>{item.systolic ? `${item.systolic} mmHg` : '-'}</TableCell>
                          <TableCell>{item.diastolic ? `${item.diastolic} mmHg` : '-'}</TableCell>
                        </>
                      ) : null}
                      {activeTab === "all" || activeTab === "pulse" ? (
                        <TableCell>{item.pulse ? `${item.pulse} bpm` : '-'}</TableCell>
                      ) : null}
                      {activeTab === "all" || activeTab === "spo2" ? (
                        <TableCell>{item.spo2 ? `${item.spo2}%` : '-'}</TableCell>
                      ) : null}
                      {activeTab === "all" || activeTab === "temperature" ? (
                        <TableCell>{item.temperature ? `${item.temperature} °C` : '-'}</TableCell>
                      ) : null}
                      {activeTab === "all" || activeTab === "body" ? (
                        <>
                          <TableCell>{item.height ? `${item.height} cm` : '-'}</TableCell>
                          <TableCell>{item.weight ? `${item.weight} kg` : '-'}</TableCell>
                        </>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "chart" && (
        <>
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
          </TabsContent>

          <TabsContent value="pulse">
            <Card>
              <CardHeader>
                <CardTitle>Pulse Rate Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="pulse" stroke="#f97316" name="Pulse Rate (bpm)" strokeWidth={2} />
                  </LineChart>
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
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2 %" strokeWidth={2} />
                  </LineChart>
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
          </TabsContent>

          <TabsContent value="body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Height Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="height" stroke="#0ea5e9" name="Height (cm)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weight Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#f43f5e" name="Weight (kg)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </>
      )}
    </div>
  );
}
