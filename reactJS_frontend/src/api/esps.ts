import api from './axios'
import type { ApiResponse } from '../types/response'
import type { Esp, EspRequest } from '../types/esp'

export const getEsps = async (): Promise<ApiResponse<Esp[]>> => {
  const response = await api.get<ApiResponse<Esp[]>>('/api/v1/esps')
  return response.data
}

export const getEspById = async (id: string): Promise<ApiResponse<Esp>> => {
  const response = await api.get<ApiResponse<Esp>>(`/api/v1/esps/${id}`)
  return response.data
}

export const createEsp = async (data: EspRequest): Promise<ApiResponse<Esp>> => {
  const response = await api.post<ApiResponse<Esp>>('/api/v1/esps', data)
  return response.data
}

export const deleteEsp = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/api/v1/esps/${id}`)
  return response.data
}