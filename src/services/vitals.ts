const OPENEHR_BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1';

export interface VitalsData {
  [key: string]: unknown;
  uid: string;
  start_time: string;
  category: {
    terminology: string;
    code: string;
    value: string;
  };
  setting: {
    code: string;
    value: string;
    terminology: string;
  };
  pulse: {
    rate: number;
    units: string;
  };
  blood_pressure: {
    systolic: {
      magnitude: number;
      units: string;
    };
    diastolic: {
      magnitude: number;
      units: string;
    };
  };
  spo2: {
    numerator: number;
    denominator: number;
  };
  body_weight: {
    magnitude: number;
    units: string;
  };
  height: {
    magnitude: number;
    units: string;
  };
  language: {
    terminology: string;
    code: string;
  };
  territory: {
    code: string;
    terminology: string;
  };
  composer_name: string;
}

interface OpenEhrQuantity {
  units: string;
  magnitude: number;
}

interface OpenEhrProportion {
  numerator: number;
  denominator: number;
  type: number;
}

interface OpenEhrCodePhrase {
  terminology_id: {
    value: string;
  };
  code_string: string;
}

interface OpenEhrDvText {
  value: string;
}

interface OpenEhrDvCodedText extends OpenEhrDvText {
  defining_code: OpenEhrCodePhrase;
}

interface OpenEhrElement {
  name: OpenEhrDvText;
  value: OpenEhrQuantity | OpenEhrProportion;
  archetype_node_id: string;
}

interface OpenEhrItemTree {
  name: OpenEhrDvText;
  items: OpenEhrElement[];
  archetype_node_id: string;
}

interface OpenEhrEvent {
  name: OpenEhrDvText;
  time: {
    value: string;
  };
  data: OpenEhrItemTree;
  archetype_node_id: string;
}

interface OpenEhrData {
  name: OpenEhrDvText;
  origin: {
    value: string;
  };
  events: OpenEhrEvent[];
  archetype_node_id: string;
}

interface OpenEhrObservation {
  name: OpenEhrDvText;
  archetype_details: {
    archetype_id: {
      value: string;
    };
    rm_version: string;
  };
  data: OpenEhrData;
  archetype_node_id: string;
}

interface OpenEhrComposition {
  uid: {
    value: string;
  };
  name: OpenEhrDvText;
  archetype_details: {
    archetype_id: {
      value: string;
    };
    template_id: {
      value: string;
    };
    rm_version: string;
  };
  language: OpenEhrCodePhrase;
  territory: OpenEhrCodePhrase;
  category: OpenEhrDvCodedText;
  composer: {
    name: string;
  };
  context: {
    start_time: {
      value: string;
    };
    setting: OpenEhrDvCodedText;
  };
  content: OpenEhrObservation[];
  archetype_node_id: string;
}

export interface VitalsComposition {
  [key: string]: unknown;
  templateId?: string;
}

export interface VitalsResponse extends VitalsData {
  [key: string]: unknown;
}

export async function deleteVitalsComposition(ehrId: string, uid: string) {
  const response = await fetch(
    `${OPENEHR_BASE_URL}/ehr/${ehrId}/composition/${uid}`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete vitals composition');
  }
}

export async function saveVitalsComposition(ehrId: string, composition: VitalsComposition) {
  const response = await fetch(
    `${OPENEHR_BASE_URL}/ehr/${ehrId}/composition?templateId=jitendra.choudhary.vitals.v1`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/openehr.wt.flat.schema+json',
        'Content-Type': 'application/openehr.wt.flat.schema+json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(composition)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to save vitals composition');
  }

  const data = await response.json();
  console.log('Response data:', data);
  return data;
}

export async function getVitalsCompositions(ehrId: string) {
  const aql = `
    SELECT c 
    FROM EHR e 
    CONTAINS COMPOSITION c 
    WHERE e/ehr_id/value = '${ehrId}' 
    AND c/archetype_details/template_id/value = 'jitendra.choudhary.vitals.v1'
  `;

  const response = await fetch(
    `${OPENEHR_BASE_URL}/query/aql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ q: aql })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch vitals compositions');
  }

  const data = await response.json();
  console.log('Vitals data:', data);
  return data.rows?.map(([composition]: [OpenEhrComposition]) => {
    const pulseObs = composition.content.find(c => c.name.value === 'Pulse');
    const bpObs = composition.content.find(c => c.name.value === 'Blood pressure');
    const spo2Obs = composition.content.find(c => c.name.value === 'Pulse oximetry');
    const weightObs = composition.content.find(c => c.name.value === 'Body weight');
    const heightObs = composition.content.find(c => c.name.value === 'Height');

    const pulseRate = pulseObs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'Pulse rate')?.value as OpenEhrQuantity;
    const systolic = bpObs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'Systolic')?.value as OpenEhrQuantity;
    const diastolic = bpObs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'Diastolic')?.value as OpenEhrQuantity;
    const spo2 = spo2Obs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'SpO₂')?.value as OpenEhrProportion;
    const weight = weightObs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'Weight')?.value as OpenEhrQuantity;
    const height = heightObs?.data?.events?.[0]?.data?.items?.find(i => i.name.value === 'Height')?.value as OpenEhrQuantity;

    return {
      uid: composition.uid.value,
      start_time: composition.context.start_time.value,
      category: {
        terminology: composition.category.defining_code.terminology_id.value,
        code: composition.category.defining_code.code_string,
        value: composition.category.value
      },
      setting: {
        code: composition.context.setting.defining_code.code_string,
        value: composition.context.setting.value,
        terminology: composition.context.setting.defining_code.terminology_id.value
      },
      pulse: pulseRate ? {
        rate: pulseRate.magnitude,
        units: pulseRate.units
      } : undefined,
      blood_pressure: (systolic && diastolic) ? {
        systolic: {
          magnitude: systolic.magnitude,
          units: systolic.units
        },
        diastolic: {
          magnitude: diastolic.magnitude,
          units: diastolic.units
        }
      } : undefined,
      spo2: spo2 ? {
        numerator: spo2.numerator,
        denominator: spo2.denominator
      } : undefined,
      body_weight: weight ? {
        magnitude: weight.magnitude,
        units: weight.units
      } : undefined,
      height: height ? {
        magnitude: height.magnitude,
        units: height.units
      } : undefined,
      language: {
        terminology: composition.language.terminology_id.value,
        code: composition.language.code_string
      },
      territory: {
        code: composition.territory.code_string,
        terminology: composition.territory.terminology_id.value
      },
      composer_name: composition.composer.name
    };
  }) || [];
}
