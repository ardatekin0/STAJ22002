import React from 'react';
import type { BatchJobStatus, BatchJobType, CustomerEnum, DiscountEnum, StatusEnum, UserRole } from '../../types';
import {
  getCustomerTypeLabel,
  getDiscountTypeLabel,
  getRoleLabel,
  getStatusColorClass,
  getStatusLabel,
} from '../../utils/formatters';

export interface StatusBadgeProps {
  status: StatusEnum;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = getStatusColorClass(status);
  const label = getStatusLabel(status);

  return <span className={`badge ${colorClass}`}>{label}</span>;
};

export interface CustomerTypeBadgeProps {
  type: CustomerEnum;
}

export const CustomerTypeBadge: React.FC<CustomerTypeBadgeProps> = ({ type }) => {
  const isIndividual = type === 'INDIVIDUAL';
  return (
    <span className={`badge ${isIndividual ? 'badge-primary' : 'badge-info'}`}>
      {getCustomerTypeLabel(type)}
    </span>
  );
};

export interface DiscountTypeBadgeProps {
  type: DiscountEnum;
}

export const DiscountTypeBadge: React.FC<DiscountTypeBadgeProps> = ({ type }) => {
  return <span className="badge badge-secondary">{getDiscountTypeLabel(type)}</span>;
};

export interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const isTelekom = role === 'ROLE_TELEKOM';
  return (
    <span className={`badge ${isTelekom ? 'badge-primary' : 'badge-info'}`}>
      {getRoleLabel(role)}
    </span>
  );
};

export interface BatchStatusBadgeProps {
  status?: BatchJobStatus | null;
}

export const BatchStatusBadge: React.FC<BatchStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="badge badge-success">Tamamlandı</span>;
    case 'PROCESSING':
      return <span className="badge badge-warning">İşleniyor</span>;
    case 'FAILED':
      return <span className="badge badge-danger">Başarısız</span>;
    case 'QUEUED':
    default:
      return <span className="badge badge-neutral">Kuyrukta</span>;
  }
};

export interface BatchTypeBadgeProps {
  type?: BatchJobType | null;
}

export const BatchTypeBadge: React.FC<BatchTypeBadgeProps> = ({ type }) => {
  return <span className="badge badge-primary">{type || 'BATCH'}</span>;
};
