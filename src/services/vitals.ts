const OPENEHR_BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1';

export async function saveVitalsComposition(ehrId: string, composition: any) {
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
  const response = await fetch(
    `${OPENEHR_BASE_URL}/ehr/${ehrId}/composition?templateId=jitendra.choudhary.vitals.v1`,
    {
      headers: {
        'Accept': 'application/openehr.wt.flat.schema+json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch vitals compositions');
  }

  return response.json();
}
