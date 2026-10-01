import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  'ana-sayfa': 'Ana Sayfa',
  dashboard: 'Ana Sayfa',
  yetkisiz: 'Yetkisiz Erişim',
  customers: 'Müşteriler',
  accounts: 'Hesaplar',
  products: 'Ürünler',
  'product-tariffs': 'Ürün Tarifeleri',
  'product-discounts': 'Ürün İndirimleri',
  tariffs: 'Tarifeler',
  discounts: 'İndirimler',
  invoices: 'Faturalar',
  batch: 'Batch İşlemleri',
  roles: 'Kullanıcı & Rol Yönetimi',
  register: 'Yeni Kullanıcı Kaydı',
  profile: 'Profil',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
      }}
    >
      <Link
        to="/ana-sayfa"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        <Home size={16} />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} style={{ color: 'var(--color-border)' }} />
            {isLast ? (
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{label}</span>
            ) : (
              <Link to={to} style={{ color: 'var(--color-text-secondary)' }}>
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
