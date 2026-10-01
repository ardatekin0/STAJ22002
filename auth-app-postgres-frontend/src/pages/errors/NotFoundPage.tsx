import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '1.5rem',
          }}
        >
          <HelpCircle size={36} />
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0 0.5rem', color: 'var(--color-text-primary)' }}>
          Sayfa Bulunamadı
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
            Geri Dön
          </Button>
          <Button variant="primary" onClick={() => navigate('/ana-sayfa')} leftIcon={<Home size={16} />}>
            Ana Sayfaya Git
          </Button>
        </div>
      </div>
    </div>
  );
};
