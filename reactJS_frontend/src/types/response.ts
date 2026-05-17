export interface ApiResponse<T> {
  Status: string
  StatusCode: number
  Message: string
  Data: T
  Error: string
}