export interface Esp {
  internal_id: number
  public_id: string
  mac_address: string
  device_status: string
  is_active: boolean
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EspRequest {
  mac_address: string
}