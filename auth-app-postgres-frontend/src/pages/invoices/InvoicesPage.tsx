import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { invoiceService, accountService } from '../../services';
import type { Invoice, Account } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import { formatCurrency, formatDate, formatDateOnly } from '../../utils/formatters';
import {
  FileText,
  Play,
  RefreshCw,
  Search,
  Eye,
  FileDown,
} from 'lucide-react';
import { generateInvoicePdf } from '../../utils/pdfInvoiceGenerator';

const invoiceSortOptions = [
  { value: 'invoiceId', label: 'Sırala: Fatura No' },
  { value: 'billingPeriod', label: 'Sırala: Dönem' },
  { value: 'totalPrice', label: 'Sırala: Toplam Tutar' },
  { value: 'totalDiscountPrice', label: 'Sırala: İndirim Tutarı' },
  { value: 'totalTaxPrice', label: 'Sırala: Vergi (KDV)' },
  { value: 'lastPaymentDate', label: 'Sırala: Son Ödeme' },
];

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('invoiceId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isConfirmBatchOpen, setIsConfirmBatchOpen] = useState(false);
  const [isTriggeringBatch, setIsTriggeringBatch] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { isTelekom } = useAuth();
  const { success, error: toastError } = useToast();

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const [accList, invList] = await Promise.all([
        accountService.getByStatus('ACTIVE'),
        searchTerm.trim()
          ? invoiceService.search(searchTerm, sortBy, sortDirection)
          : invoiceService.getAll(sortBy, sortDirection),
      ]);

      setAccounts(accList);
      setInvoices(invList);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Faturalar yüklenemedi';
      toastError(formatErrorMessage(raw, 'invoice'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy, sortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [accList, invList] = await Promise.all([
          accountService.getByStatus('ACTIVE'),
          searchTerm.trim()
            ? invoiceService.search(searchTerm, sortBy, sortDirection)
            : invoiceService.getAll(sortBy, sortDirection),
        ]);

        if (!ignore) {
          setAccounts(accList);
          setInvoices(invList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Faturalar yüklenemedi';
          toastError(formatErrorMessage(raw, 'invoice'));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, searchTerm.trim() ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchTerm, sortBy, sortDirection, toastError]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (selectedAccountId !== 'ALL') {
      result = result.filter(
        (inv) => inv.account?.accountId === Number(selectedAccountId) || inv.accountId === Number(selectedAccountId)
      );
    }

    if (selectedPeriod.trim()) {
      const periodTerm = selectedPeriod.trim();
      result = result.filter(
        (inv) => inv.billingPeriod != null && inv.billingPeriod.toString().startsWith(periodTerm)
      );
    }

    return result;
  }, [invoices, selectedAccountId, selectedPeriod]);

  const accountFilterOptions = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => {
      const nameA = a.accountName || '';
      const nameB = b.accountName || '';
      return nameA.localeCompare(nameB, 'tr', { sensitivity: 'base' });
    });
    return [
      { value: 'ALL', label: 'Tüm Hesaplar' },
      ...sorted.map((a) => ({
        value: String(a.accountId),
        label: `${a.accountName} (${a.accountId})`,
      })),
    ];
  }, [accounts]);

  const handleTriggerInvoiceBatch = async () => {
    setIsTriggeringBatch(true);
    try {
      const res = await invoiceService.createInvoiceBatch();
      success(typeof res === 'string' ? res : 'Fatura kesim işlemi başlatıldı.');
      setIsConfirmBatchOpen(false);
      setTimeout(() => loadInvoices(), 1500);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Fatura batch tetiklenemedi';
      toastError(formatErrorMessage(raw, 'invoice'));
    } finally {
      setIsTriggeringBatch(false);
    }
  };

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Fatura No',
      key: 'invoiceId',
      sortKey: 'invoiceId',
      width: '150px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {item.invoiceId}
        </span>
      ),
    },
    {
      header: 'Dönem',
      key: 'billingPeriod',
      sortKey: 'billingPeriod',
      width: '120px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {item.billingPeriod}
        </span>
      ),
    },
    {
      header: 'Hesap No',
      sortable: false,
      render: (item) => {
        const accId = item.accountId ?? item.account?.accountId;
        if (accId) {
          return (
            <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
              Hesap {accId}
            </span>
          );
        }
        if (selectedAccountId !== 'ALL') {
          return (
            <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
              Hesap {selectedAccountId}
            </span>
          );
        }
        return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
      },
      width: '140px',
    },
    {
      header: 'Toplam Tutar',
      key: 'totalPrice',
      sortKey: 'totalPrice',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {formatCurrency(item.totalPrice)}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'İndirim Tutarı',
      key: 'totalDiscountPrice',
      sortKey: 'totalDiscountPrice',
      sortable: true,
      render: (item) => (
        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
          {formatCurrency(item.totalDiscountPrice)}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Vergi (KDV)',
      key: 'totalTaxPrice',
      sortKey: 'totalTaxPrice',
      sortable: true,
      render: (item) => (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          {formatCurrency(item.totalTaxPrice)}
        </span>
      ),
      width: '130px',
    },
    {
      header: 'Son Ödeme Tarihi',
      key: 'lastPaymentDate',
      sortKey: 'lastPaymentDate',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.825rem', color: 'var(--color-danger)' }}>
          {formatDateOnly(item.lastPaymentDate)}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'İşlemler',
      align: 'right',
      width: '100px',
      sortable: false,
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetail(item)}
          leftIcon={<Eye size={14} />}
        >
          Detay
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="sticky-control-area">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <FileText size={28} color="var(--color-primary)" />
              <span>Fatura Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Dönemsel telekomünikasyon faturalarını görüntüleyin, hesap bazlı sorgulayın ve fatura kesim sürecini tetikleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={loadInvoices}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
            >
              Yenile
            </Button>
            {isTelekom && (
              <Button
                variant="primary"
                onClick={() => setIsConfirmBatchOpen(true)}
                isLoading={isTriggeringBatch}
                leftIcon={<Play size={16} />}
              >
                Fatura Kesim Başlat
              </Button>
            )}
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <Input
              placeholder="Fatura No veya Dönem ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <Select
              options={accountFilterOptions}
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <Input
              placeholder="Dönem (YYYYAA)"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '175px' }}>
            <Select
              options={invoiceSortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '140px' }}>
            <Select
              options={[
                { value: 'asc', label: 'Artan (A-Z)' },
                { value: 'desc', label: 'Azalan (Z-A)' },
              ]}
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              style={{ margin: 0 }}
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        isLoading={isLoading}
        keyExtractor={(item) => item.invoiceId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="faturalar"
        emptyTitle="Fatura Bulunamadı"
        emptyDescription="Kriterlerinize uygun kesilmiş fatura kaydı bulunamadı."
      />

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Fatura Detayı"
        maxWidth="540px"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Kapat
          </Button>
        }
      >
        {selectedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fatura No:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedInvoice.invoiceId}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Dönem:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedInvoice.billingPeriod}</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="glass-card" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Vergisiz Tutar</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {formatCurrency(selectedInvoice.noTaxTotalPrice)}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Vergisiz İndirim</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-success)' }}>
                  {formatCurrency(selectedInvoice.noTaxTotalDiscountPrice)}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Toplam İndirim</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-success)' }}>
                  {formatCurrency(selectedInvoice.totalDiscountPrice)}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Toplam Vergi (KDV)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {formatCurrency(selectedInvoice.totalTaxPrice)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Ödenecek Toplam Tutar</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {formatCurrency(selectedInvoice.totalPrice)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <span>Oluşturulma: {formatDate(selectedInvoice.createdAt)}</span>
              <span>Son Ödeme: {formatDateOnly(selectedInvoice.lastPaymentDate)}</span>
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)' }}>
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  generateInvoicePdf({
                    invoice: selectedInvoice,
                    account: accounts.find(
                      (a) =>
                        a.accountId === selectedInvoice.accountId ||
                        a.accountId === selectedInvoice.account?.accountId
                    ),
                  })
                }
                leftIcon={<FileDown size={18} />}
                style={{ width: '100%' }}
              >
                PDF İndir
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmBatchOpen}
        onClose={() => setIsConfirmBatchOpen(false)}
        onConfirm={handleTriggerInvoiceBatch}
        title="Fatura Kesim İşlemi"
        message="Tüm aktif hesaplar için dönemsel fatura kesim sürecini başlatmak istediğinize emin misiniz? Bu işlem biraz zaman alabilir."
        confirmText="Evet, Başlat"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isTriggeringBatch}
      />
    </div>
  );
};
