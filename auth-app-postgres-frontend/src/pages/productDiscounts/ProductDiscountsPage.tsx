import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  productDiscountService,
  productService,
  discountService,
} from '../../services';
import type {
  ProductDiscount,
  Product,
  Discount,
  StatusEnum,
} from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { DiscountTypeBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import {
  buildProductDiscountCreateRequest,
  buildProductDiscountUpdateRequest,
} from '../../utils/requestBuilders';
import { validateDateRange } from '../../utils/validators';
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
} from '../../utils/formatters';
import {
  Percent,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Info,
} from 'lucide-react';

const productDiscountSortOptions = [
  { value: 'productDiscountId', label: 'Sırala: ID' },
  { value: 'productId', label: 'Sırala: Ürün No' },
  { value: 'discountId', label: 'Sırala: İndirim No' },
  { value: 'startDate', label: 'Sırala: Başlangıç' },
  { value: 'endDate', label: 'Sırala: Bitiş' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'updatedAt', label: 'Sırala: Güncellenme' },
];

export const ProductDiscountsPage: React.FC = () => {
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('productDiscountId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    productId: '',
    discountId: '',
    startDate: '',
    endDate: '',
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductDiscount | null>(null);
  const [updateForm, setUpdateForm] = useState({
    productId: 0,
    discountId: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [pdList, prodList, discList] = await Promise.all([
        searchTerm.trim()
          ? productDiscountService.search(searchTerm, sortBy, sortDirection)
          : productDiscountService.getAll(sortBy, sortDirection),
        productService.getByStatus('ACTIVE'),
        discountService.getByStatus('ACTIVE'),
      ]);

      setProductDiscounts(pdList);
      setProducts(prodList);
      setDiscounts(discList);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Veriler yüklenemedi';
      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy, sortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [pdList, prodList, discList] = await Promise.all([
          searchTerm.trim()
            ? productDiscountService.search(searchTerm, sortBy, sortDirection)
            : productDiscountService.getAll(sortBy, sortDirection),
          productService.getByStatus('ACTIVE'),
          discountService.getByStatus('ACTIVE'),
        ]);

        if (!ignore) {
          setProductDiscounts(pdList);
          setProducts(prodList);
          setDiscounts(discList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw =
            err instanceof Error ? err.message : 'Veriler yüklenemedi';

          toastError(formatErrorMessage(raw, 'discount'));
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
    let result = [...productDiscounts];

    if (selectedStatus !== 'ALL') {
      result = result.filter((pd) => pd.status === selectedStatus);
    }

    return result;
  }, [productDiscounts, selectedStatus]);

  const selectedCreateDiscount = useMemo(() => {
    return discounts.find(
      (d) => String(d.discountId) === createForm.discountId
    );
  }, [discounts, createForm.discountId]);

  const selectedUpdateDiscount = useMemo(() => {
    return discounts.find(
      (d) => String(d.discountId) === updateForm.discountId
    );
  }, [discounts, updateForm.discountId]);

  const handleOpenCreateModal = () => {
    const defaultStart = new Date().toISOString().slice(0, 16);

    const defaultEnd = new Date(
      Date.now() + 180 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 16);

    setCreateForm({
      productId:
        products.length > 0 ? String(products[0].productId) : '',
      discountId:
        discounts.length > 0 ? String(discounts[0].discountId) : '',
      startDate: defaultStart,
      endDate: defaultEnd,
    });

    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !createForm.productId ||
      !createForm.discountId ||
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
      const payload = buildProductDiscountCreateRequest({
        productId: Number(createForm.productId),
        discountId: Number(createForm.discountId),
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
      });

      const res = await productDiscountService.create(payload);

      success(
        typeof res === 'string'
          ? res
          : 'Ürün indirimi başarıyla tanımlandı.'
      );

      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : 'Ürün indirimi oluşturulamadı';

      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (item: ProductDiscount) => {
    setSelectedItem(item);

    setUpdateForm({
      productId: item.product.productId,
      discountId: String(item.discount.discountId),
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
      const payload = buildProductDiscountUpdateRequest({
        productId: updateForm.productId,
        discountId: Number(updateForm.discountId),
        startDate: new Date(updateForm.startDate).toISOString(),
        endDate: new Date(updateForm.endDate).toISOString(),
        status: updateForm.status,
      });

      const res = await productDiscountService.update(
        selectedItem.productDiscountId,
        payload
      );

      success(
        typeof res === 'string'
          ? res
          : 'Ürün indirimi güncellendi.'
      );

      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : 'Güncelleme başarısız';

      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<ProductDiscount>[] = [
    {
      header: 'ID',
      key: 'productDiscountId',
      sortKey: 'productDiscountId',
      width: '100px',
      sortable: true,
      render: (item) => (
        <span
          style={{
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          {item.productDiscountId}
        </span>
      ),
    },
    {
      header: 'Ürün No',
      key: 'productId',
      sortKey: 'productId',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 600 }}>
          Ürün {item.product?.productId}
        </span>
      ),
      width: '130px',
    },
    {
      header: 'İndirim Adı',
      key: 'discountId',
      sortKey: 'discountId',
      sortable: true,
      render: (item) => (
        <div>
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {item.discount?.discountName}
          </span>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}
          >
            İndirim {item.discount?.discountId}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              marginTop: '2px',
              alignItems: 'center',
            }}
          >
            <DiscountTypeBadge type={item.discount?.discountType} />

            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}
            >
              {item.discount?.discountType === 'PERCENTAGE'
                ? `%${item.discount?.discountPrice}`
                : formatCurrency(item.discount?.discountPrice)}
            </span>
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
              <Percent
                size={28}
                color="var(--color-primary)"
              />
              <span>Ürün İndirim Tanımları</span>
            </h2>

            <p className="page-subtitle">
              Ürünlere uygulanan aktif ve geçmiş indirim
              kampanyalarını listeleyin, yeni indirim atayın
              veya güncelleyin.
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
              İndirim Tanımla
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
              placeholder="Ürün No veya İndirim Adı ara..."
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
              options={productDiscountSortOptions}
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
        keyExtractor={(item) => item.productDiscountId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="urun_indirimleri"
        emptyTitle="Ürün İndirimi Bulunamadı"
        emptyDescription="Kayıtlı ürün indirimi bulunamadı."
        emptyActionText="Yeni İndirim Tanımla"
        onEmptyAction={handleOpenCreateModal}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Ürüne İndirim Tanımla"
        maxWidth="560px"
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
              İndirimi Uygula
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
            label="İndirim Seçiniz (Geçerlilik Tarihleriyle)"
            required
            options={discounts.map((d) => ({
              value: String(d.discountId),
              label: `İndirim ${d.discountId} — ${d.discountName
                } — ${d.discountType === 'PERCENTAGE'
                  ? '%' + d.discountPrice
                  : formatCurrency(d.discountPrice)
                } (${formatDateOnly(
                  d.validityStartDate
                )} → ${formatDateOnly(
                  d.validityEndDate
                )})`,
            }))}
            value={createForm.discountId}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                discountId: e.target.value,
              }))
            }
          />

          {selectedCreateDiscount && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor:
                  'rgba(16, 185, 129, 0.1)',
                border:
                  '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Info
                size={16}
                color="#10b981"
                style={{ flexShrink: 0 }}
              />

              <div>
                <strong>
                  İndirim {selectedCreateDiscount.discountId} —{' '}
                  {selectedCreateDiscount.discountName}
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
                    selectedCreateDiscount.validityStartDate
                  )}{' '}
                  →{' '}
                  {formatDateOnly(
                    selectedCreateDiscount.validityEndDate
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
        onClose={() => setIsUpdateModalOpen(false)}
        title="Ürün İndirimi Güncelle"
        maxWidth="560px"
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
              label="İndirim Seçiniz (Geçerlilik Tarihleriyle)"
              required
              options={discounts.map((d) => ({
                value: String(d.discountId),
                label: `İndirim ${d.discountId} — ${d.discountName
                  } — ${d.discountType === 'PERCENTAGE'
                    ? '%' + d.discountPrice
                    : formatCurrency(d.discountPrice)
                  } (${formatDateOnly(
                    d.validityStartDate
                  )} → ${formatDateOnly(
                    d.validityEndDate
                  )})`,
              }))}
              value={updateForm.discountId}
              onChange={(e) =>
                setUpdateForm((prev) => ({
                  ...prev,
                  discountId: e.target.value,
                }))
              }
            />

            {selectedUpdateDiscount && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor:
                    'rgba(16, 185, 129, 0.1)',
                  border:
                    '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Info
                  size={16}
                  color="#10b981"
                  style={{ flexShrink: 0 }}
                />

                <div>
                  <strong>
                    İndirim {selectedUpdateDiscount.discountId} —{' '}
                    {selectedUpdateDiscount.discountName}
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
                      selectedUpdateDiscount.validityStartDate
                    )}{' '}
                    →{' '}
                    {formatDateOnly(
                      selectedUpdateDiscount.validityEndDate
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
        title="Yeni Ürün İndirimi Tanımlama"
        message={`Ürün ${createForm.productId} için seçilen indirim tanımlanacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Tanımla"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="Ürün İndirimi Güncelleme"
        message={
          selectedItem
            ? `ID: ${selectedItem.productDiscountId} numaralı ürün indirimi kaydını güncellemek istediğinize emin misiniz?`
            : 'Ürün indirimi güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />
    </div>
  );
};