import type { ApiResponse, AuthToken } from '../types'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  code?: number

  constructor(message: string, code?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function authHeaders(auth?: AuthToken | null): Record<string, string> {
  if (!auth || auth.demo) return {}
  return {
    Authorization: `Bearer ${auth.token}`,
    uid: String(auth.uid),
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  auth?: AuthToken | null,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  Object.entries(authHeaders(auth)).forEach(([key, value]) => headers.set(key, value))

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  })

  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || payload.code !== 20000) {
    throw new ApiError(payload.message || payload.msg || '请求失败，请稍后重试', payload.code)
  }
  return payload.data
}

export function formBody(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value))
  })
  return params
}
