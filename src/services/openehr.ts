const OPENEHR_BASE_URL = 'https://openehr-bootcamp.medblocks.com/ehrbase/rest/openehr/v1'

export interface EhrResponse {
  ehr_id: {
    value: string
  }
  system_id: {
    value: string
  }
  time_created: {
    value: string
  }
}

export interface Composition {
  archetype_node_id: string
  name: {
    value: string
  }
  archetype_details: {
    archetype_id: string
    template_id: string
    rm_version: string
  }
  language: {
    terminology_id: {
      value: string
    }
    code_string: string
  }
  territory: {
    terminology_id: {
      value: string
    }
    code_string: string
  }
  category: {
    value: string
    defining_code: {
      terminology_id: {
        value: string
      }
      code_string: string
    }
  }
  composer: {
    name: string
  }
  content: Record<string, unknown>[]
}

export async function createEhr(): Promise<EhrResponse> {
  const response = await fetch(`${OPENEHR_BASE_URL}/ehr`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to create EHR: ${response.statusText}`)
  }

  return response.json()
}

export async function getEhr(ehrId: string): Promise<EhrResponse> {
  const response = await fetch(`${OPENEHR_BASE_URL}/ehr/${ehrId}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get EHR: ${response.statusText}`)
  }

  return response.json()
}

export async function createComposition(ehrId: string, templateId: string, composition: Composition) {
  const response = await fetch(`${OPENEHR_BASE_URL}/composition`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      ehrId,
      templateId,
      composition
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create composition: ${response.statusText}`)
  }

  return response.json()
}

export async function getComposition(compositionId: string): Promise<Composition> {
  const response = await fetch(`${OPENEHR_BASE_URL}/composition/${compositionId}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get composition: ${response.statusText}`)
  }

  return response.json()
}
