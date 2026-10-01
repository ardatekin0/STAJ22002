import type { CustomerEnum, StatusEnum } from './common.types';

export interface Customer {
  id?: number;
  customerId: number;
  customerName: string;
  customerLastName: string;
  customerType: CustomerEnum;
  tckn: string | null;
  vkn: string | null;
  status: StatusEnum;
  createdDate: string;
  updatedAt: string;
}

export interface CustomerCreateIndividualData {
  customerName: string;
  customerLastName: string;
  customerType: 'INDIVIDUAL';
  tckn: string | null;
  vkn: null;
}

export interface CustomerCreateCorporateData {
  customerName: string;
  customerLastName: string;
  customerType: 'CORPORATE';
  tckn: null;
  vkn: string | null;
}

export type CustomerCreatePayload = CustomerCreateIndividualData | CustomerCreateCorporateData;

export interface CustomerDto {
  customer: CustomerCreatePayload;
  accounts?: unknown[];
}
