import type {
  AccountCreateRequest,
  CustomerCreatePayload,
  CustomerDto,
  CustomerEnum,
  DiscountCreateRequest,
  DiscountEnum,
  DiscountUpdateRequest,
  ProductDiscountCreateRequest,
  ProductDiscountUpdateRequest,
  ProductTariffCreateRequest,
  ProductTariffUpdateRequest,
  StatusEnum,
  TariffCreateRequest,
  TariffUpdateRequest,
} from '../types';

export interface CustomerFormData {
  customerName: string;
  customerLastName: string;
  customerType: CustomerEnum;
  tckn?: string;
  vkn?: string;
}

export const buildCustomerCreateRequest = (data: CustomerFormData): CustomerDto => {
  const name = data.customerName.trim();
  const lastName = data.customerLastName.trim();

  let customerPayload: CustomerCreatePayload;

  if (data.customerType === 'INDIVIDUAL') {
    customerPayload = {
      customerName: name,
      customerLastName: lastName,
      customerType: 'INDIVIDUAL',
      tckn: data.tckn ? data.tckn.trim() : null,
      vkn: null,
    };
  } else {
    customerPayload = {
      customerName: name,
      customerLastName: lastName,
      customerType: 'CORPORATE',
      tckn: null,
      vkn: data.vkn ? data.vkn.trim() : null,
    };
  }

  return {
    customer: customerPayload,
  };
};

export const buildAccountCreateRequest = (customerId: number): AccountCreateRequest => {
  return {
    customer: {
      customerId: Number(customerId),
    },
  };
};

export const buildTariffCreateRequest = (data: {
  tariffName: string;
  tariffPrice: number | string;
  validityStartDate: string;
  validityEndDate: string;
  status?: StatusEnum | null;
}): TariffCreateRequest => {
  return {
    tariffName: data.tariffName.trim(),
    tariffPrice: Number(data.tariffPrice),
    validityStartDate: data.validityStartDate,
    validityEndDate: data.validityEndDate,
    status: data.status ?? null,
  };
};

export const buildTariffUpdateRequest = (data: {
  tariffName: string;
  tariffPrice: number | string;
  validityStartDate: string;
  validityEndDate: string;
  status: StatusEnum;
}): TariffUpdateRequest => {
  return {
    tariffName: data.tariffName.trim(),
    tariffPrice: Number(data.tariffPrice),
    validityStartDate: data.validityStartDate,
    validityEndDate: data.validityEndDate,
    status: data.status,
  };
};

export const buildDiscountCreateRequest = (data: {
  discountName: string;
  discountType: DiscountEnum;
  discountPrice: number | string;
  validityStartDate: string;
  validityEndDate: string;
  status?: StatusEnum | null;
}): DiscountCreateRequest => {
  return {
    discountName: data.discountName.trim(),
    discountType: data.discountType,
    discountPrice: Number(data.discountPrice),
    validityStartDate: data.validityStartDate,
    validityEndDate: data.validityEndDate,
    status: data.status ?? null,
  };
};

export const buildDiscountUpdateRequest = (data: {
  discountName: string;
  discountType: DiscountEnum;
  discountPrice: number | string;
  validityStartDate: string;
  validityEndDate: string;
  status: StatusEnum;
}): DiscountUpdateRequest => {
  return {
    discountName: data.discountName.trim(),
    discountType: data.discountType,
    discountPrice: Number(data.discountPrice),
    validityStartDate: data.validityStartDate,
    validityEndDate: data.validityEndDate,
    status: data.status,
  };
};

export const buildProductTariffCreateRequest = (data: {
  productId: number;
  tariffId: number;
  startDate: string;
  endDate: string;
  status?: StatusEnum | null;
}): ProductTariffCreateRequest => {
  return {
    product: {
      productId: Number(data.productId),
    },
    tariff: {
      tariffId: Number(data.tariffId),
    },
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status ?? null,
  };
};

export const buildProductTariffUpdateRequest = (data: {
  productId: number;
  tariffId: number;
  startDate: string;
  endDate: string;
  status: StatusEnum;
}): ProductTariffUpdateRequest => {
  return {
    product: {
      productId: Number(data.productId),
    },
    tariff: {
      tariffId: Number(data.tariffId),
    },
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
  };
};

export const buildProductDiscountCreateRequest = (data: {
  productId: number;
  discountId: number;
  startDate: string;
  endDate: string;
  status?: StatusEnum | null;
}): ProductDiscountCreateRequest => {
  return {
    product: {
      productId: Number(data.productId),
    },
    discount: {
      discountId: Number(data.discountId),
    },
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status ?? null,
  };
};

export const buildProductDiscountUpdateRequest = (data: {
  productId: number;
  discountId: number;
  startDate: string;
  endDate: string;
  status: StatusEnum;
}): ProductDiscountUpdateRequest => {
  return {
    product: {
      productId: Number(data.productId),
    },
    discount: {
      discountId: Number(data.discountId),
    },
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
  };
};
