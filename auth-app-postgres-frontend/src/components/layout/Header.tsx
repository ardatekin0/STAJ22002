import React, { useState } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
  };

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={onMenuToggle}
            style={{
              display: 'flex',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
            className="header-menu-btn"
            aria-label="Menüyü Aç/Kapat"
            title="Menüyü Aç/Kapat"
          >
            <Menu size={22} />
          </button>

          <Breadcrumb />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right', display: 'none' }} className="header-user-info">
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {user.kullaniciAdi}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '2px' }}>
                  {user.roller.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <User size={16} color="var(--color-primary)" />
                <span>{user.kullaniciAdi}</span>
              </button>

              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                title="Çıkış Yap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

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
