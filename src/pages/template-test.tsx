import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRef } from "react"
import type { MbAutoFormElement, CompositionData } from "@/types/mb-auto-form"
import example from "../templates/example.json"
import { useToast } from "@/hooks/use-toast"
import "medblocks-ui"
import "medblocks-ui/dist/shoelace"

export function TemplateTest() {
  const { toast } = useToast()
  const formRef = useRef<MbAutoFormElement>(null);

  const handleSave = async () => {
    try {
      if (!formRef.current) {
        toast({
          title: "Error",
          description: "Please fill the form before saving",
          variant: "destructive",
        });
        return;
      }

      const composition: CompositionData = formRef.current.export();
      console.log("Form Data:", composition);
      
      toast({
        title: "Success",
        description: "Form data exported successfully. Check console for details.",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Template Test</h1>
        <p className="text-muted-foreground">
          Test OpenEHR templates and form rendering
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vitals Form</CardTitle>
          <CardDescription>Test form for recording vital signs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full">
              <mb-auto-form 
                ref={formRef}
                webTemplate={JSON.stringify(example)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSave}>
                  Save Form Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AQL Query</CardTitle>
          <CardDescription>Example query for vitals template</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
            {`SELECT c
FROM EHR e
CONTAINS COMPOSITION c[${example.templateId}]
WHERE e/ehr_id/value = '[EHR_ID]'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
