import { DOMAttributes, RefObject } from "react";

// OpenEHR Web Template type definition
interface WebTemplate {
  templateId: string;
  version: string;
  defaultLanguage: string;
  languages: string[];
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
    children: unknown[];
    cardinalities: unknown[];
  };
}

interface CompositionData {
  [key: string]: unknown;
}

type CSSProperties = {
  [key in keyof React.CSSProperties]: React.CSSProperties[key];
};

type CustomElement<T> = Partial<T & DOMAttributes<T> & { 
  children?: React.ReactNode;
  ref?: RefObject<T>;
  style?: CSSProperties;
}>;

interface MbAutoFormElement extends HTMLElement {
  webTemplate?: string;
  template?: WebTemplate;
  export(): CompositionData;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mb-auto-form": CustomElement<MbAutoFormElement>;
    }
  }
}

export type { WebTemplate, CompositionData, MbAutoFormElement };
