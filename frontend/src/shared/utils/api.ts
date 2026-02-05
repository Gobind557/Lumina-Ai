type ApiOptions = RequestInit & {
  auth?: boolean
}

const getAuthToken = () => {
  const token = localStorage.getItem('auth_token')
  return token?.trim() || ''
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
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error?.message || 'API request failed')
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

