import type { VitalsResponse } from "@/services/vitals";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowUpDown, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
type SortField = 'date' | 'bp' | 'pulse' | 'spo2' | 'weight' | 'height';
type SortOrder = 'asc' | 'desc';

interface VitalsListProps {
  compositions: VitalsResponse[];
  onEdit?: (composition: VitalsResponse) => void;
  onDelete?: (composition: VitalsResponse) => void;
  isLoading?: boolean;
}

export function VitalsList({ compositions, onEdit, onDelete, isLoading }: VitalsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getTrend = (current: number, prev: number | undefined) => {
    if (!prev) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current > prev) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < prev) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const sortedAndFilteredCompositions = useMemo(() => {
    let filtered = compositions;
    
    // Apply search filter
    if (searchTerm) {
      filtered = compositions.filter(comp => {
        const searchStr = searchTerm.toLowerCase();
        return (
          formatDateTime(comp.start_time).toLowerCase().includes(searchStr) ||
          comp.blood_pressure?.systolic.magnitude.toString().includes(searchStr) ||
          comp.blood_pressure?.diastolic.magnitude.toString().includes(searchStr) ||
          comp.pulse?.rate.toString().includes(searchStr) ||
          comp.spo2?.numerator.toString().includes(searchStr) ||
          comp.body_weight?.magnitude.toString().includes(searchStr) ||
          comp.height?.magnitude.toString().includes(searchStr)
        );
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return (new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) * order;
        case 'bp':
          return ((a.blood_pressure?.systolic.magnitude || 0) - (b.blood_pressure?.systolic.magnitude || 0)) * order;
        case 'pulse':
          return ((a.pulse?.rate || 0) - (b.pulse?.rate || 0)) * order;
        case 'spo2':
          return ((a.spo2?.numerator || 0) - (b.spo2?.numerator || 0)) * order;
        case 'weight':
          return ((a.body_weight?.magnitude || 0) - (b.body_weight?.magnitude || 0)) * order;
        case 'height':
          return ((a.height?.magnitude || 0) - (b.height?.magnitude || 0)) * order;
        default:
          return 0;
      }
    });
  }, [compositions, searchTerm, sortField, sortOrder]);

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) {
      return <Badge variant="destructive">High</Badge>;
    }
    if (systolic <= 90 || diastolic <= 60) {
      return <Badge variant="secondary">Low</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const getSpo2Status = (spo2: number) => {
    if (spo2 < 95) {
      return <Badge variant="destructive">Low</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals History</CardTitle>
        <CardDescription>Previous vital sign recordings</CardDescription>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vitals records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('date')} className="h-8 px-2">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('bp')} className="h-8 px-2">
                  Blood Pressure (mmHg)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('pulse')} className="h-8 px-2">
                  Pulse Rate (/min)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('spo2')} className="h-8 px-2">
                  SpO2 (%)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('weight')} className="h-8 px-2">
                  Weight (kg)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('height')} className="h-8 px-2">
                  Height (cm)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
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
            ) : sortedAndFilteredCompositions.map((composition, index) => {
              const prevComposition = sortedAndFilteredCompositions[index + 1];
              return (
                <TableRow key={composition.uid}>
                  <TableCell>{formatDateTime(composition.start_time)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {composition.blood_pressure ? (
                        <>
                          <span>{`${composition.blood_pressure.systolic.magnitude}/${composition.blood_pressure.diastolic.magnitude}`}</span>
                          {getBPStatus(
                            composition.blood_pressure.systolic.magnitude,
                            composition.blood_pressure.diastolic.magnitude
                          )}
                          {getTrend(
                            composition.blood_pressure.systolic.magnitude,
                            prevComposition?.blood_pressure?.systolic.magnitude
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {composition.pulse ? (
                        <>
                          <span>{composition.pulse.rate}</span>
                          {getTrend(
                            composition.pulse.rate,
                            prevComposition?.pulse?.rate
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {composition.spo2 ? (
                        <>
                          <span>{`${(composition.spo2.numerator / composition.spo2.denominator * 100).toFixed(0)}`}</span>
                          {getSpo2Status(composition.spo2.numerator / composition.spo2.denominator * 100)}
                          {getTrend(
                            composition.spo2.numerator,
                            prevComposition?.spo2?.numerator
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {composition.body_weight ? (
                        <>
                          <span>{composition.body_weight.magnitude}</span>
                          {getTrend(
                            composition.body_weight.magnitude,
                            prevComposition?.body_weight?.magnitude
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {composition.height ? (
                        <>
                          <span>{composition.height.magnitude}</span>
                          {getTrend(
                            composition.height.magnitude,
                            prevComposition?.height?.magnitude
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
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
              );
            })}
            {!isLoading && sortedAndFilteredCompositions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm ? 'No matching records found' : 'No vitals recorded'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
