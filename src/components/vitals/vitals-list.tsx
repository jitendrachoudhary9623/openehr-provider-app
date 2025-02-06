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
  compositions: any[];
  onSelect?: (composition: any) => void;
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
              <TableHead>Blood Pressure</TableHead>
              <TableHead>Heart Rate</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Respiratory Rate</TableHead>
              <TableHead>SpO2</TableHead>
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
                <TableCell>{formatDateTime(composition?.time || '')}</TableCell>
                <TableCell>{composition?.['Blood Pressure'] || '-'}</TableCell>
                <TableCell>{composition?.['Heart Rate'] || '-'}</TableCell>
                <TableCell>{composition?.['Temperature'] || '-'}</TableCell>
                <TableCell>{composition?.['Respiratory Rate'] || '-'}</TableCell>
                <TableCell>{composition?.['SpO2'] || '-'}</TableCell>
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
