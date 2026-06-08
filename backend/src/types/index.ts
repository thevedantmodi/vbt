export interface PlaidItem {
  accessToken: string;
  itemId: string;
}

export interface ApiError {
  error_code: string;
  error_message: string;
  error_type: string;
  status_code?: number;
}
