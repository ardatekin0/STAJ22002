import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { hasAnyRole } = useAuth();

  const isAllowed = hasAnyRole(allowedRoles);

  if (!isAllowed) {
    return <Navigate to="/yetkisiz" replace />;
  }

  return <Outlet />;
};
