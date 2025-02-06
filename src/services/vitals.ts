const OPENEHR_BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1';

interface AqlResponse {
  rows: [string, string, number?, number?, number?, number?, number?, number?][];
  columns: { name: string; path: string }[];
}

export interface VitalsComposition {
  [key: string]: unknown;
  templateId?: string;
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
    SELECT 
      c/uid/value as uid,
      c/context/start_time/value as time,
      c/content[openEHR-EHR-OBSERVATION.blood_pressure.v2]/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as systolic,
      c/content[openEHR-EHR-OBSERVATION.blood_pressure.v2]/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as diastolic,
      c/content[openEHR-EHR-OBSERVATION.pulse.v2]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as heart_rate,
      c/content[openEHR-EHR-OBSERVATION.body_temperature.v2]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature,
      c/content[openEHR-EHR-OBSERVATION.respiration.v2]/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as respiratory_rate,
      c/content[openEHR-EHR-OBSERVATION.pulse_oximetry.v2]/data[at0001]/events[at0002]/data[at0003]/items[at0006]/value/numerator as spo2
    FROM EHR e
    CONTAINS COMPOSITION c[openEHR-EHR-COMPOSITION.encounter.v1]
    WHERE e/ehr_id/value = '${ehrId}'
    AND c/archetype_details/template_id/value = 'jitendra.choudhary.vitals.v1'
    ORDER BY c/context/start_time/value DESC
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
  return (data as AqlResponse).rows?.map(row => ({
    uid: row[0],
    time: row[1],
    'Blood Pressure': row[2] && row[3] ? `${row[2]}/${row[3]}` : '-',
    'Heart Rate': row[4] || '-',
    'Temperature': row[5] || '-',
    'Respiratory Rate': row[6] || '-',
    'SpO2': row[7] || '-'
  })) || [];
}
