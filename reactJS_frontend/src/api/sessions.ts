import { ApiResponse } from "../types/response";
import { CreateSessionRequest, Session, SessionRecord } from "../types/session";
import api from "./axios";

export const getSessions = async() : Promise<ApiResponse<Session[]>> => {
    const response = await api.get<ApiResponse<Session[]>>('/api/v1/sessions')
    return response.data
}

export const getSessionById = async(id: string) : Promise<ApiResponse<Session>> => {
    const response = await api.get<ApiResponse<Session>>(`/api/v1/sessions/${id}`)
    return response.data
}

export const getSessionRecords = async(id:string) : Promise<ApiResponse<SessionRecord[]>> => {
    const response = await api.get<ApiResponse<SessionRecord[]>>(`/api/v1/sessions/${id}/records`)
    return response.data
}

export const createSession = async(body: CreateSessionRequest) : Promise<ApiResponse<Session>> => {
    const response = await api.post<ApiResponse<Session>>(`/api/v1/sessions`, body)
    return response.data
}