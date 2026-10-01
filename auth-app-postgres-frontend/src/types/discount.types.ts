import type { DiscountEnum, StatusEnum } from './common.types';

export interface Discount {
  discountId: number;
  discountName: string;
  discountCode: number;
  discountType: DiscountEnum;
  discountPrice: number;
  status: StatusEnum;
  validityStartDate: string;
  validityEndDate: string;
  updatedAt?: string;
}

export interface DiscountCreateRequest {
  discountName: string;
  discountType: DiscountEnum;
  discountPrice: number;
  validityStartDate: string;
  validityEndDate: string;
  status?: StatusEnum | null;
}

export interface DiscountUpdateRequest {
  discountName: string;
  discountType: DiscountEnum;
  discountPrice: number;
  validityStartDate: string;
  validityEndDate: string;
  status: StatusEnum;
}
