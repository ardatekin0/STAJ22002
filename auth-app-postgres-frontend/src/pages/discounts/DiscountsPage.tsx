import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { discountService } from '../../services';
import type { Discount, DiscountEnum, StatusEnum } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { DiscountTypeBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import {
  buildDiscountCreateRequest,
  buildDiscountUpdateRequest,
} from '../../utils/requestBuilders';
import { validatePrice, validatePercentage, validateDateRange } from '../../utils/validators';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Percent,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';

const discountSortOptions = [
  { value: 'discountId', label: 'Sırala: ID' },
  { value: 'discountCode', label: 'Sırala: İndirim Kodu' },
  { value: 'discountName', label: 'Sırala: İndirim Adı' },
  { value: 'discountType', label: 'Sırala: Tür' },
  { value: 'discountPrice', label: 'Sırala: Tutar/Oran' },
  { value: 'validityStartDate', label: 'Sırala: Başlangıç' },
  { value: 'validityEndDate', label: 'Sırala: Bitiş' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'updatedAt', label: 'Sırala: Güncellenme' },
];

export const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('discountId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    discountName: '',
    discountType: 'PERCENTAGE' as DiscountEnum,
    discountPrice: '',
    validityStartDate: '',
    validityEndDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [updateForm, setUpdateForm] = useState({
    discountId: 0,
    discountCode: 0,
    discountName: '',
    discountType: 'PERCENTAGE' as DiscountEnum,
    discountPrice: '',
    validityStartDate: '',
    validityEndDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

  const { isTelekom } = useAuth();
  const { success, error: toastError } = useToast();

  const loadDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = searchTerm.trim()
        ? await discountService.search(searchTerm, sortBy, sortDirection)
        : await discountService.getAll(sortBy, sortDirection);
      setDiscounts(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'İndirimler yüklenemedi';
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
        const data = searchTerm.trim()
          ? await discountService.search(searchTerm, sortBy, sortDirection)
          : await discountService.getAll(sortBy, sortDirection);
        if (!ignore) {
          setDiscounts(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'İndirimler yüklenemedi';
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

  const filteredDiscounts = useMemo(() => {
    let result = [...discounts];

    if (selectedStatus !== 'ALL') {
      result = result.filter((d) => d.status === selectedStatus);
    }

    if (selectedType !== 'ALL') {
      result = result.filter((d) => d.discountType === selectedType);
    }

    return result;
  }, [discounts, selectedStatus, selectedType]);

  const handleOpenCreateModal = () => {
    const defaultStart = new Date().toISOString().slice(0, 16);
    const defaultEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setCreateForm({
      discountName: '',
      discountType: 'PERCENTAGE',
      discountPrice: '',
      validityStartDate: defaultStart,
      validityEndDate: defaultEnd,
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.discountName.trim() || !createForm.discountPrice) {
      toastError('Lütfen indirim adı ve tutarını giriniz.');
      return;
    }

    const priceErr =
      createForm.discountType === 'PERCENTAGE'
        ? validatePercentage(createForm.discountPrice)
        : validatePrice(createForm.discountPrice);

    if (priceErr) {
      toastError(priceErr);
      return;
    }

    const dateErr = validateDateRange(createForm.validityStartDate, createForm.validityEndDate);
    if (dateErr) {
      toastError(dateErr);
      return;
    }

    setIsCreateConfirmOpen(true);
  };

  const handleExecuteCreate = async () => {
    setIsCreating(true);
    try {
      const payload = buildDiscountCreateRequest({
        discountName: createForm.discountName,
        discountType: createForm.discountType,
        discountPrice: createForm.discountPrice,
        validityStartDate: new Date(createForm.validityStartDate).toISOString(),
        validityEndDate: new Date(createForm.validityEndDate).toISOString(),
        status: createForm.status,
      });

      const res = await discountService.create(payload);
      success(typeof res === 'string' ? res : 'İndirim başarıyla oluşturuldu.');
      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadDiscounts();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'İndirim oluşturulamadı';
      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (discount: Discount) => {
    setSelectedDiscount(discount);
    setUpdateForm({
      discountId: discount.discountId,
      discountCode: discount.discountCode,
      discountName: discount.discountName,
      discountType: discount.discountType,
      discountPrice: String(discount.discountPrice),
      validityStartDate: discount.validityStartDate ? discount.validityStartDate.slice(0, 16) : '',
      validityEndDate: discount.validityEndDate ? discount.validityEndDate.slice(0, 16) : '',
      status: discount.status,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscount) return;

    const priceErr =
      updateForm.discountType === 'PERCENTAGE'
        ? validatePercentage(updateForm.discountPrice)
        : validatePrice(updateForm.discountPrice);

    if (priceErr) {
      toastError(priceErr);
      return;
    }

    const dateErr = validateDateRange(updateForm.validityStartDate, updateForm.validityEndDate);
    if (dateErr) {
      toastError(dateErr);
      return;
    }

    setIsUpdateConfirmOpen(true);
  };

  const handleExecuteUpdate = async () => {
    if (!selectedDiscount) return;

    setIsUpdating(true);
    try {
      const payload = buildDiscountUpdateRequest({
        discountName: updateForm.discountName,
        discountType: updateForm.discountType,
        discountPrice: updateForm.discountPrice,
        validityStartDate: new Date(updateForm.validityStartDate).toISOString(),
        validityEndDate: new Date(updateForm.validityEndDate).toISOString(),
        status: updateForm.status,
      });

      const res = await discountService.update(selectedDiscount.discountId, payload);
      success(typeof res === 'string' ? res : 'İndirim güncellendi.');
      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadDiscounts();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Güncelleme başarısız';
      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteDialog = (discount: Discount) => {
    setDiscountToDelete(discount);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!discountToDelete) return;
    setIsDeleting(true);
    try {
      const res = await discountService.delete(discountToDelete.discountId);
      success(typeof res === 'string' ? res : 'İndirim silindi.');
      setIsDeleteDialogOpen(false);
      loadDiscounts();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Silme başarısız';
      toastError(formatErrorMessage(raw, 'discount'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Discount>[] = [
    {
      header: 'İndirim Kodu',
      key: 'discountCode',
      sortKey: 'discountCode',
      width: '130px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {item.discountCode}
        </span>
      ),
    },
    {
      header: 'İndirim Adı',
      key: 'discountName',
      sortKey: 'discountName',
      sortable: true,
      render: (item) => <span style={{ fontWeight: 600 }}>{item.discountName}</span>,
    },
    {
      header: 'Tür',
      key: 'discountType',
      sortKey: 'discountType',
      sortable: true,
      render: (item) => <DiscountTypeBadge type={item.discountType} />,
      width: '130px',
    },
    {
      header: 'Miktar / Oran',
      key: 'discountPrice',
      sortKey: 'discountPrice',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
          {item.discountType === 'PERCENTAGE' ? `%${item.discountPrice}` : formatCurrency(item.discountPrice)}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Başlangıç Tarihi',
      key: 'validityStartDate',
      sortKey: 'validityStartDate',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
          {formatDate(item.validityStartDate)}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'Bitiş Tarihi',
      key: 'validityEndDate',
      sortKey: 'validityEndDate',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
          {formatDate(item.validityEndDate)}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'Durum',
      key: 'status',
      sortKey: 'status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
      width: '120px',
    },
  ];

  if (isTelekom) {
    columns.push({
      header: 'İşlemler',
      align: 'right',
      width: '120px',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUpdateModal(item)}
            leftIcon={<Edit2 size={13} />}
          >
            Düzenle
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenDeleteDialog(item)}
            leftIcon={<Trash2 size={13} />}
          />
        </div>
      ),
    });
  }

  return (
    <div>
      <div className="sticky-control-area">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <Percent size={28} color="var(--color-primary)" />
              <span>İndirim Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Telekomünikasyon indirim tanımlarını (yüzdelik / sabit tutar) listeleyin, yeni indirim oluşturun ve güncelleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={loadDiscounts}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
            >
              Yenile
            </Button>
            {isTelekom && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus size={18} />}
              >
                Yeni İndirim Ekle
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
              placeholder="İndirim Adı veya Kodu ile filtrele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '160px' }}>
            <Select
              options={[
                { value: 'ALL', label: 'Tüm Türler' },
                { value: 'TL', label: 'Tutar İndirimi' },
                { value: 'PERCENTAGE', label: 'Yüzde' },
                { value: 'FIXED', label: 'Sabit Fiyat' },
              ]}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <Select
              options={[
                { value: 'ALL', label: 'Tüm Durumlar' },
                { value: 'ACTIVE', label: 'Aktif' },
                { value: 'PASSIVE', label: 'Pasif' },
                { value: 'CLOSED', label: 'Kapalı' },
                { value: 'CANCELED', label: 'İptal' },
              ]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '175px' }}>
            <Select
              options={discountSortOptions}
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
        data={filteredDiscounts}
        isLoading={isLoading}
        keyExtractor={(item) => item.discountId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="indirimler"
        emptyTitle="İndirim Bulunamadı"
        emptyDescription="Seçilen filtre ve kriterlere uygun indirim bulunamadı."
        emptyActionText={isTelekom ? 'Yeni İndirim Ekle' : undefined}
        onEmptyAction={isTelekom ? handleOpenCreateModal : undefined}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni İndirim Oluştur"
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
              İndirimi Kaydet
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <Input
            label="İndirim Adı"
            placeholder="Örn: Hoşgeldin İndirimi"
            required
            value={createForm.discountName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, discountName: e.target.value }))}
          />

          <div className="grid-2">
            <Select
              label="İndirim Türü"
              required
              options={[
                { value: 'TL', label: 'Tutar İndirimi' },
                { value: 'PERCENTAGE', label: 'Yüzde' },
                { value: 'FIXED', label: 'Sabit Fiyat' },
              ]}
              value={createForm.discountType}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  discountType: e.target.value as DiscountEnum,
                }))
              }
            />

            <Input
              label={
                createForm.discountType === 'PERCENTAGE'
                  ? 'İndirim Oranı (%)'
                  : 'İndirim Tutarı (₺)'
              }
              type="number"
              step="0.01"
              min="0"
              max={createForm.discountType === 'PERCENTAGE' ? 100 : undefined}
              placeholder={createForm.discountType === 'PERCENTAGE' ? '20' : '50.00'}
              required
              value={createForm.discountPrice}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
            />
          </div>

          <div className="grid-2">
            <Input
              label="Geçerlilik Başlangıç"
              type="datetime-local"
              required
              value={createForm.validityStartDate}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, validityStartDate: e.target.value }))
              }
            />

            <Input
              label="Geçerlilik Bitiş"
              type="datetime-local"
              required
              value={createForm.validityEndDate}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, validityEndDate: e.target.value }))
              }
            />
          </div>

          <Select
            label="Durum"
            required
            options={[
              { value: 'ACTIVE', label: 'ACTIVE (Aktif)' },
              { value: 'PASSIVE', label: 'PASSIVE (Pasif)' },
              { value: 'CLOSED', label: 'CLOSED (Kapalı)' },
              { value: 'CANCELED', label: 'CANCELED (İptal)' },
            ]}
            value={createForm.status}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as StatusEnum }))}
          />
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="İndirim Güncelle"
        maxWidth="540px"
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
        {selectedDiscount && (
          <form onSubmit={handleUpdateSubmit}>
            <Input
              label="İndirim Adı"
              required
              value={updateForm.discountName}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, discountName: e.target.value }))}
            />

            <div className="grid-2">
              <Select
                label="İndirim Türü"
                required
                options={[
                  { value: 'TL', label: 'Tutar İndirimi' },
                  { value: 'PERCENTAGE', label: 'Yüzde' },
                  { value: 'FIXED', label: 'Sabit Fiyat' },
                ]}
                value={updateForm.discountType}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    discountType: e.target.value as DiscountEnum,
                  }))
                }
              />

              <Input
                label={
                  updateForm.discountType === 'PERCENTAGE'
                    ? 'İndirim Oranı (%)'
                    : 'İndirim Tutarı (₺)'
                }
                type="number"
                step="0.01"
                min="0"
                max={updateForm.discountType === 'PERCENTAGE' ? 100 : undefined}
                required
                value={updateForm.discountPrice}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
              />
            </div>

            <div className="grid-2">
              <Input
                label="Geçerlilik Başlangıç"
                type="datetime-local"
                required
                value={updateForm.validityStartDate}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, validityStartDate: e.target.value }))}
              />

              <Input
                label="Geçerlilik Bitiş"
                type="datetime-local"
                required
                value={updateForm.validityEndDate}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, validityEndDate: e.target.value }))}
              />
            </div>

            <Select
              label="Durum"
              required
              options={[
                { value: 'ACTIVE', label: 'ACTIVE (Aktif)' },
                { value: 'PASSIVE', label: 'PASSIVE (Pasif)' },
                { value: 'CLOSED', label: 'CLOSED (Kapalı)' },
                { value: 'CANCELED', label: 'CANCELED (İptal)' },
              ]}
              value={updateForm.status}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, status: e.target.value as StatusEnum }))}
            />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isCreateConfirmOpen}
        onClose={() => setIsCreateConfirmOpen(false)}
        onConfirm={handleExecuteCreate}
        title="Yeni İndirim Kaydı"
        message={`"${createForm.discountName}" indirimi oluşturulacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Oluştur"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="İndirim Güncelleme"
        message={
          selectedDiscount
            ? `"${selectedDiscount.discountName}" indirimi güncellenecektir. Onaylıyor musunuz?`
            : 'İndirim güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="İndirimi Sil"
        message={`"${discountToDelete?.discountName}" indirimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
