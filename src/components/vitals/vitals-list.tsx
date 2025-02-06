import type { VitalsResponse } from "@/services/vitals"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
interface VitalsListProps {
  compositions: VitalsResponse[];
  onSelect?: (composition: VitalsResponse) => void;
  isLoading?: boolean;
}

export function VitalsList({ compositions, onSelect, isLoading }: VitalsListProps) {
  const formatDateTime = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals History</CardTitle>
        <CardDescription>Previous vital sign recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Blood Pressure (mmHg)</TableHead>
              <TableHead>Pulse Rate (/min)</TableHead>
              <TableHead>SpO2 (%)</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Height (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : compositions.map((composition, index) => (
              <TableRow 
                key={index}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect?.(composition)}
              >
                <TableCell>{formatDateTime(composition.start_time)}</TableCell>
                <TableCell>{composition.blood_pressure ? `${composition.blood_pressure.systolic.magnitude}/${composition.blood_pressure.diastolic.magnitude}` : '-'}</TableCell>
                <TableCell>{composition.pulse ? composition.pulse.rate : '-'}</TableCell>
                <TableCell>{composition.spo2 ? `${(composition.spo2.numerator / composition.spo2.denominator * 100).toFixed(0)}` : '-'}</TableCell>
                <TableCell>{composition.body_weight ? composition.body_weight.magnitude : '-'}</TableCell>
                <TableCell>{composition.height ? composition.height.magnitude : '-'}</TableCell>
              </TableRow>
            ))}
            {!isLoading && compositions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No vitals recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
