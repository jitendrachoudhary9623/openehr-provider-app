const OPENEHR_BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1';

export interface Template {
  templateId: string;
  name: string;
  description?: string;
  source?: 'local' | 'api';
}

// Import all local templates
import exampleTemplate from "@/templates/example.json";
import gynaecTemplate from "@/templates/gynaec_case_record_jitendra.v0.json";

// Define a type for the template structure
interface RawTemplate {
  templateId: string;
  name?: string;
  concept?: string;
  description?: string;
  tree?: {
    id?: string;
    name?: string;
    localizedName?: string;
    localizedNames?: {
      [key: string]: string;
    };
  };
  [key: string]: unknown;
}

// Function to extract a human-readable name from a template
function extractTemplateName(template: RawTemplate): string {
  // Try to extract a name from the template structure
  // First check if there's a 'name' property directly in the template
  if (template.name && typeof template.name === 'string') {
    return template.name;
  }
  
  // Check if there's a concept property (common in openEHR templates)
  if (template.concept && typeof template.concept === 'string') {
    return template.concept;
  }
  
  // Check if there's a tree with a name or localizedName
  if (template.tree) {
    // Check if there are localizedNames in English
    if (template.tree.localizedNames && template.tree.localizedNames['en']) {
      // Try to clean up the name if it's the same as the ID
      const enName = template.tree.localizedNames['en'];
      if (enName !== template.templateId) {
        return enName;
      }
    }
    
    // Check for name or localizedName
    if (template.tree.name && typeof template.tree.name === 'string') {
      // Try to clean up the name if it's the same as the ID
      if (template.tree.name !== template.templateId) {
        return template.tree.name;
      }
    }
    
    if (template.tree.localizedName && typeof template.tree.localizedName === 'string') {
      // Try to clean up the name if it's the same as the ID
      if (template.tree.localizedName !== template.templateId) {
        return template.tree.localizedName;
      }
    }
    
    // If the tree has an ID that's different from the templateId, try to use that
    if (template.tree.id && typeof template.tree.id === 'string' && 
        template.tree.id !== template.templateId) {
      return template.tree.id;
    }
  }
  
  // If we can't find a good name, use the templateId with some formatting
  if (template.templateId) {
    // Convert from something like "jitendra.choudhary.vitals.v1" to "Vitals"
    const parts = template.templateId.split('.');
    // Find the part that's likely the actual name (not a version or author)
    const namePart = parts.find((p: string) => !p.startsWith('v') && p !== 'example' && !p.match(/^\d+$/));
    if (namePart) {
      // Capitalize the first letter
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return template.templateId;
  }
  
  return "Unknown Template";
}

// Function to get a user-friendly name for a template
function getFriendlyName(template: RawTemplate): string {
  const name = extractTemplateName(template);
  
  // If the name is the same as the templateId, try to make it more user-friendly
  if (name === template.templateId) {
    // For gynaec_case_record_jitendra.v0, return "Gynaecology Case Record"
    if (name.includes('gynaec_case_record')) {
      return "Gynaecology Case Record";
    }
    
    // For other templates, try to extract a meaningful name from the templateId
    const parts = name.split('_');
    return parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }
  
  return name;
}

// Function to get local templates
export function getLocalTemplates(): Template[] {
  // In a real application, you would dynamically import all templates from a directory
  // For now, we'll manually import the templates we know about
  const templates = [
    exampleTemplate,
    gynaecTemplate,
    // Add more imports here as needed
  ];
  
  // Convert the raw templates to our Template interface
  return templates.map(template => {
    const templateObj = template as RawTemplate;
    return {
      templateId: templateObj.templateId,
      name: getFriendlyName(templateObj),
      description: `Local template from src/templates directory`,
      source: 'local' as const
    };
  });
}

// Instructions for adding new templates:
/*
To add a new local template:
1. Place your template JSON file in the src/templates/ directory
2. Import it at the top of this file:
   import myNewTemplate from "@/templates/my-new-template.json";
3. Add it to the templates array in the getLocalTemplates function:
   const templates = [
     exampleTemplate,
     gynaecTemplate,
     myNewTemplate,
     // other templates...
   ];
*/

export async function getAvailableTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(
      `${OPENEHR_BASE_URL}/definition/template/adl1.4`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    const data = await response.json();
    
    // Transform the response into a more usable format
    return data.map((template: { template_id: string; concept: string; description?: string }) => ({
      templateId: template.template_id,
      name: template.concept,
      description: template.description,
      source: 'api' as const
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export interface TemplateDetails {
  [key: string]: unknown;
}

export async function getTemplateById(templateId: string): Promise<TemplateDetails> {
  try {
    const response = await fetch(
      `${OPENEHR_BASE_URL}/definition/template/adl1.4/${templateId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${templateId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw error;
  }
}

export interface WebTemplate {
  [key: string]: unknown;
}

export async function getTemplateWebTemplate(templateId: string): Promise<WebTemplate> {
  try {
    const response = await fetch(
      `${OPENEHR_BASE_URL}/definition/template/adl1.4/${templateId}/webtemplate`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch web template: ${templateId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching web template ${templateId}:`, error);
    throw error;
  }
}
