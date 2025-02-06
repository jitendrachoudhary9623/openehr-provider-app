import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRef, useEffect } from "react"
import type { MbAutoFormElement, CompositionData } from "@/types/mb-auto-form"
import { useToast } from "@/hooks/use-toast"
interface VitalsFormProps {
  onSave?: (composition: CompositionData) => void;
  template: any;
  initialData?: CompositionData;
  title?: string;
  description?: string;
}

export function VitalsForm({ onSave, template, initialData, title = "Record Vitals", description = "Enter patient vital signs" }: VitalsFormProps) {
  const { toast } = useToast()
  const formRef = useRef<MbAutoFormElement>(null)

  useEffect(() => {
    if (formRef.current && initialData) {
      formRef.current.setAttribute('data', JSON.stringify(initialData));
    }
  }, [initialData]);

  const handleSaveVitals = async () => {
    try {
      if (formRef.current) {
        const composition: CompositionData = formRef.current.export();
        console.log("Vitals Data:", composition);
        
        // Call onSave if provided
        if (onSave) {
          onSave(composition);
        }
        
        toast({
          title: "Success",
          description: "Vitals recorded successfully",
        });
      }
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast({
        title: "Error",
        description: "Failed to save vitals. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="w-full">
            <mb-auto-form 
              ref={formRef}
              webTemplate={JSON.stringify(template)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveVitals}>
              Save Vitals
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
