import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ToastContainer } from '../../components/common/ToastContainer';
import { Lock, User as UserIcon } from 'lucide-react';
import { validatePassword, validateUsername } from '../../utils/validators';

export const LoginPage: React.FC = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [errors, setErrors] = useState<{ kullaniciAdi?: string | null; sifre?: string | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || '';

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uErr = validateUsername(kullaniciAdi);
    const pErr = validatePassword(sifre);

    if (uErr || pErr) {
      setErrors({ kullaniciAdi: uErr, sifre: pErr });
      return;
    }

    if (!recaptchaToken) {
      toastError('Lütfen reCAPTCHA doğrulamasını tamamlayın.');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await authService.login(
        {
          kullaniciAdi: kullaniciAdi.trim(),
          sifre,
        },
        recaptchaToken
      );

      login(res.token);
      success(res.message || 'Başarıyla giriş yapıldı!');
      navigate('/ana-sayfa', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş yapılamadı';
      toastError(msg);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg-primary)',
        position: 'relative',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Giriş Yap
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Telekom Yönetim ve Çağrı Merkezi Portalı
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Kullanıcı Adı"
            type="text"
            required
            autoComplete="username"
            value={kullaniciAdi}
            onChange={(e) => {
              setKullaniciAdi(e.target.value);
              if (errors.kullaniciAdi) setErrors((prev) => ({ ...prev, kullaniciAdi: null }));
            }}
            error={errors.kullaniciAdi}
            leftIcon={<UserIcon size={18} />}
            placeholder="Kullanıcı adınızı girin"
          />

          <Input
            label="Şifre"
            type="password"
            required
            autoComplete="current-password"
            value={sifre}
            onChange={(e) => {
              setSifre(e.target.value);
              if (errors.sifre) setErrors((prev) => ({ ...prev, sifre: null }));
            }}
            error={errors.sifre}
            leftIcon={<Lock size={18} />}
            placeholder="••••••••"
          />

          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'center',
              minHeight: '78px',
            }}
          >
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '1.25rem' }}
          >
            Giriş Yap
          </Button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};
