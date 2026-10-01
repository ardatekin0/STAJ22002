import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  productTariffService,
  productService,
  tariffService,
} from '../../services';
import type {
  ProductTariff,
  Product,
  Tariff,
  StatusEnum,
} from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import {
  buildProductTariffCreateRequest,
  buildProductTariffUpdateRequest,
} from '../../utils/requestBuilders';
import { validateDateRange } from '../../utils/validators';
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
} from '../../utils/formatters';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Info,
} from 'lucide-react';

const productTariffSortOptions = [
  { value: 'productTariffId', label: 'Sırala: ID' },
  { value: 'productId', label: 'Sırala: Ürün No' },
  { value: 'tariffId', label: 'Sırala: Tarife No' },
  { value: 'startDate', label: 'Sırala: Başlangıç' },
  { value: 'endDate', label: 'Sırala: Bitiş' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'updatedAt', label: 'Sırala: Güncellenme' },
];

export const ProductTariffsPage: React.FC = () => {
  const [productTariffs, setProductTariffs] = useState<ProductTariff[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('productTariffId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    productId: '',
    tariffId: '',
    startDate: '',
    endDate: '',
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductTariff | null>(null);
  const [updateForm, setUpdateForm] = useState({
    productId: 0,
    tariffId: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [ptList, prodList, tarList] = await Promise.all([
        searchTerm.trim()
          ? productTariffService.search(searchTerm, sortBy, sortDirection)
          : productTariffService.getAll(sortBy, sortDirection),
        productService.getByStatus('ACTIVE'),
        tariffService.getByStatus('ACTIVE'),
      ]);

      setProductTariffs(ptList);
      setProducts(prodList);
      setTariffs(tarList);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Veriler yüklenemedi';
      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy, sortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [ptList, prodList, tarList] = await Promise.all([
          searchTerm.trim()
            ? productTariffService.search(searchTerm, sortBy, sortDirection)
            : productTariffService.getAll(sortBy, sortDirection),
          productService.getByStatus('ACTIVE'),
          tariffService.getByStatus('ACTIVE'),
        ]);

        if (!ignore) {
          setProductTariffs(ptList);
          setProducts(prodList);
          setTariffs(tarList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw =
            err instanceof Error ? err.message : 'Veriler yüklenemedi';

          toastError(formatErrorMessage(raw, 'tariff'));
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

  const filteredList = useMemo(() => {
    let result = [...productTariffs];

    if (selectedStatus !== 'ALL') {
      result = result.filter((pt) => pt.status === selectedStatus);
    }

    return result;
  }, [productTariffs, selectedStatus]);

  const selectedCreateTariff = useMemo(() => {
    return tariffs.find(
      (t) => String(t.tariffId) === createForm.tariffId
    );
  }, [tariffs, createForm.tariffId]);

  const selectedUpdateTariff = useMemo(() => {
    return tariffs.find(
      (t) => String(t.tariffId) === updateForm.tariffId
    );
  }, [tariffs, updateForm.tariffId]);

  const handleOpenCreateModal = () => {
    const defaultStart = new Date().toISOString().slice(0, 16);

    const defaultEnd = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 16);

    setCreateForm({
      productId:
        products.length > 0 ? String(products[0].productId) : '',

      tariffId:
        tariffs.length > 0 ? String(tariffs[0].tariffId) : '',

      startDate: defaultStart,
      endDate: defaultEnd,
    });

    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !createForm.productId ||
      !createForm.tariffId ||
      !createForm.startDate ||
      !createForm.endDate
    ) {
      toastError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    const dateErr = validateDateRange(
      createForm.startDate,
      createForm.endDate
    );

    if (dateErr) {
      toastError(dateErr);
      return;
    }

    setIsCreateConfirmOpen(true);
  };

  const handleExecuteCreate = async () => {
    setIsCreating(true);

    try {
      const payload = buildProductTariffCreateRequest({
        productId: Number(createForm.productId),
        tariffId: Number(createForm.tariffId),
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
      });

      const res = await productTariffService.create(payload);

      success(
        typeof res === 'string'
          ? res
          : 'Ürün tarifesi başarıyla tanımlandı.'
      );

      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : 'Ürün tarifesi oluşturulamadı';

      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (item: ProductTariff) => {
    setSelectedItem(item);

    setUpdateForm({
      productId: item.product.productId,
      tariffId: String(item.tariff.tariffId),
      startDate: item.startDate
        ? item.startDate.slice(0, 16)
        : '',
      endDate: item.endDate
        ? item.endDate.slice(0, 16)
        : '',
      status: item.status,
    });

    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;

    const dateErr = validateDateRange(
      updateForm.startDate,
      updateForm.endDate
    );

    if (dateErr) {
      toastError(dateErr);
      return;
    }

    setIsUpdateConfirmOpen(true);
  };

  const handleExecuteUpdate = async () => {
    if (!selectedItem) return;

    setIsUpdating(true);

    try {
      const payload = buildProductTariffUpdateRequest({
        productId: updateForm.productId,
        tariffId: Number(updateForm.tariffId),
        startDate: new Date(updateForm.startDate).toISOString(),
        endDate: new Date(updateForm.endDate).toISOString(),
        status: updateForm.status,
      });

      const res = await productTariffService.update(
        selectedItem.productTariffId,
        payload
      );

      success(
        typeof res === 'string'
          ? res
          : 'Ürün tarifesi güncellendi.'
      );

      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : 'Güncelleme başarısız';

      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<ProductTariff>[] = [
    {
      header: 'ID',
      key: 'productTariffId',
      sortKey: 'productTariffId',
      width: '100px',
      sortable: true,
      render: (item) => (
        <span
          style={{
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          {item.productTariffId}
        </span>
      ),
    },

    {
      header: 'Ürün No',
      key: 'productId',
      sortKey: 'productId',
      sortable: true,
      exportValue: (item) => item.product?.productId ?? '',
      render: (item) => (
        <span style={{ fontWeight: 600 }}>
          Ürün {item.product?.productId}
        </span>
      ),
      width: '130px',
    },

    {
      header: 'Tarife Adı',
      key: 'tariffId',
      sortKey: 'tariffId',
      sortable: true,
      exportValue: (item) => item.tariff?.tariffName ?? '',
      render: (item) => (
        <div>
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {item.tariff?.tariffName}
          </span>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Tarife {item.tariff?.tariffId}
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-accent)',
            }}
          >
            {formatCurrency(item.tariff?.tariffPrice)}
          </div>
        </div>
      ),
    },

    {
      header: 'Başlangıç Tarihi',
      key: 'startDate',
      sortKey: 'startDate',
      sortable: true,
      render: (item) => (
        <span
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {formatDate(item.startDate)}
        </span>
      ),
      width: '160px',
    },

    {
      header: 'Bitiş Tarihi',
      key: 'endDate',
      sortKey: 'endDate',
      sortable: true,
      render: (item) => (
        <span
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {formatDate(item.endDate)}
        </span>
      ),
      width: '160px',
    },

    {
      header: 'Durum',
      key: 'status',
      sortKey: 'status',
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
      width: '120px',
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
          Düzenle
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
              <Layers
                size={28}
                color="var(--color-primary)"
              />

              <span>Ürün Tarife Tanımları</span>
            </h2>

            <p className="page-subtitle">
              Ürünlere atanan aktif ve geçmiş tarifeleri
              listeleyin, yeni tarife atayın veya güncelleyin.
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
              Tarife Ata
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
              placeholder="Ürün No veya Tarife Adı ara..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
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
                  label: 'Aktif Olanlar',
                },
                {
                  value: 'PASSIVE',
                  label: 'Pasif Olanlar',
                },
                {
                  value: 'CLOSED',
                  label: 'Kapalı Olanlar',
                },
                {
                  value: 'CANCELED',
                  label: 'İptal Olanlar',
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
              options={productTariffSortOptions}
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
        data={filteredList}
        isLoading={isLoading}
        keyExtractor={(item) => item.productTariffId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="urun_tarifeleri"
        emptyTitle="Ürün Tarifesi Bulunamadı"
        emptyDescription="Kayıtlı ürün tarifesi bulunamadı."
        emptyActionText="Yeni Tarife Ata"
        onEmptyAction={handleOpenCreateModal}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        title="Ürüne Tarife Tanımla"
        maxWidth="560px"
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
              Tarifeyi Ata
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <Select
            label="Ürün Seçiniz"
            required
            options={products.map((p) => ({
              value: String(p.productId),
              label: `Ürün ${p.productId}${p.account
                  ? ` (${p.account.accountName})`
                  : ''
                }`,
            }))}
            value={createForm.productId}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                productId: e.target.value,
              }))
            }
          />

          <Select
            label="Tarife Seçiniz (Geçerlilik Tarihleriyle)"
            required
            options={tariffs.map((t) => ({
              value: String(t.tariffId),
              label: `Tarife ${t.tariffId} — ${t.tariffName
                } — ${formatCurrency(
                  t.tariffPrice
                )} (${formatDateOnly(
                  t.validityStartDate
                )} → ${formatDateOnly(
                  t.validityEndDate
                )})`,
            }))}
            value={createForm.tariffId}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                tariffId: e.target.value,
              }))
            }
          />

          {selectedCreateTariff && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor:
                  'rgba(99, 102, 241, 0.1)',
                border:
                  '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color:
                  'var(--color-text-secondary)',
              }}
            >
              <Info
                size={16}
                color="var(--color-primary)"
                style={{ flexShrink: 0 }}
              />

              <div>
                <strong>
                  Tarife {selectedCreateTariff.tariffId}{' '}
                  — {selectedCreateTariff.tariffName}
                </strong>{' '}
                — Geçerlilik:{' '}

                <span
                  style={{
                    color:
                      'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {formatDateOnly(
                    selectedCreateTariff.validityStartDate
                  )}{' '}
                  →{' '}
                  {formatDateOnly(
                    selectedCreateTariff.validityEndDate
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="grid-2">
            <Input
              label="Başlangıç Tarihi"
              type="datetime-local"
              required
              value={createForm.startDate}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />

            <Input
              label="Bitiş Tarihi"
              type="datetime-local"
              required
              value={createForm.endDate}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() =>
          setIsUpdateModalOpen(false)
        }
        title="Ürün Tarifesi Güncelle"
        maxWidth="560px"
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
              Güncelle
            </Button>
          </>
        }
      >
        {selectedItem && (
          <form onSubmit={handleUpdateSubmit}>
            <Input
              label="Ürün No"
              disabled
              value={`Ürün ${updateForm.productId}`}
            />

            <Select
              label="Tarife Seçiniz (Geçerlilik Tarihleriyle)"
              required
              options={tariffs.map((t) => ({
                value: String(t.tariffId),
                label: `Tarife ${t.tariffId} — ${t.tariffName
                  } — ${formatCurrency(
                    t.tariffPrice
                  )} (${formatDateOnly(
                    t.validityStartDate
                  )} → ${formatDateOnly(
                    t.validityEndDate
                  )})`,
              }))}
              value={updateForm.tariffId}
              onChange={(e) =>
                setUpdateForm((prev) => ({
                  ...prev,
                  tariffId: e.target.value,
                }))
              }
            />

            {selectedUpdateTariff && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor:
                    'rgba(99, 102, 241, 0.1)',
                  border:
                    '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                <Info
                  size={16}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0 }}
                />

                <div>
                  <strong>
                    Tarife {selectedUpdateTariff.tariffId}{' '}
                    — {selectedUpdateTariff.tariffName}
                  </strong>{' '}
                  — Geçerlilik:{' '}

                  <span
                    style={{
                      color:
                        'var(--color-text-primary)',
                      fontWeight: 600,
                    }}
                  >
                    {formatDateOnly(
                      selectedUpdateTariff.validityStartDate
                    )}{' '}
                    →{' '}
                    {formatDateOnly(
                      selectedUpdateTariff.validityEndDate
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="grid-2">
              <Input
                label="Başlangıç Tarihi"
                type="datetime-local"
                required
                value={updateForm.startDate}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />

              <Input
                label="Bitiş Tarihi"
                type="datetime-local"
                required
                value={updateForm.endDate}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>

            <Select
              label="Durum"
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
              value={updateForm.status}
              onChange={(e) =>
                setUpdateForm((prev) => ({
                  ...prev,
                  status: e.target.value as StatusEnum,
                }))
              }
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isCreateConfirmOpen}
        onClose={() => setIsCreateConfirmOpen(false)}
        onConfirm={handleExecuteCreate}
        title="Yeni Ürün Tarifesi Atama"
        message={`Ürün ${createForm.productId} için seçilen tarife atanacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Ata"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="Ürün Tarifesi Güncelleme"
        message={
          selectedItem
            ? `ID: ${selectedItem.productTariffId} numaralı ürün tarifesi kaydını güncellemek istediğinize emin misiniz?`
            : 'Ürün tarifesi güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />
    </div>
  );
};