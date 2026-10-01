import type {
  BatchJobStatus,
  BatchJobType,
  CustomerEnum,
  DiscountEnum,
  StatusEnum,
  UserRole,
} from '../types';

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₺0,00';
  }
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateOnly = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getStatusLabel = (status: StatusEnum): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif';
    case 'PASSIVE':
      return 'Pasif';
    case 'CLOSED':
      return 'Kapalı';
    case 'CANCELED':
      return 'İptal Edildi';
    default:
      return status;
  }
};

export const getStatusColorClass = (status: StatusEnum): string => {
  switch (status) {
    case 'ACTIVE':
      return 'badge-success';
    case 'PASSIVE':
      return 'badge-warning';
    case 'CLOSED':
      return 'badge-secondary';
    case 'CANCELED':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

export const getCustomerTypeLabel = (type: CustomerEnum): string => {
  switch (type) {
    case 'INDIVIDUAL':
      return 'Bireysel';
    case 'CORPORATE':
      return 'Kurumsal';
    default:
      return type;
  }
};

export const getDiscountTypeLabel = (type: DiscountEnum): string => {
  switch (type) {
    case 'PERCENTAGE':
      return 'Yüzde (%)';
    case 'FIXED':
      return 'Sabit Fiyat';
    case 'TL':
      return 'Tutar İndirimi (TL)';
    default:
      return type;
  }
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'ROLE_TELEKOM':
      return 'Telekom Yöneticisi';
    case 'ROLE_CALL_CENTER':
      return 'Çağrı Merkezi';
    default:
      return role;
  }
};

export const getBatchStatusLabel = (status: BatchJobStatus): string => {
  switch (status) {
    case 'QUEUED':
      return 'Kuyrukta';
    case 'PROCESSING':
      return 'İşleniyor';
    case 'COMPLETED':
      return 'Tamamlandı';
    case 'FAILED':
      return 'Başarısız';
    default:
      return status;
  }
};

export const getBatchStatusColorClass = (status: BatchJobStatus): string => {
  switch (status) {
    case 'QUEUED':
      return 'badge-warning';
    case 'PROCESSING':
      return 'badge-info';
    case 'COMPLETED':
      return 'badge-success';
    case 'FAILED':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

export const getBatchTypeLabel = (type: BatchJobType): string => {
  switch (type) {
    case 'CUSTOMER_BATCH':
      return 'Müşteri Toplu İçe Aktarım';
    case 'INVOICE_BATCH':
      return 'Fatura Kesim Batch';
    default:
      return type;
  }
};
