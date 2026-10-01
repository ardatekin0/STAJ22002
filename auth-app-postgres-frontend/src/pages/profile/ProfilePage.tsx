import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';
import { RoleBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { User, Shield, CheckCircle, LogOut } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const { success, error: toastError } = useToast();

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
    success('Başarıyla çıkış yapıldı.');
  };

  useEffect(() => {
    const checkProfile = async () => {
      setIsLoading(true);
      try {
        const res = await authService.getProfile();
        setProfileStatus(typeof res === 'string' ? res : 'Profil yetkilendirmesi başarılı');

        if (user?.roller.includes('ROLE_TELEKOM')) {
          try {
            const adminRes = await authService.getAdminPage();
            setAdminStatus(typeof adminRes === 'string' ? adminRes : 'Admin yetkisi onaylandı');
          } catch {
            setAdminStatus('Admin paneli yetkisi doğrulanamadı');
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Profil yetkisi doğrulanamadı';
        toastError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [toastError, user]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <User size={28} color="var(--color-primary)" />
            <span>Kullanıcı Profili</span>
          </h2>
          <p className="page-subtitle">
            Oturum açmış kullanıcı bilgileri, yetki rolleri ve token güvenlik durumu.
          </p>
        </div>

        <Button
          variant="danger"
          onClick={() => setIsLogoutDialogOpen(true)}
          leftIcon={<LogOut size={16} />}
        >
          Güvenli Çıkış Yap
        </Button>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              {user?.kullaniciAdi.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {user?.kullaniciAdi}
              </h3>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                {user?.roller.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Kullanıcı ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {user?.id}
              </span>
            </div>

            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Kullanıcı Adı:</span>
              <span style={{ fontWeight: 600 }}>{user?.kullaniciAdi}</span>
            </div>

            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Hesap Durumu:</span>
              <span className="badge badge-success">Aktif</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Shield size={20} color="#10b981" />
            <span>Yetkilendirme Durumu</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                  GET /api/auth/profil Doğrulaması
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  {isLoading ? 'Doğrulanıyor...' : profileStatus || 'Doğrulandı'}
                </p>
              </div>
            </div>

            {user?.roller.includes('ROLE_TELEKOM') && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    GET /api/auth/admin (Telekom Özel)
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    {isLoading ? 'Doğrulanıyor...' : adminStatus || 'Doğrulandı'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};
