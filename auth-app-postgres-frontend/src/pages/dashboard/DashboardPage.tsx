import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  customerService,
  tariffService,
  discountService,
  invoiceService,
} from '../../services';
import {
  Users,
  Tag,
  BadgePercent,
  FileText,
  PlusCircle,
  UploadCloud,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Spinner';

interface DashboardStats {
  customerCount: number;
  tariffCount: number;
  discountCount: number;
  invoiceCount: number;
}

export const DashboardPage: React.FC = () => {
  const { user, isTelekom } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    customerCount: 0,
    tariffCount: 0,
    discountCount: 0,
    invoiceCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [customers, tariffs, discounts, invoices] = await Promise.allSettled([
          customerService.getAll(),
          tariffService.getAll(),
          discountService.getAll(),
          invoiceService.getAll(),
        ]);

        if (isMounted) {
          setStats({
            customerCount: customers.status === 'fulfilled' ? customers.value.length : 0,
            tariffCount: tariffs.status === 'fulfilled' ? tariffs.value.length : 0,
            discountCount: discounts.status === 'fulfilled' ? discounts.value.length : 0,
            invoiceCount: invoices.status === 'fulfilled' ? invoices.value.length : 0,
          });
        }
      } catch {

      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      title: 'Toplam Müşteri',
      value: stats.customerCount,
      icon: <Users size={24} color="#6366f1" />,
      link: '/customers',
      color: 'rgba(99, 102, 241, 0.15)',
    },
    {
      title: 'Tanımlı Tarifeler',
      value: stats.tariffCount,
      icon: <Tag size={24} color="#06b6d4" />,
      link: '/tariffs',
      color: 'rgba(6, 182, 212, 0.15)',
    },
    {
      title: 'Aktif İndirimler',
      value: stats.discountCount,
      icon: <BadgePercent size={24} color="#10b981" />,
      link: '/discounts',
      color: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: 'Toplam Fatura',
      value: stats.invoiceCount,
      icon: <FileText size={24} color="#f59e0b" />,
      link: '/invoices',
      color: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  return (
    <div>

      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          background:
            'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Hoş Geldiniz, {user?.kullaniciAdi}
            </h2>
            {user?.roller.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', maxWidth: '600px' }}>
            Telekomünikasyon abone, hesap, ürün, tarife, indirim ve faturalandırma süreçlerini bu panel
            üzerinden yönetebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/customers')}
          >
            <Users size={18} />
            <span>Müşterileri Yönet</span>
          </button>
          {isTelekom && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/invoices')}
            >
              <TrendingUp size={18} />
              <span>Fatura Kesim</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => navigate(card.link)}
          >
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.25rem',
                }}
              >
                {card.title}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {isLoading ? <Skeleton width="60px" height="2rem" /> : card.value}
              </div>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>

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
            <CreditCard size={20} color="var(--color-primary)" />
            <span>Müşteri ve Ürün İşlemleri</span>
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '1.25rem',
            }}
          >
            Bireysel ve kurumsal aboneler oluşturabilir, hesap tanımlayabilir ve aboneliklere tarife veya
            indirim atayabilirsiniz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              onClick={() => navigate('/customers')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Müşteri Listesi & Yeni Müşteri</span>
              </div>
              <ArrowRight size={16} color="var(--color-text-muted)" />
            </div>

            <div
              onClick={() => navigate('/accounts')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CreditCard size={18} color="var(--color-accent)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hesap Yönetimi & Hesap Açılışı</span>
              </div>
              <ArrowRight size={16} color="var(--color-text-muted)" />
            </div>

            <div
              onClick={() => navigate('/product-tariffs')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Ürün Tarife Tanımları</span>
              </div>
              <ArrowRight size={16} color="var(--color-text-muted)" />
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
            <Shield size={20} color={isTelekom ? 'var(--color-accent)' : 'var(--color-warning)'} />
            <span>{isTelekom ? 'Yönetici ve Sistem İşlemleri' : 'Tarife & Fatura İnceleme'}</span>
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '1.25rem',
            }}
          >
            {isTelekom
              ? 'Tarife/indirim oluşturma, toplu Excel yükleme, fatura kesim batch tetikleme ve rol yönetimi yapabilirsiniz.'
              : 'Aktif tarifeleri, indirim modellerini ve müşteri fatura dökümlerini inceleyebilirsiniz.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              onClick={() => navigate('/invoices')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Faturaları İncele {isTelekom && '& Kesim Başlat'}</span>
              </div>
              <ArrowRight size={16} color="var(--color-text-muted)" />
            </div>

            {isTelekom && (
              <>
                <div
                  onClick={() => navigate('/batch')}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UploadCloud size={18} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Excel ile Toplu Müşteri İçe Aktarım</span>
                  </div>
                  <ArrowRight size={16} color="var(--color-text-muted)" />
                </div>

                <div
                  onClick={() => navigate('/tariffs')}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PlusCircle size={18} color="#06b6d4" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Tarife Tanımla ve Güncelle</span>
                  </div>
                  <ArrowRight size={16} color="var(--color-text-muted)" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
