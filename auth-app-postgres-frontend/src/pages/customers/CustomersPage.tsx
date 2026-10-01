import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { customerService } from '../../services';
import type { Customer, CustomerEnum, StatusEnum } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { CustomerTypeBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import {
  buildCustomerCreateRequest,
  type CustomerFormData,
} from '../../utils/requestBuilders';
import {
  validateName,
  validateTckn,
  validateVkn,
} from '../../utils/validators';
import { formatDate } from '../../utils/formatters';
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Users,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const [sortBy, setSortBy] = useState<string>('customerId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customerName: '',
    customerLastName: '',
    customerType: 'INDIVIDUAL',
    tckn: '',
    vkn: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<StatusEnum>('ACTIVE');

  const { success, error: toastError } = useToast();

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = searchTerm.trim()
        ? await customerService.search(searchTerm, sortBy, sortDirection)
        : await customerService.getAll(sortBy, sortDirection);
      setCustomers(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Müşteriler yüklenemedi';
      toastError(formatErrorMessage(raw, 'customer'));
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
          ? await customerService.search(searchTerm, sortBy, sortDirection)
          : await customerService.getAll(sortBy, sortDirection);
        if (!ignore) {
          setCustomers(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Müşteriler yüklenemedi';
          toastError(formatErrorMessage(raw, 'customer'));
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

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (c) => c.status?.toString().toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    if (selectedType !== 'ALL') {
      result = result.filter(
        (c) => c.customerType?.toString().toUpperCase() === selectedType.toUpperCase()
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'customerId': {
          comparison = (a.customerId || 0) - (b.customerId || 0);
          break;
        }
        case 'customerName': {
          const nameA = `${a.customerName || ''} ${a.customerLastName || ''}`.trim();
          const nameB = `${b.customerName || ''} ${b.customerLastName || ''}`.trim();
          comparison = nameA.localeCompare(nameB, 'tr', { sensitivity: 'base' });
          break;
        }
        case 'customerType': {
          const typeA = a.customerType || '';
          const typeB = b.customerType || '';
          comparison = typeA.localeCompare(typeB, 'tr', { sensitivity: 'base' });
          break;
        }
        case 'tcknVkn': {
          const idA = a.tckn || a.vkn || '';
          const idB = b.tckn || b.vkn || '';
          comparison = idA.localeCompare(idB, 'tr', { numeric: true });
          break;
        }
        case 'status': {
          const statusA = a.status || '';
          const statusB = b.status || '';
          comparison = statusA.localeCompare(statusB, 'tr', { sensitivity: 'base' });
          break;
        }
        case 'createdDate': {
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        default:
          comparison = 0;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [customers, selectedStatus, selectedType, sortBy, sortDirection]);

  const handleOpenCreateModal = () => {
    setFormData({
      customerName: '',
      customerLastName: '',
      customerType: 'INDIVIDUAL',
      tckn: '',
      vkn: '',
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateName(formData.customerName);
    const lastNameErr = validateName(formData.customerLastName);
    const identityErr =
      formData.customerType === 'INDIVIDUAL'
        ? validateTckn(formData.tckn || '')
        : validateVkn(formData.vkn || '');

    if (nameErr || lastNameErr || identityErr) {
      setFormErrors({
        customerName: nameErr,
        customerLastName: lastNameErr,
        identity: identityErr,
      });
      return;
    }

    setFormErrors({});
    setIsCreateConfirmOpen(true);
  };

  const handleExecuteCreate = async () => {
    setIsCreating(true);

    try {
      const requestPayload = buildCustomerCreateRequest(formData);
      const res = await customerService.create(requestPayload);
      success(typeof res === 'string' ? res : 'Müşteri başarıyla oluşturuldu.');
      setIsCreateConfirmOpen(false);
      setIsCreateModalOpen(false);
      loadCustomers();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Müşteri oluşturulamadı';
      toastError(formatErrorMessage(raw, 'customer'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenUpdateModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setUpdatedStatus(customer.status);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsUpdateConfirmOpen(true);
  };

  const handleExecuteUpdateStatus = async () => {
    if (!selectedCustomer) return;

    setIsUpdating(true);
    try {
      const res = await customerService.updateStatus(selectedCustomer.customerId, updatedStatus);
      success(typeof res === 'string' ? res : 'Müşteri durumu güncellendi.');
      setIsUpdateConfirmOpen(false);
      setIsUpdateModalOpen(false);
      loadCustomers();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Güncelleme başarısız';
      toastError(formatErrorMessage(raw, 'customer'));
    } finally {
      setIsUpdating(false);
    }
  };

  const customerSortOptions = [
    { value: 'customerId', label: 'Sırala: Müşteri No' },
    { value: 'customerName', label: 'Sırala: Müşteri Adı' },
    { value: 'customerType', label: 'Sırala: Müşteri Tipi' },
    { value: 'tcknVkn', label: 'Sırala: TCKN / VKN' },
    { value: 'status', label: 'Sırala: Durum' },
    { value: 'createdDate', label: 'Sırala: Kayıt Tarihi' },
  ];

  const columns: Column<Customer>[] = [
    {
      header: 'Müşteri No',
      key: 'customerId',
      sortKey: 'customerId',
      width: '140px',
      sortable: true,
      render: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {item.customerId}
        </span>
      ),
    },
    {
      header: 'Adı Soyadı',
      key: 'customerName',
      sortKey: 'customerName',
      sortable: true,
      sortAccessor: (item) => `${item.customerName} ${item.customerLastName}`,
      render: (item) => (
        <span style={{ fontWeight: 600 }}>
          {item.customerName} {item.customerLastName}
        </span>
      ),
    },
    {
      header: 'Tür',
      key: 'customerType',
      sortKey: 'customerType',
      sortable: true,
      render: (item) => <CustomerTypeBadge type={item.customerType} />,
      width: '130px',
    },
    {
      header: 'TCKN / VKN',
      sortKey: 'tcknVkn',
      sortable: true,
      sortAccessor: (item) => item.tckn || item.vkn || '',
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {item.customerType === 'INDIVIDUAL' ? item.tckn || '-' : item.vkn || '-'}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Durum',
      key: 'status',
      sortKey: 'status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
      width: '120px',
    },
    {
      header: 'Kayıt Tarihi',
      key: 'createdDate',
      sortKey: 'createdDate',
      sortable: true,
      render: (item) => (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
          {formatDate(item.createdDate)}
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
          onClick={() => handleOpenUpdateModal(item)}
          leftIcon={<Edit2 size={14} />}
          title="Durum Güncelle"
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
              <Users size={28} color="var(--color-primary)" />
              <span>Müşteri Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Bireysel ve kurumsal abone kayıtlarını listeleyin, yeni müşteri oluşturun ve durumlarını güncelleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={loadCustomers}
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
              Yeni Müşteri
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
          <div style={{ flex: '1 1 230px', minWidth: '200px' }}>
            <Input
              placeholder="Müşteri No, İsim (örn: Arda Tekin) veya TCKN/VKN ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <Select
              options={[
                { value: 'ALL', label: 'Tüm Tipler' },
                { value: 'INDIVIDUAL', label: 'Bireysel' },
                { value: 'CORPORATE', label: 'Kurumsal' },
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
              options={customerSortOptions}
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
        data={filteredCustomers}
        isLoading={isLoading}
        keyExtractor={(item) => item.customerId}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDirection(direction);
        }}
        exportFileName="musteriler"
        emptyTitle="Müşteri Bulunamadı"
        emptyDescription={
          searchTerm || selectedStatus !== 'ALL' || selectedType !== 'ALL'
            ? 'Arama kriterlerinize uygun müşteri kaydı bulunamadı.'
            : 'Sistemde henüz kayıtlı müşteri bulunmuyor.'
        }
        emptyActionText="Yeni Müşteri Ekle"
        onEmptyAction={handleOpenCreateModal}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Müşteri Kaydı"
        maxWidth="520px"
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
              Müşteriyi Kaydet
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid-2">
            <Input
              label="Müşteri Adı"
              required
              value={formData.customerName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, customerName: e.target.value }));
                if (formErrors.customerName) setFormErrors((prev) => ({ ...prev, customerName: null }));
              }}
              error={formErrors.customerName}
              placeholder="Örn: Ahmet"
            />

            <Input
              label="Müşteri Soyadı"
              required
              value={formData.customerLastName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, customerLastName: e.target.value }));
                if (formErrors.customerLastName)
                  setFormErrors((prev) => ({ ...prev, customerLastName: null }));
              }}
              error={formErrors.customerLastName}
              placeholder="Örn: Yılmaz"
            />
          </div>

          <Select
            label="Müşteri Tipi"
            required
            options={[
              { value: 'INDIVIDUAL', label: 'Bireysel (TCKN)' },
              { value: 'CORPORATE', label: 'Kurumsal (VKN)' },
            ]}
            value={formData.customerType}
            onChange={(e) => {
              const type = e.target.value as CustomerEnum;
              setFormData((prev) => ({
                ...prev,
                customerType: type,
                tckn: '',
                vkn: '',
              }));
              if (formErrors.identity) setFormErrors((prev) => ({ ...prev, identity: null }));
            }}
          />

          {formData.customerType === 'INDIVIDUAL' ? (
            <Input
              label="TCKN (T.C. Kimlik No)"
              required
              maxLength={11}
              value={formData.tckn || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData((prev) => ({ ...prev, tckn: val }));
                if (formErrors.identity) setFormErrors((prev) => ({ ...prev, identity: null }));
              }}
              error={formErrors.identity}
              placeholder="11 haneli TCKN girin"
              hint="Tam 11 rakamdan oluşmalıdır"
            />
          ) : (
            <Input
              label="VKN (Vergi Kimlik No)"
              required
              maxLength={10}
              value={formData.vkn || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData((prev) => ({ ...prev, vkn: val }));
                if (formErrors.identity) setFormErrors((prev) => ({ ...prev, identity: null }));
              }}
              error={formErrors.identity}
              placeholder="10 haneli VKN girin"
              hint="Tam 10 rakamdan oluşmalıdır"
            />
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Müşteri Durumu Güncelle"
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
              onClick={handleUpdateStatusSubmit}
              isLoading={isUpdating}
            >
              Durumu Güncelle
            </Button>
          </>
        }
      >
        {selectedCustomer && (
          <form onSubmit={handleUpdateStatusSubmit}>
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Müşteri:</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {selectedCustomer.customerName} {selectedCustomer.customerLastName} ({selectedCustomer.customerId})
              </div>
            </div>

            <Select
              label="Yeni Müşteri Durumu"
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
        title="Yeni Müşteri Kaydı"
        message={`${formData.customerName} ${formData.customerLastName} isimli yeni müşteri kaydı oluşturulacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Oluştur"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={isUpdateConfirmOpen}
        onClose={() => setIsUpdateConfirmOpen(false)}
        onConfirm={handleExecuteUpdateStatus}
        title="Müşteri Durumu Güncelleme"
        message={
          selectedCustomer
            ? `${selectedCustomer.customerName} ${selectedCustomer.customerLastName} (${selectedCustomer.customerId}) müşterisinin durumu '${updatedStatus}' olarak güncellenecektir. Onaylıyor musunuz?`
            : 'Müşteri durumu güncellenecektir. Onaylıyor musunuz?'
        }
        confirmText="Evet, Güncelle"
        cancelText="İptal"
        variant="primary"
        isLoading={isUpdating}
      />
    </div>
  );
};
