import type { StatusEnum } from './common.types';
import type { Tariff } from './tariff.types';
import type { Discount } from './discount.types';
import type { Account } from './account.types';

export interface Product {
  id?: number;
  productId: number;
  status: StatusEnum;
  createdAt: string;
  updatedAt: string;
  accountId?: number;
  account?: Account;
}

export interface ProductRef {
  productId: number;
}

export interface TariffRef {
  tariffId: number;
  validityStartDate?: string;
  validityEndDate?: string;
}

export interface DiscountRef {
  discountId: number;
  validityStartDate?: string;
  validityEndDate?: string;
}

export interface ProductTariff {
  id?: number;
  productTariffId: number;
  product: Product;
  tariff: Tariff;
  startDate: string;
  endDate: string;
  status: StatusEnum;
  updatedAt?: string;
}

export interface ProductDiscount {
  id?: number;
  productDiscountId: number;
  product: Product;
  discount: Discount;
  startDate: string;
  endDate: string;
  status: StatusEnum;
  updatedAt?: string;
}

export interface ProductTariffCreateRequest {
  product: ProductRef;
  tariff: TariffRef;
  startDate: string;
  endDate: string;
  status?: StatusEnum | null;
}

export interface ProductTariffUpdateRequest {
  product: ProductRef;
  tariff: TariffRef;
  startDate: string;
  endDate: string;
  status?: StatusEnum;
}

export interface ProductDiscountCreateRequest {
  product: ProductRef;
  discount: DiscountRef;
  startDate: string;
  endDate: string;
  status?: StatusEnum | null;
}

export interface ProductDiscountUpdateRequest {
  product: ProductRef;
  discount: DiscountRef;
  startDate: string;
  endDate: string;
  status?: StatusEnum;
}
