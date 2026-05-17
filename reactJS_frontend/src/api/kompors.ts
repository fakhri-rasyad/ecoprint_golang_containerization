import api from './axios'
import type { ApiResponse } from '../types/response'
import type { Kompor, KomporRequest } from '../types/kompor'

export const getKompors = async (): Promise<ApiResponse<Kompor[]>> => {
  const response = await api.get<ApiResponse<Kompor[]>>('/api/v1/kompors')
  return response.data
}

export const getKomporById = async (id: string): Promise<ApiResponse<Kompor>> => {
  const response = await api.get<ApiResponse<Kompor>>(`/api/v1/kompors/${id}`)
  return response.data
}

export const createKompor = async (data: KomporRequest): Promise<ApiResponse<Kompor>> => {
  const response = await api.post<ApiResponse<Kompor>>('/api/v1/kompors', data)
  return response.data
}

export const deleteKompor = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/api/v1/kompors/${id}`)
  return response.data
}