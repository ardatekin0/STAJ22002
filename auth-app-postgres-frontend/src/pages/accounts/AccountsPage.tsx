import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { accountService, customerService } from '../../services';
import type { Account, Customer, StatusEnum } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import { formatDate } from '../../utils/formatters';
import {
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Edit2,
} from 'lucide-react';

const accountSortOptions = [
  { value: 'accountId', label: 'Sırala: Hesap No' },
  { value: 'accountName', label: 'Sırala: Hesap Adı' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'createdDate', label: 'Sırala: Açılış Tarihi' },
];

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('accountId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createCustomerId, setCreateCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const [modalCustomers, setModalCustomers] = useState<Customer[]>([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<StatusEnum>('ACTIVE');

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [custList, accList] = await Promise.all([
        customerService.getAll(),
        selectedCustomerId !== 'ALL'
          ? accountService.getByCustomer(Number(selectedCustomerId))
          : searchTerm.trim()
          ? accountService.search(searchTerm, sortBy, sortDirection)
          : accountService.getAll(sortBy, sortDirection),
      ]);

      setCustomers(custList);
      setAccounts(accList);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Hesaplar yüklenemedi';
      toastError(formatErrorMessage(raw, 'account'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCustomerId, sortBy, sortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [custList, accList] = await Promise.all([
          customerService.getAll(),
          selectedCustomerId !== 'ALL'
            ? accountService.getByCustomer(Number(selectedCustomerId))
            : searchTerm.trim()
            ? accountService.search(searchTerm, sortBy, sortDirection)
            : accountService.getAll(sortBy, sortDirection),
        ]);
        if (!ignore) {
          setCustomers(custList);
          setAccounts(accList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Hesaplar yüklenemedi';
          toastError(formatErrorMessage(raw, 'account'));
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
  }, [searchTerm, selectedCustomerId, sortBy, sortDirection, toastError]);

  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    if (selectedCustomerId !== 'ALL' && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (acc) =>
          String(acc.accountId).includes(term) ||
          (acc.accountName && acc.accountName.toLowerCase().includes(term))
      );
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (acc) => acc.status?.toString().toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    if (sortBy === 'accountName') {
      result.sort((a, b) => {
        const nameA = a.accountName || '';
        const nameB = b.accountName || '';
        const comp = nameA.localeCompare(nameB, 'tr', { sensitivity: 'base' });
        return sortDirection === 'desc' ? -comp : comp;
      });
    } else if (sortBy === 'accountId') {
      result.sort((a, b) => {
        const comp = (a.accountId || 0) - (b.accountId || 0);
        return sortDirection === 'desc' ? -comp : comp;
      });
    } else if (sortBy === 'status') {
      result.sort((a, b) => {
        const comp = (a.status || '').localeCompare(b.status || '');
        return sortDirection === 'desc' ? -comp : comp;
      });
    } else if (sortBy === 'createdDate') {
      result.sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    return result;
  }, [accounts, selectedCustomerId, selectedStatus, searchTerm, sortBy, sortDirection]);

  useEffect(() => {
    if (!isCreateModalOpen) return;
    let ignore = false;
    const timer = setTimeout(async () => {
      if (!customerSearchQuery.trim()) {
        setModalCustomers(customers);
        return;
      }
      try {
        const data = await customerService.search(customerSearchQuery);
        if (!ignore) {
          setModalCustomers(data);
        }
      } catch {

      }
    }, customerSearchQuery.trim() ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [customerSearchQuery, customers, isCreateModalOpen]);

  const handleOpenCreateModal = () => {
    setCustomerSearchQuery('');
    setModalCustomers(customers);
    setCreateCustomerId('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCustomerId) {
      toastError('Lütfen bir müşteri seçiniz.');
      return;
    }

    setIsCreateConfirmOpen(true);
  };

  const handleExecuteCreate = async () => {
    setIsCreating(true);
    try {
      const res = await accountService.create(Number(createCustomerId));
      success(typeof res === 'string' ? res : 'Hesap başarıyla oluşturuldu.');
      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Hesap oluşturulamadı';
      toastError(formatErrorMessage(raw, 'account'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (account: Account) => {
    setSelectedAccount(account);
    setUpdatedStatus(account.status);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setIsUpdateConfirmOpen(true);
  };

  const handleExecuteUpdateStatus = async () => {
    if (!selectedAccount) return;

    setIsUpdating(true);
    try {
      const res = await accountService.updateStatus(selectedAccount.accountId, updatedStatus);
      success(typeof res === 'string' ? res : 'Hesap durumu güncellendi.');
      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Güncelleme başarısız';
      toastError(formatErrorMessage(raw, 'account'));
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedCustomerName = useMemo(() => {
    const c = customers.find((cust) => String(cust.customerId) === createCustomerId);
    return c ? `${c.customerName} ${c.customerLastName}` : '';
  }, [customers, createCustomerId]);

  const customerFilterOptions = useMemo(() => {
    const sorted = [...customers].sort((a, b) => {
      const nameA = `${a.customerName || ''} ${a.customerLastName || ''}`.trim();
      const nameB = `${b.customerName || ''} ${b.customerLastName || ''}`.trim();
      return nameA.localeCompare(nameB, 'tr', { sensitivity: 'base' });
    });
    return [
      { value: 'ALL', label: 'Tüm Müşteriler' },
      ...sorted.map((c) => ({
        value: String(c.customerId),
        label: `${c.customerName} ${c.customerLastName} — ${c.customerId}`,
      })),
    ];
  }, [customers]);

  const columns: Column<Account>[] = [
    {
      header: 'Hesap No',
      key: 'accountId',
      sortKey: 'accountId',
      width: '140px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
          {item.accountId}
        </span>
      ),
    },
    {
      header: 'Hesap Adı',
      key: 'accountName',
      sortKey: 'accountName',
      sortable: true,
      render: (item) => <span style={{ fontWeight: 600 }}>{item.accountName}</span>,
    },
    {
      header: 'Durum',
      key: 'status',
      sortKey: 'status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
      width: '130px',
    },
    {
      header: 'Açılış Tarihi',
      key: 'createdDate',
      sortKey: 'createdDate',
      sortable: true,
      render: (item) => (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
          {formatDate(item.createdDate)}
        </span>
      ),
      width: '170px',
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
          onClick={() => handleOpenUpdateModal(item)}
          leftIcon={<Edit2 size={14} />}
        >
          Durum
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
              <CreditCard size={28} color="var(--color-accent)" />
              <span>Hesap Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Müşterilere ait aktif/pasif hesapları listeleyin, yeni hesap açın ve durum güncelleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={loadData}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
            >
              Yenile
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus size={18} />}
            >
              Yeni Hesap Aç
            </Button>
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
              placeholder="Hesap No veya Hesap Adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '220px' }}>
            <Select
              options={customerFilterOptions}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <Select
              options={[
                { value: 'ALL', label: 'Tüm Durumlar' },
                { value: 'ACTIVE', label: 'Aktif Hesaplar' },
                { value: 'PASSIVE', label: 'Pasif Hesaplar' },
                { value: 'CLOSED', label: 'Kapalı Hesaplar' },
                { value: 'CANCELED', label: 'İptal Hesaplar' },
              ]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '175px' }}>
            <Select
              options={accountSortOptions}
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
        data={filteredAccounts}
        isLoading={isLoading}
        keyExtractor={(item) => item.accountId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="hesaplar"
        emptyTitle="Hesap Bulunamadı"
        emptyDescription="Kriterlerinize uygun hesap kaydı bulunamadı."
        emptyActionText="Yeni Hesap Aç"
        onEmptyAction={handleOpenCreateModal}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Hesap Oluştur"
        maxWidth="540px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={isCreating}
            >
              Hesabı Oluştur
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Hesap adı ve hesap numarası backend tarafından müşterinin mevcut hesap sayısına göre otomatik
              üretilmektedir.
            </p>
          </div>

          {customers.length > 5 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <Input
                label="Müşteri Filtrele"
                placeholder="İsim veya Müşteri No ile ara..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
          )}

          <Select
            label="Hesap Açılacak Müşteri"
            placeholder="-- Müşteri Seçiniz --"
            required
            options={modalCustomers.map((c) => ({
              value: String(c.customerId),
              label: `${c.customerName} ${c.customerLastName} — Müşteri ${c.customerId} (${c.customerType === 'INDIVIDUAL' ? 'TCKN: ' + (c.tckn || '-') : 'VKN: ' + (c.vkn || '-')
                })`,
            }))}
            value={createCustomerId}
            onChange={(e) => setCreateCustomerId(e.target.value)}
          />
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Hesap Durumu Güncelle"
        maxWidth="440px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateSubmit}
              isLoading={isUpdating}
            >
              Durumu Güncelle
            </Button>
          </>
        }
      >
        {selectedAccount && (
          <form onSubmit={handleUpdateSubmit}>
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hesap:</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {selectedAccount.accountName} ({selectedAccount.accountId})
              </div>
            </div>

            <Select
              label="Yeni Hesap Durumu"
              required
              options={[
                { value: 'ACTIVE', label: 'ACTIVE (Aktif)' },
                { value: 'PASSIVE', label: 'PASSIVE (Pasif)' },
                { value: 'CLOSED', label: 'CLOSED (Kapalı)' },
                { value: 'CANCELED', label: 'CANCELED (İptal)' },
              ]}
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value as StatusEnum)}
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isCreateConfirmOpen}
        onClose={() => setIsCreateConfirmOpen(false)}
        onConfirm={handleExecuteCreate}
        title="Yeni Hesap Açılışı"
        message={
          selectedCustomerName
            ? `${selectedCustomerName} müşterisi için yeni bir telekomünikasyon hesabı açılacaktır. Onaylıyor musunuz?`
            : 'Seçili müşteri için yeni hesap açılacaktır. Onaylıyor musunuz?'
        }
        confirmText="Evet, Hesabı Aç"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdateStatus}
        title="Hesap Durumu Güncelleme"
        message={
          selectedAccount
            ? `${selectedAccount.accountName} (${selectedAccount.accountId}) hesabının durumu '${updatedStatus}' olarak güncellenecektir. Onaylıyor musunuz?`
            : 'Hesap durumu güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />
    </div>
  );
};