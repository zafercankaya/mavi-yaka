export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
