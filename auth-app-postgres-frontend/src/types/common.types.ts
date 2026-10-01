export type StatusEnum = 'ACTIVE' | 'PASSIVE' | 'CLOSED' | 'CANCELED';

export type CustomerEnum = 'INDIVIDUAL' | 'CORPORATE';

export type DiscountEnum = 'FIXED' | 'PERCENTAGE' | 'TL';

export type BatchJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type BatchJobType = 'CUSTOMER_BATCH' | 'INVOICE_BATCH';

export type UserRole = 'ROLE_TELEKOM' | 'ROLE_CALL_CENTER';

export interface GenericResponseDto {
  status: number;
  message: string;
}

export interface ApiErrorDetail {
  message: string;
  status?: number;
  validationErrors?: Record<string, string>;
}
