export interface Kompor {
  internal_id: number
  public_id: string
  kompor_name: string
  is_active: boolean
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface KomporRequest {
  kompor_name: string
}