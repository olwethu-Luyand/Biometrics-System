const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is missing from the frontend .env file.',
  )
}

interface ApiErrorResponse {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem('token')
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type')

  const data: unknown = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const errorData =
      typeof data === 'object' && data !== null
        ? (data as ApiErrorResponse)
        : null

    const validationMessage = errorData?.errors
      ? Object.values(errorData.errors).flat().join(' ')
      : null

    throw new Error(
      validationMessage ||
        errorData?.message ||
        errorData?.title ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}.`,
    )
  }

  return data as T
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint)
}

export function apiPost<TResponse, TBody>(
  endpoint: string,
  body: TBody,
): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiPut<TResponse, TBody>(
  endpoint: string,
  body?: TBody,
): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  })
}