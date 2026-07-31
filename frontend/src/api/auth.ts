import type { AuthToken } from '../types'
import { formBody, request } from './client'

export function devLogin(telephone: string) {
  return request<AuthToken>('/v1/login/dev/telephone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ telephone }),
  })
}

