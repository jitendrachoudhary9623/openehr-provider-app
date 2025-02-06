const BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1/definition/template/adl1.4';

export interface WebTemplate {
  tree: {
    id: string;
    name: string;
    localizedName: string;
    rmType: string;
    nodeId: string;
    min: number;
    max: number;
    localizedNames: Record<string, string>;
    localizedDescriptions: Record<string, string>;
    aqlPath: string;
    children?: WebTemplate[];
    inputs?: unknown[];
  };
  meta: {
    href: string;
    templateId: string;
    created: string;
    generator: string;
  };
}

export interface Template {
  concept: string;
  template_id: string;
  archetype_id: string;
  created_timestamp: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await fetch(BASE_URL, {
    headers: {
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }

  const data = await response.json();
  return data.map((template: Template) => ({
    ...template,
    // Use concept as display name since it's more user-friendly
    name: template.concept
  }));
};

export const getWebTemplate = async (templateId: string): Promise<WebTemplate> => {
  const response = await fetch(`${BASE_URL}/${templateId}`, {
    headers: {
      'Accept': 'application/openehr.wt+json',
      'Prefer': 'return=representation'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch web template');
  }

  return response.json();
};
