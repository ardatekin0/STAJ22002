import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { RoleGuard } from '../components/guards/RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { AccountsPage } from '../pages/accounts/AccountsPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProductTariffsPage } from '../pages/productTariffs/ProductTariffsPage';
import { ProductDiscountsPage } from '../pages/productDiscounts/ProductDiscountsPage';
import { TariffsPage } from '../pages/tariffs/TariffsPage';
import { DiscountsPage } from '../pages/discounts/DiscountsPage';
import { InvoicesPage } from '../pages/invoices/InvoicesPage';
import { BatchPage } from '../pages/batch/BatchPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ForbiddenPage } from '../pages/errors/ForbiddenPage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/ana-sayfa" replace />} />
          <Route path="/ana-sayfa" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/ana-sayfa" replace />} />
          <Route path="/home" element={<Navigate to="/ana-sayfa" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product-tariffs" element={<ProductTariffsPage />} />
          <Route path="/product-discounts" element={<ProductDiscountsPage />} />
          <Route path="/tariffs" element={<TariffsPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleGuard allowedRoles={['ROLE_TELEKOM']} />}>
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/yetkisiz" element={<ForbiddenPage />} />
          <Route path="/unauthorized" element={<Navigate to="/yetkisiz" replace />} />
          <Route path="/403" element={<Navigate to="/yetkisiz" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
