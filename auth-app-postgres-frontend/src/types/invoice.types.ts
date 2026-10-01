import type { Account } from './account.types';
import type { Customer } from './customer.types';

export interface Invoice {
  id?: number;
  invoiceId: number;
  createdAt: string;
  totalPrice: number;
  noTaxTotalPrice: number;
  totalDiscountPrice: number;
  noTaxTotalDiscountPrice: number;
  totalTaxPrice: number;
  lastPaymentDate: string;
  billingPeriod: number;
  accountId?: number;
  account?: Account;
  customer?: Customer;
}

export interface AccountInvoice {
  id?: number;
  billingPeriod: number;
  price: number;
  discount: number;
  totalPrice: number;
  lastPaymentDate: string;
}
