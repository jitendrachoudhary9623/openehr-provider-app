import { useState, useEffect } from "react";
import { Search, FileJson, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAvailableTemplates, getLocalTemplates, type Template } from "@/services/templates";
import { useToast } from "@/hooks/use-toast";

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TemplateSelector({ value, onChange, className = "" }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        
        // Get local templates
        const localTemplates = getLocalTemplates();
        
        // Get templates from API
        const apiTemplates = await getAvailableTemplates();
        
        // Filter out any API templates that match our local template IDs
        const localTemplateIds = localTemplates.map(t => t.templateId);
        const filteredApiTemplates = apiTemplates.filter(
          (t: Template) => !localTemplateIds.includes(t.templateId)
        );
        
        // Combine templates with local templates first
        let allTemplates = [...localTemplates, ...filteredApiTemplates];
        
        // Ensure jitendra.choudhary.vitals.v1 is first in the list
        allTemplates = allTemplates.sort((a, b) => {
          if (a.templateId === "jitendra.choudhary.vitals.v1") return -1;
          if (b.templateId === "jitendra.choudhary.vitals.v1") return 1;
          return 0;
        });
        setTemplates(allTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates from API. Using local templates only.",
          variant: "destructive",
        });
        
        // If API fails, still use the local templates
        setTemplates(getLocalTemplates());
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplateIcon = (template: Template) => {
    // Check if it's a local template
    if (template.source === 'local') {
      return <FileJson className="h-4 w-4 text-green-500" />;
    }
    // Otherwise it's from the API
    return <Database className="h-4 w-4 text-blue-500" />;
  };

  const getTemplateSourceBadge = (template: Template) => {
    if (template.source === 'local') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Local</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">API</Badge>;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="pl-8 pr-4"
        />
      </div>
      
      {isDropdownOpen && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            <ul className="py-1">
              {isLoading ? (
                <li className="px-3 py-2 text-sm text-center">Loading templates...</li>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <li 
                    key={template.templateId}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted ${
                      template.templateId === value ? 'bg-muted font-medium' : ''
                    }`}
                    onClick={() => {
                      onChange(template.templateId);
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon(template)}
                        <span className="font-medium">{template.name}</span>
                      </div>
                      {getTemplateSourceBadge(template)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">{template.templateId}</div>
                    {template.description && (
                      <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-center text-muted-foreground">
                  No templates found
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Display selected template */}
      {value && !isDropdownOpen && (
        <div className="mt-2 text-sm flex items-center gap-2">
          {templates.find(t => t.templateId === value) ? (
            <>
              {getTemplateIcon(templates.find(t => t.templateId === value)!)}
              <span className="font-medium">Selected: </span>
              <span>{templates.find(t => t.templateId === value)?.name || value}</span>
              {getTemplateSourceBadge(templates.find(t => t.templateId === value)!)}
            </>
          ) : (
            <>
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Selected: </span>
              <span>{value}</span>
            </>
          )}
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
