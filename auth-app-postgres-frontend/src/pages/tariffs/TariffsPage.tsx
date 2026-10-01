import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { tariffService } from '../../services';
import type { Tariff, StatusEnum } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import {
  buildTariffCreateRequest,
  buildTariffUpdateRequest,
} from '../../utils/requestBuilders';
import { validatePrice, validateDateRange } from '../../utils/validators';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';

const tariffSortOptions = [
  { value: 'tariffId', label: 'Sırala: ID' },
  { value: 'tariffCode', label: 'Sırala: Tarife Kodu' },
  { value: 'tariffName', label: 'Sırala: Tarife Adı' },
  { value: 'tariffPrice', label: 'Sırala: Fiyat' },
  { value: 'validityStartDate', label: 'Sırala: Başlangıç' },
  { value: 'validityEndDate', label: 'Sırala: Bitiş' },
  { value: 'status', label: 'Sırala: Durum' },
  { value: 'updatedAt', label: 'Sırala: Güncellenme' },
];

export const TariffsPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('tariffId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    tariffName: '',
    tariffPrice: '',
    validityStartDate: '',
    validityEndDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [updateForm, setUpdateForm] = useState({
    tariffId: 0,
    tariffCode: 0,
    tariffName: '',
    tariffPrice: '',
    validityStartDate: '',
    validityEndDate: '',
    status: 'ACTIVE' as StatusEnum,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tariffToDelete, setTariffToDelete] = useState<Tariff | null>(null);

  const { isTelekom } = useAuth();
  const { success, error: toastError } = useToast();

  const loadTariffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = searchTerm.trim()
        ? await tariffService.search(searchTerm, sortBy, sortDirection)
        : await tariffService.getAll(sortBy, sortDirection);
      setTariffs(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Tarifeler yüklenemedi';
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
        const data = searchTerm.trim()
          ? await tariffService.search(searchTerm, sortBy, sortDirection)
          : await tariffService.getAll(sortBy, sortDirection);
        if (!ignore) {
          setTariffs(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Tarifeler yüklenemedi';
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

  const filteredTariffs = useMemo(() => {
    let result = [...tariffs];

    if (selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === selectedStatus);
    }

    return result;
  }, [tariffs, selectedStatus]);

  const handleOpenCreateModal = () => {
    const defaultStart = new Date().toISOString().slice(0, 16);
    const defaultEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setCreateForm({
      tariffName: '',
      tariffPrice: '',
      validityStartDate: defaultStart,
      validityEndDate: defaultEnd,
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.tariffName.trim() || !createForm.tariffPrice) {
      toastError('Lütfen tarife adı ve fiyatını giriniz.');
      return;
    }

    const priceErr = validatePrice(createForm.tariffPrice);
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
      const payload = buildTariffCreateRequest({
        tariffName: createForm.tariffName,
        tariffPrice: createForm.tariffPrice,
        validityStartDate: new Date(createForm.validityStartDate).toISOString(),
        validityEndDate: new Date(createForm.validityEndDate).toISOString(),
        status: createForm.status,
      });

      const res = await tariffService.create(payload);
      success(typeof res === 'string' ? res : 'Tarife başarıyla oluşturuldu.');
      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadTariffs();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Tarife oluşturulamadı';
      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setUpdateForm({
      tariffId: tariff.tariffId,
      tariffCode: tariff.tariffCode,
      tariffName: tariff.tariffName,
      tariffPrice: String(tariff.tariffPrice),
      validityStartDate: tariff.validityStartDate ? tariff.validityStartDate.slice(0, 16) : '',
      validityEndDate: tariff.validityEndDate ? tariff.validityEndDate.slice(0, 16) : '',
      status: tariff.status,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTariff) return;

    const priceErr = validatePrice(updateForm.tariffPrice);
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
    if (!selectedTariff) return;

    setIsUpdating(true);
    try {
      const payload = buildTariffUpdateRequest({
        tariffName: updateForm.tariffName,
        tariffPrice: updateForm.tariffPrice,
        validityStartDate: new Date(updateForm.validityStartDate).toISOString(),
        validityEndDate: new Date(updateForm.validityEndDate).toISOString(),
        status: updateForm.status,
      });

      const res = await tariffService.update(selectedTariff.tariffId, payload);
      success(typeof res === 'string' ? res : 'Tarife güncellendi.');
      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadTariffs();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Güncelleme başarısız';
      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteDialog = (tariff: Tariff) => {
    setTariffToDelete(tariff);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tariffToDelete) return;
    setIsDeleting(true);
    try {
      const res = await tariffService.delete(tariffToDelete.tariffId);
      success(typeof res === 'string' ? res : 'Tarife silindi.');
      setIsDeleteDialogOpen(false);
      loadTariffs();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Silme başarısız';
      toastError(formatErrorMessage(raw, 'tariff'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Tariff>[] = [
    {
      header: 'Tarife Kodu',
      key: 'tariffCode',
      sortKey: 'tariffCode',
      width: '130px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {item.tariffCode}
        </span>
      ),
    },
    {
      header: 'Tarife Adı',
      key: 'tariffName',
      sortKey: 'tariffName',
      sortable: true,
      render: (item) => <span style={{ fontWeight: 600 }}>{item.tariffName}</span>,
    },
    {
      header: 'Fiyat',
      key: 'tariffPrice',
      sortKey: 'tariffPrice',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
          {formatCurrency(item.tariffPrice)}
        </span>
      ),
      width: '130px',
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
              <Tag size={28} color="var(--color-primary)" />
              <span>Tarife Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Telekomünikasyon tarife planlarını listeleyin, yeni tarife tanımlayın ve güncelleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={loadTariffs}
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
                Yeni Tarife Ekle
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
              placeholder="Tarife Adı veya Kodu ile filtrele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
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
              options={tariffSortOptions}
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
        data={filteredTariffs}
        isLoading={isLoading}
        keyExtractor={(item) => item.tariffId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="tarifeler"
        emptyTitle="Tarife Bulunamadı"
        emptyDescription="Seçilen filtre ve kriterlere uygun tarife bulunamadı."
        emptyActionText={isTelekom ? 'Yeni Tarife Ekle' : undefined}
        onEmptyAction={isTelekom ? handleOpenCreateModal : undefined}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Tarife Oluştur"
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
              Tarifeyi Kaydet
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <Input
            label="Tarife Adı"
            placeholder="Örn: limitsiz 100 Mbps Fiber"
            required
            value={createForm.tariffName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, tariffName: e.target.value }))}
          />

          <Input
            label="Tarife Fiyatı (₺)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            value={createForm.tariffPrice}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, tariffPrice: e.target.value }))}
          />

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
        title="Tarife Güncelle"
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
        {selectedTariff && (
          <form onSubmit={handleUpdateSubmit}>
            <Input
              label="Tarife Adı"
              required
              value={updateForm.tariffName}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, tariffName: e.target.value }))}
            />
            <Input
              label="Tarife Fiyatı (₺)"
              type="number"
              step="0.01"
              min="0"
              required
              value={updateForm.tariffPrice}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, tariffPrice: e.target.value }))}
            />
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
        title="Yeni Tarife Kaydı"
        message={`"${createForm.tariffName}" (${formatCurrency(Number(createForm.tariffPrice))}) tarifesi oluşturulacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Oluştur"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="Tarife Güncelleme"
        message={
          selectedTariff
            ? `"${selectedTariff.tariffName}" tarifesi güncellenecektir. Onaylıyor musunuz?`
            : 'Tarife güncellenecektir. Onaylıyor musunuz?'
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
        title="Tarifeyi Sil"
        message={`"${tariffToDelete?.tariffName}" tarifesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
