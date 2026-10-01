import type { StatusEnum } from './common.types';

export interface Tariff {
  tariffId: number;
  tariffName: string;
  tariffPrice: number;
  tariffCode: number;
  status: StatusEnum;
  validityStartDate: string;
  validityEndDate: string;
  updatedAt?: string;
}

export interface TariffCreateRequest {
  tariffName: string;
  tariffPrice: number;
  validityStartDate: string;
  validityEndDate: string;
  status?: StatusEnum | null;
}

export interface TariffUpdateRequest {
  tariffName: string;
  tariffPrice: number;
  validityStartDate: string;
  validityEndDate: string;
  status: StatusEnum;
}
