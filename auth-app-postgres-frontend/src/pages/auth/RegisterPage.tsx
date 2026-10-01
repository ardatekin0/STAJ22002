import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { authService, roleService } from '../../services';
import type { Role } from '../../types';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ToastContainer } from '../../components/common/ToastContainer';
import { UserPlus, Lock, User as UserIcon, Mail, ArrowLeft } from 'lucide-react';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';

export const RegisterPage: React.FC = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [ePosta, setEPosta] = useState('');
  const [sifre, setSifre] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const [errors, setErrors] = useState<{
    kullaniciAdi?: string | null;
    ePosta?: string | null;
    sifre?: string | null;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchRoles = async () => {
      try {
        const data = await roleService.getAll();
        if (!ignore) {
          setAvailableRoles(data);
        }
      } catch {

      }
    };
    fetchRoles();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uErr = validateUsername(kullaniciAdi);
    const mErr = validateEmail(ePosta);
    const pErr = validatePassword(sifre);

    if (uErr || mErr || pErr) {
      setErrors({
        kullaniciAdi: uErr,
        ePosta: mErr,
        sifre: pErr,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await authService.register({
        kullaniciAdi: kullaniciAdi.trim(),
        ePosta: ePosta.trim(),
        sifre,
        rol: selectedRole.trim() ? selectedRole.trim() : undefined,
      });

      success(
        typeof res === 'string'
          ? res
          : 'Kullanıcı başarıyla kaydedildi!'
      );

      navigate('/roles');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Kayıt işlemi başarısız';

      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: '', label: 'Varsayılan Rol (ROLE_CALL_CENTER)' },
    ...availableRoles.map((r) => ({
      value: r.ad,
      label: r.aciklama ? `${r.ad} — ${r.aciklama}` : r.ad,
    })),
  ];

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '1rem',
            }}
          >
            <UserPlus size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
            }}
          >
            Yeni Kullanıcı Oluştur
          </h1>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.25rem',
            }}
          >
            Telekom yetkili paneli kullanıcı tanımlama ekranı
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

              if (errors.kullaniciAdi) {
                setErrors((prev) => ({
                  ...prev,
                  kullaniciAdi: null,
                }));
              }
            }}
            error={errors.kullaniciAdi}
            hint="Boşluk içeremez, en az 3 karakter olmalıdır"
            leftIcon={<UserIcon size={18} />}
            placeholder="Örn: ardatekin"
          />

          <Input
            label="E-Posta"
            type="email"
            required
            autoComplete="email"
            value={ePosta}
            onChange={(e) => {
              setEPosta(e.target.value);

              if (errors.ePosta) {
                setErrors((prev) => ({
                  ...prev,
                  ePosta: null,
                }));
              }
            }}
            error={errors.ePosta}
            hint="Boşluk içeremez, geçerli e-posta formatında olmalıdır"
            leftIcon={<Mail size={18} />}
            placeholder="adiniz@sirket.com"
          />

          <Input
            label="Şifre"
            type="password"
            required
            autoComplete="new-password"
            value={sifre}
            onChange={(e) => {
              setSifre(e.target.value);

              if (errors.sifre) {
                setErrors((prev) => ({
                  ...prev,
                  sifre: null,
                }));
              }
            }}
            error={errors.sifre}
            hint="Boşluk içeremez, en az 6 karakter olmalıdır"
            leftIcon={<Lock size={18} />}
            placeholder="••••••••"
          />

          <Select
            label="Kullanıcı Rolü"
            options={roleOptions}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            hint="Rol seçilmezse backend varsayılan olarak ROLE_CALL_CENTER atayacaktır"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{
              width: '100%',
              marginTop: '1.25rem',
            }}
          >
            Kullanıcıyı Kaydet
          </Button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Link
            to="/roles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Kullanıcı & Rol Yönetimine Dön</span>
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};