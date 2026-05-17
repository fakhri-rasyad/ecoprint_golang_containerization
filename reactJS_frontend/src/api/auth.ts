import api from './axios'
import type { LoginRequest, RegisterRequest, AuthData } from '../types/auth'
import type { ApiResponse } from '../types/response'

export const login = async (data: LoginRequest): Promise<ApiResponse<AuthData>> => {
  const response = await api.post<ApiResponse<AuthData>>('/v1/auth/login', data)
  return response.data
}

export const register = async (data: RegisterRequest): Promise<ApiResponse<AuthData>> => {
  const response = await api.post<ApiResponse<AuthData>>('/v1/auth/register', data)
  return response.data
}