export function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  const { protocol, hostname } = window.location

  if (hostname.endsWith('.app.github.dev')) {
    const mappedHostname = hostname.replace(/-\d+\.app\.github\.dev$/, '-5000.app.github.dev')
    return `${protocol}//${mappedHostname}`
  }

  return 'http://localhost:5000'
}

export const API_BASE_URL = resolveApiBaseUrl()

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.error || `API error: ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function fetchDirectionInfo(degree) {
  return requestJson('/api/fortune/direction', {
    method: 'POST',
    body: JSON.stringify({ degree }),
  })
}

export async function fetchElementStrength(zodiacList) {
  return requestJson('/api/fortune/strength', {
    method: 'POST',
    body: JSON.stringify({ zodiac_list: zodiacList }),
  })
}