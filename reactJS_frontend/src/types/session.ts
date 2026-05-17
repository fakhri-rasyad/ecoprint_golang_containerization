export type FabricType = 'katun' | 'polyester' | 'linen' | 'sutra'

export interface CreateSessionRequest {
  esp_public_id: string
  fabric_type: FabricType
  kompor_public_id: string
}

export interface Session {
  public_id: string
  esp_id: number
  kompor_id: number
  fabric_type: string
  boiling_status: string
  finished_at: string
  created_at: string
  user_id: number
}

export interface SessionRecord {
  id: number
  session_id: string
  air_temp: number
  water_temp: number
  humidity: number
  created_at: string
}

export interface TelemetryMessage {
  air_temp: number
  water_temp: number
  humidity: number
}

export interface WsFinishedEvent {
  event: 'finished'
}

export type WsMessage = TelemetryMessage | WsFinishedEvent