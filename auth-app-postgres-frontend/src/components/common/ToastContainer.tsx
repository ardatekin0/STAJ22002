import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastType } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="var(--color-success)" />;
      case 'error':
        return <AlertCircle size={20} color="var(--color-danger)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--color-warning)" />;
      case 'info':
        return <Info size={20} color="var(--color-info)" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
            {getIcon(toast.type)}
          </div>
          <div className="toast-message">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div>{toast.message}</div>
          </div>
          <button
            className="toast-close-btn"
            onClick={() => removeToast(toast.id)}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
