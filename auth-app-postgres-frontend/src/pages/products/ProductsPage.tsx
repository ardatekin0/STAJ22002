import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { productService, accountService } from '../../services';
import type { Product, Account, StatusEnum } from '../../types';
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
  Package,
  Plus,
  RefreshCw,
  Search,
  Edit2,
} from 'lucide-react';

const productSortOptions = [
  { value: 'productId', label: 'Sırala: Ürün No' },
  { value: 'accountId', label: 'Sırala: Hesap No' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'createdAt', label: 'Sırala: Oluşturulma' },
  { value: 'updatedAt', label: 'Sırala: Güncellenme' },
];

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('productId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createAccountId, setCreateAccountId] = useState<string>('');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');

  const [modalAccounts, setModalAccounts] = useState<Account[]>([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<StatusEnum>('ACTIVE');

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [prodList, accList] = await Promise.all([
        searchTerm.trim()
          ? productService.search(searchTerm, sortBy, sortDirection)
          : productService.getAll(sortBy, sortDirection),
        accountService.getByStatus('ACTIVE'),
      ]);

      setProducts(prodList);
      setAccounts(accList);
    } catch (err: unknown) {
      const raw = err instanceof Error
        ? err.message
        : 'Ürünler yüklenemedi';

      toastError(formatErrorMessage(raw, 'product'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy, sortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [prodList, accList] = await Promise.all([
          searchTerm.trim()
            ? productService.search(searchTerm, sortBy, sortDirection)
            : productService.getAll(sortBy, sortDirection),
          accountService.getByStatus('ACTIVE'),
        ]);
        if (!ignore) {
          setProducts(prodList);
          setAccounts(accList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Ürünler yüklenemedi';
          toastError(formatErrorMessage(raw, 'product'));
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

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }
    return result;
  }, [products, selectedStatus]);

  const accountMap = useMemo(() => {
    const map = new Map<number, Account>();

    accounts.forEach((account) => {
      map.set(account.accountId, account);
    });

    return map;
  }, [accounts]);

  useEffect(() => {
    if (!isCreateModalOpen) return;
    let ignore = false;
    const timer = setTimeout(async () => {
      if (!accountSearchQuery.trim()) {
        setModalAccounts(accounts);
        return;
      }
      try {
        const data = await accountService.search(accountSearchQuery);
        if (!ignore) {
          setModalAccounts(data);
        }
      } catch {

      }
    }, accountSearchQuery.trim() ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [accountSearchQuery, accounts, isCreateModalOpen]);

  const handleOpenCreateModal = () => {
    setAccountSearchQuery('');
    setModalAccounts(accounts);

    setCreateAccountId(
      accounts.length > 0
        ? String(accounts[0].accountId)
        : ''
    );

    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!createAccountId) {
      toastError('Lütfen bir hesap seçiniz.');
      return;
    }

    setIsCreateConfirmOpen(true);
  };

  const handleExecuteCreate = async () => {
    setIsCreating(true);

    try {
      const res = await productService.create(
        Number(createAccountId)
      );

      success(
        typeof res === 'string'
          ? res
          : 'Ürün başarıyla oluşturuldu.'
      );

      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);

      await loadData();
    } catch (err: unknown) {
      const raw = err instanceof Error
        ? err.message
        : 'Ürün oluşturulamadı';

      toastError(formatErrorMessage(raw, 'product'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (product: Product) => {
    setSelectedProduct(product);
    setUpdatedStatus(product.status);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    setIsUpdateConfirmOpen(true);
  };

  const handleExecuteUpdate = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);

    try {
      const res = await productService.updateStatus(
        selectedProduct.productId,
        updatedStatus
      );

      success(
        typeof res === 'string'
          ? res
          : 'Ürün durumu güncellendi.'
      );

      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);

      await loadData();
    } catch (err: unknown) {
      const raw = err instanceof Error
        ? err.message
        : 'Güncelleme başarısız';

      toastError(formatErrorMessage(raw, 'product'));
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedAccountName = useMemo(() => {
    const acc = accounts.find((a) => String(a.accountId) === createAccountId);
    return acc ? acc.accountName : '';
  }, [accounts, createAccountId]);

  const columns: Column<Product>[] = [
    {
      header: 'Ürün No',
      key: 'productId',
      sortKey: 'productId',
      width: '140px',
      sortable: true,
      render: (item) => (
        <span
          style={{
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          {item.productId}
        </span>
      ),
    },

    {
      header: 'Bağlı Hesap',
      key: 'accountId',
      sortKey: 'accountId',
      sortable: true,
      render: (item) => {
        const accountId =
          item.accountId ??
          item.account?.accountId;

        const account = accountId
          ? accountMap.get(accountId)
          : item.account;

        if (!accountId) {
          return (
            <span
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              -
            </span>
          );
        }

        return (
          <div>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {account?.accountName ?? `Hesap ${accountId}`}
            </div>

            <div
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
              }}
            >
              Hesap {accountId}
            </div>
          </div>
        );
      },
    },

    {
      header: 'Durum',
      key: 'status',
      sortKey: 'status',
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
      width: '130px',
    },

    {
      header: 'Oluşturulma Tarihi',
      key: 'createdAt',
      sortKey: 'createdAt',
      sortable: true,
      render: (item) => (
        <span
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.825rem',
          }}
        >
          {formatDate(item.createdAt)}
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
              <Package
                size={28}
                color="var(--color-primary)"
              />
              <span>Ürün Yönetimi</span>
            </h2>

            <p className="page-subtitle">
              Müşteri hesaplarına bağlı telekomünikasyon ürünlerini (hat/abonelik) listeleyin, yeni ürün tanımlayın ve durum güncelleyin.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
            }}
          >
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
              Yeni Ürün Tanımla
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
          <div
            style={{
              flex: '1 1 200px',
              minWidth: '180px',
            }}
          >
            <Input
              placeholder="Ürün No veya Hesap ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <Select
              options={[
                {
                  value: 'ALL',
                  label: 'Tüm Durumlar',
                },
                {
                  value: 'ACTIVE',
                  label: 'Aktif Ürünler',
                },
                {
                  value: 'PASSIVE',
                  label: 'Pasif Ürünler',
                },
                {
                  value: 'CLOSED',
                  label: 'Kapalı Ürünler',
                },
                {
                  value: 'CANCELED',
                  label: 'İptal Ürünler',
                },
              ]}
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '175px' }}>
            <Select
              options={productSortOptions}
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
        data={filteredProducts}
        isLoading={isLoading}
        keyExtractor={(item) => item.productId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="urunler"
        emptyTitle="Ürün Bulunamadı"
        emptyDescription="Seçilen filtre ve kriterlere uygun ürün kaydı bulunamadı."
        emptyActionText="Yeni Ürün Tanımla"
        onEmptyAction={handleOpenCreateModal}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Ürün Tanımla"
        maxWidth="540px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                setIsCreateModalOpen(false)
              }
              disabled={isCreating}
            >
              Vazgeç
            </Button>

            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={isCreating}
            >
              Ürünü Tanımla
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Seçilen müşteri hesabına bağlı yeni bir ürün (servis/hat aboneliği) oluşturulacaktır.
            </p>
          </div>

          {accounts.length > 5 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <Input
                label="Hesap Filtrele"
                placeholder="Hesap No, Adı veya Müşteri ara..."
                value={accountSearchQuery}
                onChange={(e) =>
                  setAccountSearchQuery(e.target.value)
                }
                leftIcon={<Search size={16} />}
              />
            </div>
          )}

          <Select
            label="Ürün Tanımlanacak Hesap"
            required
            options={modalAccounts.map((account) => ({
              value: String(account.accountId),

              label: `${account.accountName} — Hesap ${account.accountId}${account.customer
                ? ` (${account.customer.customerName} ${account.customer.customerLastName})`
                : ''
                }`,
            }))}
            value={createAccountId}
            onChange={(e) =>
              setCreateAccountId(e.target.value)
            }
          />
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Ürün Durumu Güncelle"
        maxWidth="440px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                setIsUpdateModalOpen(false)
              }
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
        {selectedProduct && (
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
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Ürün:
              </div>

              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Ürün {selectedProduct.productId}
              </div>
            </div>

            <Select
              label="Yeni Ürün Durumu"
              required
              options={[
                {
                  value: 'ACTIVE',
                  label: 'ACTIVE (Aktif)',
                },
                {
                  value: 'PASSIVE',
                  label: 'PASSIVE (Pasif)',
                },
                {
                  value: 'CLOSED',
                  label: 'CLOSED (Kapalı)',
                },
                {
                  value: 'CANCELED',
                  label: 'CANCELED (İptal)',
                },
              ]}
              value={updatedStatus}
              onChange={(e) =>
                setUpdatedStatus(
                  e.target.value as StatusEnum
                )
              }
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isCreateConfirmOpen}
        onClose={() => setIsCreateConfirmOpen(false)}
        onConfirm={handleExecuteCreate}
        title="Yeni Ürün Tanımlama"
        message={
          selectedAccountName
            ? `${selectedAccountName} (${createAccountId}) hesabı için yeni bir ürün tanımlanacaktır. Onaylıyor musunuz?`
            : 'Seçili hesap için yeni ürün tanımlanacaktır. Onaylıyor musunuz?'
        }
        confirmText="Evet, Tanımla"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="Ürün Durumu Güncelleme"
        message={
          selectedProduct
            ? `Ürün ${selectedProduct.productId} durumunu '${updatedStatus}' olarak güncellemek istediğinize emin misiniz?`
            : 'Ürün durumu güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />
    </div>
  );
};