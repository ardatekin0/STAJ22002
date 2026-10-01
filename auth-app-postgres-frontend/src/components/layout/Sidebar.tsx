import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Layers,
  Percent,
  FileText,
  UploadCloud,
  ShieldCheck,
  User,
  LogOut,
  Tag,
  BadgePercent,
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: ('ROLE_TELEKOM' | 'ROLE_CALL_CENTER')[];
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { user, logout, hasAnyRole, isTelekom } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
  };

  const navItems: NavItem[] = [
    {
      label: 'Ana Sayfa',
      path: '/ana-sayfa',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Müşteriler',
      path: '/customers',
      icon: <Users size={20} />,
    },
    {
      label: 'Hesaplar',
      path: '/accounts',
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Ürünler',
      path: '/products',
      icon: <Package size={20} />,
    },
    {
      label: 'Ürün Tarifeleri',
      path: '/product-tariffs',
      icon: <Layers size={20} />,
    },
    {
      label: 'Ürün İndirimleri',
      path: '/product-discounts',
      icon: <Percent size={20} />,
    },
    {
      label: 'Tarifeler',
      path: '/tariffs',
      icon: <Tag size={20} />,
    },
    {
      label: 'İndirimler',
      path: '/discounts',
      icon: <BadgePercent size={20} />,
    },
    {
      label: 'Faturalar',
      path: '/invoices',
      icon: <FileText size={20} />,
    },
    {
      label: 'Batch İşlemleri',
      path: '/batch',
      icon: <UploadCloud size={20} />,
      roles: ['ROLE_TELEKOM'],
    },
    {
      label: 'Kullanıcı & Rol Yönetimi',
      path: '/roles',
      icon: <ShieldCheck size={20} />,
      roles: ['ROLE_TELEKOM'],
    },
    {
      label: 'Profil',
      path: '/profile',
      icon: <User size={20} />,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  return (
    <>

      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: '#111827',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-closed'}
      >

        <div
          style={{
            height: 'var(--header-height)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AuthApp Telecom
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {isTelekom ? 'YÖNETİCİ PANELİ' : 'ÇAĞRI MERKEZİ'}
            </p>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  {user.kullaniciAdi.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {user.kullaniciAdi}
                  </p>
                  <div style={{ marginTop: '2px' }}>
                    {user.roller.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                title="Çıkış Yap"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Oturumu Kapat"
        message="Oturumunuzu kapatmak istediğinize emin misiniz?"
        confirmText="Evet, Çıkış Yap"
        cancelText="Vazgeç"
        variant="danger"
      />
    </>
  );
};
