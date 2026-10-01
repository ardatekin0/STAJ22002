import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../../components/common/Badge';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        }}
      >

        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-danger)',
            marginBottom: '1.5rem',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
            position: 'relative',
          }}
        >
          <ShieldAlert size={44} />
          <span
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            }}
          >
            <Lock size={13} />
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={14} />
          <span>HATA KODU 403 &bull; YETKİSİZ ERİŞİM</span>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            lineHeight: 1.25,
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          Bu Alana Erişim İzniniz Bulunmuyor
        </h1>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.925rem',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          Görüntülemeye çalıştığınız sayfa veya işlem için kullanıcı hesabınızın yetki seviyesi yeterli değildir.
          Bu sayfaya erişmeniz gerektiğini düşünüyorsanız lütfen sistem yöneticinizle iletişime geçiniz.
        </p>

        {user && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '2rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Oturum Açan Kullanıcı
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '0.15rem' }}>
                {user.kullaniciAdi}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {user.roller.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={16} />}
          >
            Geri Dön
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/ana-sayfa')}
            leftIcon={<Home size={16} />}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
};
