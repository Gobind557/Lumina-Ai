import { API_BASE } from '@/shared/constants'

/**
 * API client (fetch wrapper with auth). Use for all backend requests.
 */
type ApiOptions = RequestInit & {
  auth?: boolean
}

const getAuthToken = () => {
  const token = localStorage.getItem('auth_token')
  return token?.trim() || ''
}

/** Build full request URL: use API_BASE when it's an absolute URL (e.g. production backend). */
function requestUrl(path: string): string {
  if (path.startsWith('http')) return path
  if (API_BASE.startsWith('http')) {
    const base = API_BASE.replace(/\/+$/, '')
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
  }
  return path
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (options.auth !== false) {
    const token = getAuthToken()
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
  }

  const url = requestUrl(path)
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error((errorBody as { error?: { message?: string } })?.error?.message || 'API request failed')
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
