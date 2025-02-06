import type { VitalsResponse } from "@/services/vitals";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
  onEdit?: (composition: VitalsResponse) => void;
  onDelete?: (composition: VitalsResponse) => void;
  isLoading?: boolean;
}

export function VitalsList({ compositions, onEdit, onDelete, isLoading }: VitalsListProps) {
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
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : compositions.map((composition, index) => (
              <TableRow key={index}>
                <TableCell>{formatDateTime(composition.start_time)}</TableCell>
                <TableCell>{composition.blood_pressure ? `${composition.blood_pressure.systolic.magnitude}/${composition.blood_pressure.diastolic.magnitude}` : '-'}</TableCell>
                <TableCell>{composition.pulse ? composition.pulse.rate : '-'}</TableCell>
                <TableCell>{composition.spo2 ? `${(composition.spo2.numerator / composition.spo2.denominator * 100).toFixed(0)}` : '-'}</TableCell>
                <TableCell>{composition.body_weight ? composition.body_weight.magnitude : '-'}</TableCell>
                <TableCell>{composition.height ? composition.height.magnitude : '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(composition)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(composition);
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && compositions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
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
