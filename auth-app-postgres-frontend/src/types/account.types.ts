import type { StatusEnum } from './common.types';
import type { Customer } from './customer.types';

export interface Account {
  id?: number;
  accountId: number;
  accountName: string;
  status: StatusEnum;
  createdDate: string;
  updatedAt: string;
  customer?: Customer;
}

export interface AccountCreateRequest {
  customer: {
    customerId: number;
  };
}
