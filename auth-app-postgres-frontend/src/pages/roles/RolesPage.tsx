import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { roleService, authService } from '../../services';
import type { Role, User } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Users,
  UserPlus,
  Shield,
  Trash2,
  Lock,
  User as UserIcon,
  Mail,
  UserCog,
} from 'lucide-react';

const userSortOptions = [
  { value: 'kullaniciAdi', label: 'Sırala: Kullanıcı Adı' },
  { value: 'ePosta', label: 'Sırala: E-Posta' },
];

const roleSortOptions = [
  { value: 'ad', label: 'Sırala: Rol Adı' },
  { value: 'id', label: 'Sırala: ID' },
  { value: 'aciklama', label: 'Sırala: Açıklama' },
];

export const RolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const [callCenterUsers, setCallCenterUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSortBy, setUserSortBy] = useState<string>('kullaniciAdi');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleSortBy, setRoleSortBy] = useState<string>('ad');
  const [roleSortDirection, setRoleSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [userErrors, setUserErrors] = useState<{
    kullaniciAdi?: string | null;
    ePosta?: string | null;
    sifre?: string | null;
  }>({});

  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState('');

  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isCreateRoleConfirmOpen, setIsCreateRoleConfirmOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const { success, error: toastError } = useToast();

  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const data = roleSearchTerm.trim()
        ? await roleService.search(roleSearchTerm, roleSortBy, roleSortDirection)
        : await roleService.getAll(roleSortBy, roleSortDirection);
      setRoles(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Roller yüklenemedi';
      toastError(formatErrorMessage(raw, 'role'));
    } finally {
      setIsLoadingRoles(false);
    }
  }, [roleSearchTerm, roleSortBy, roleSortDirection, toastError]);

  const loadCallCenterUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = userSearchTerm.trim()
        ? await authService.search(userSearchTerm, userSortBy, userSortDirection)
        : await authService.getCallCenterUsers(userSortBy, userSortDirection);
      setCallCenterUsers(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi';
      toastError(formatErrorMessage(raw));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userSearchTerm, userSortBy, userSortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoadingUsers(true);
      try {
        const data = userSearchTerm.trim()
          ? await authService.search(userSearchTerm, userSortBy, userSortDirection)
          : await authService.getCallCenterUsers(userSortBy, userSortDirection);
        if (!ignore) {
          setCallCenterUsers(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi';
          toastError(formatErrorMessage(raw));
        }
      } finally {
        if (!ignore) {
          setIsLoadingUsers(false);
        }
      }
    }, userSearchTerm.trim() ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [userSearchTerm, userSortBy, userSortDirection, toastError]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setIsLoadingRoles(true);
      try {
        const data = roleSearchTerm.trim()
          ? await roleService.search(roleSearchTerm, roleSortBy, roleSortDirection)
          : await roleService.getAll(roleSortBy, roleSortDirection);
        if (!ignore) {
          setRoles(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const raw = err instanceof Error ? err.message : 'Roller yüklenemedi';
          toastError(formatErrorMessage(raw, 'role'));
        }
      } finally {
        if (!ignore) {
          setIsLoadingRoles(false);
        }
      }
    }, roleSearchTerm.trim() ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [roleSearchTerm, roleSortBy, roleSortDirection, toastError]);

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uErr = validateUsername(newUsername);
    const mErr = validateEmail(newEmail);
    const pErr = validatePassword(newPassword);

    if (uErr || mErr || pErr) {
      setUserErrors({
        kullaniciAdi: uErr,
        ePosta: mErr,
        sifre: pErr,
      });
      return;
    }

    setUserErrors({});
    setIsCreatingUser(true);

    try {
      const res = await authService.register({
        kullaniciAdi: newUsername.trim(),
        ePosta: newEmail.trim(),
        sifre: newPassword,
        rol: newUserRole.trim() ? newUserRole.trim() : undefined,
      });

      success(typeof res === 'string' ? res : 'Kullanıcı başarıyla oluşturuldu.');
      setIsCreateUserModalOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewUserRole('');
      loadCallCenterUsers();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı';
      toastError(formatErrorMessage(raw));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleOpenChangeRole = (user: User) => {
    setSelectedUserForRole(user);

    setTargetRole(user.roller && user.roller.length > 0 ? user.roller[0] : (roles[0]?.ad || 'ROLE_CALL_CENTER'));
    setIsChangeRoleModalOpen(true);
  };

  const handleExecuteChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole || !targetRole.trim()) {
      toastError('Lütfen bir hedef rol seçiniz.');
      return;
    }

    setIsChangingRole(true);
    try {
      const res = await authService.updateUserRole(selectedUserForRole.kullaniciAdi, targetRole.trim());
      success(typeof res === 'string' ? res : 'Kullanıcı rolü başarıyla güncellendi.');
      setIsChangeRoleModalOpen(false);
      setSelectedUserForRole(null);
      loadCallCenterUsers();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Rol güncellenemedi';
      toastError(formatErrorMessage(raw));
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleOpenDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteUserConfirmOpen(true);
  };

  const handleExecuteDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const res = await authService.deleteUser(userToDelete.kullaniciAdi);
      success(typeof res === 'string' ? res : 'Kullanıcı başarıyla silindi.');
      setIsDeleteUserConfirmOpen(false);
      setUserToDelete(null);
      loadCallCenterUsers();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Kullanıcı silinemedi';
      toastError(formatErrorMessage(raw));
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toastError('Lütfen bir rol adı giriniz.');
      return;
    }
    setIsCreateRoleConfirmOpen(true);
  };

  const handleExecuteCreateRole = async () => {
    setIsCreatingRole(true);
    try {
      const res = await roleService.addRole({
        ad: newRoleName.trim(),
        aciklama: newRoleDesc.trim(),
      });
      success(typeof res === 'string' ? res : 'Rol başarıyla eklendi.');
      setIsCreateRoleConfirmOpen(false);
      setIsCreateRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      loadRoles();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Rol eklenemedi';
      toastError(formatErrorMessage(raw, 'role'));
    } finally {
      setIsCreatingRole(false);
    }
  };

  const dynamicRoleOptions = useMemo(() => {
    const defaultOption = { value: '', label: 'Varsayılan Rol (ROLE_CALL_CENTER)' };
    const mapped = roles.map((r) => ({
      value: r.ad,
      label: r.aciklama ? `${r.ad} — ${r.aciklama}` : r.ad,
    }));
    return [defaultOption, ...mapped];
  }, [roles]);

  const targetRoleOptions = useMemo(() => {
    if (roles.length === 0) {
      return [
        { value: 'ROLE_CALL_CENTER', label: 'ROLE_CALL_CENTER' },
        { value: 'ROLE_TELEKOM', label: 'ROLE_TELEKOM' },
      ];
    }
    return roles.map((r) => ({
      value: r.ad,
      label: r.aciklama ? `${r.ad} — ${r.aciklama}` : r.ad,
    }));
  }, [roles]);

  const userColumns: Column<User>[] = [
    {
      header: 'Kullanıcı Adı',
      key: 'kullaniciAdi',
      sortKey: 'kullaniciAdi',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {item.kullaniciAdi ? item.kullaniciAdi.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {item.kullaniciAdi}
          </span>
        </div>
      ),
    },
    {
      header: 'E-Posta',
      key: 'ePosta',
      sortKey: 'ePosta',
      sortable: true,
      exportValue: (item) => item.eposta || item.ePosta || '',
      render: (item) => (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {item.eposta || item.ePosta || '-'}
        </span>
      ),
    },
    {
      header: 'Roller',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {item.roller && item.roller.length > 0 ? (
            item.roller.map((rol) => (
              <span key={rol} className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                {rol}
              </span>
            ))
          ) : (
            <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
              Rol Yok
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Durum',
      key: 'status',
      sortable: false,
      render: (item) => (
        <StatusBadge status={item.status || 'ACTIVE'} />
      ),
      width: '120px',
    },
    {
      header: 'İşlemler',
      align: 'right',
      width: '180px',
      sortable: false,
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenChangeRole(item)}
            leftIcon={<UserCog size={14} />}
            title="Kullanıcı rolünü değiştir"
          >
            Rol Değiştir
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenDeleteUser(item)}
            leftIcon={<Trash2 size={14} />}
            title="Kullanıcıyı sil"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  const roleColumns: Column<Role>[] = [
    {
      header: 'Rol ID',
      key: 'id',
      sortKey: 'id',
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
          {item.id}
        </span>
      ),
      width: '280px',
    },
    {
      header: 'Rol Adı',
      key: 'ad',
      sortKey: 'ad',
      sortable: true,
      render: (item) => (
        <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
          {item.ad}
        </span>
      ),
      width: '220px',
    },
    {
      header: 'Açıklama',
      key: 'aciklama',
      sortKey: 'aciklama',
      sortable: true,
      render: (item) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>{item.aciklama || '-'}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="sticky-control-area">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <ShieldCheck size={28} color="var(--color-primary)" />
              <span>Kullanıcı & Rol Yönetimi</span>
            </h2>
            <p className="page-subtitle">
              Çağrı merkezi çalışanlarının yetki ve rol yönetimini gerçekleştirin, yeni kullanıcı tanımlayın veya sistem rollerini inceleyin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {activeTab === 'users' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={loadCallCenterUsers}
                  isLoading={isLoadingUsers}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Yenile
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsCreateUserModalOpen(true)}
                  leftIcon={<UserPlus size={18} />}
                >
                  Yeni Kullanıcı Ekle
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={loadRoles}
                  isLoading={isLoadingRoles}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Yenile
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsCreateRoleModalOpen(true)}
                  leftIcon={<Plus size={18} />}
                >
                  Yeni Rol Ekle
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            paddingBottom: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'users' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={18} />
            <span>Çağrı Merkezi Kullanıcıları ({callCenterUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === 'roles' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'roles' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'roles' ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={18} />
            <span>Sistem Rolleri ({roles.length})</span>
          </button>
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
          {activeTab === 'users' ? (
            <>
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <Input
                  placeholder="Kullanıcı adı, e-posta veya rol ara..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                  style={{ margin: 0 }}
                />
              </div>

              <div style={{ width: '175px' }}>
                <Select
                  options={userSortOptions}
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>

              <div style={{ width: '140px' }}>
                <Select
                  options={[
                    { value: 'asc', label: 'Artan (A-Z)' },
                    { value: 'desc', label: 'Azalan (Z-A)' },
                  ]}
                  value={userSortDirection}
                  onChange={(e) => setUserSortDirection(e.target.value as 'asc' | 'desc')}
                  style={{ margin: 0 }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <Input
                  placeholder="Rol adı veya açıklama ara..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                  style={{ margin: 0 }}
                />
              </div>

              <div style={{ width: '175px' }}>
                <Select
                  options={roleSortOptions}
                  value={roleSortBy}
                  onChange={(e) => setRoleSortBy(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>

              <div style={{ width: '140px' }}>
                <Select
                  options={[
                    { value: 'asc', label: 'Artan (A-Z)' },
                    { value: 'desc', label: 'Azalan (Z-A)' },
                  ]}
                  value={roleSortDirection}
                  onChange={(e) => setRoleSortDirection(e.target.value as 'asc' | 'desc')}
                  style={{ margin: 0 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <DataTable
          columns={userColumns}
          data={callCenterUsers}
          isLoading={isLoadingUsers}
          keyExtractor={(item) => item.id || item.kullaniciAdi}
          sortBy={userSortBy}
          sortDirection={userSortDirection}
          onSortChange={(field, direction) => {
            setUserSortBy(field);
            setUserSortDirection(direction);
          }}
          exportFileName="cagri_merkezi_kullanicilari"
          emptyTitle="Kullanıcı Bulunamadı"
          emptyDescription="Kayıtlı çağrı merkezi kullanıcısı bulunamadı."
          emptyActionText="Yeni Kullanıcı Ekle"
          onEmptyAction={() => setIsCreateUserModalOpen(true)}
        />
      ) : (
        <DataTable
          columns={roleColumns}
          data={roles}
          isLoading={isLoadingRoles}
          keyExtractor={(item) => item.id}
          sortBy={roleSortBy}
          sortDirection={roleSortDirection}
          onSortChange={(field, direction) => {
            setRoleSortBy(field);
            setRoleSortDirection(direction);
          }}
          exportFileName="roller"
          emptyTitle="Rol Bulunamadı"
          emptyDescription="Kayıtlı sistem rolü bulunamadı."
          emptyActionText="Yeni Rol Ekle"
          onEmptyAction={() => setIsCreateRoleModalOpen(true)}
        />
      )}

      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title="Yeni Kullanıcı Oluştur"
        maxWidth="500px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateUserModalOpen(false)}
              disabled={isCreatingUser}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUserSubmit}
              isLoading={isCreatingUser}
              leftIcon={<UserPlus size={16} />}
            >
              Kullanıcıyı Kaydet
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUserSubmit}>
          <Input
            label="Kullanıcı Adı"
            type="text"
            required
            autoComplete="username"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              if (userErrors.kullaniciAdi) setUserErrors((prev) => ({ ...prev, kullaniciAdi: null }));
            }}
            error={userErrors.kullaniciAdi}
            hint="Boşluk içeremez, en az 3 karakter olmalıdır"
            leftIcon={<UserIcon size={18} />}
            placeholder="Örn: cagri_ahmet"
          />

          <Input
            label="E-Posta"
            type="email"
            required
            autoComplete="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              if (userErrors.ePosta) setUserErrors((prev) => ({ ...prev, ePosta: null }));
            }}
            error={userErrors.ePosta}
            hint="Boşluk içeremez, geçerli e-posta formatında olmalıdır"
            leftIcon={<Mail size={18} />}
            placeholder="ahmet@sirket.com"
          />

          <Input
            label="Şifre"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (userErrors.sifre) setUserErrors((prev) => ({ ...prev, sifre: null }));
            }}
            error={userErrors.sifre}
            hint="Boşluk içeremez, en az 6 karakter olmalıdır"
            leftIcon={<Lock size={18} />}
            placeholder="••••••••"
          />

          <Select
            label="Kullanıcı Rolü"
            options={dynamicRoleOptions}
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            hint="Rol seçilmezse backend varsayılan olarak ROLE_CALL_CENTER atayacaktır"
          />
        </form>
      </Modal>

      <Modal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        title="Kullanıcı Rolü Değiştir"
        maxWidth="460px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsChangeRoleModalOpen(false)}
              disabled={isChangingRole}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteChangeRole}
              isLoading={isChangingRole}
              leftIcon={<Shield size={16} />}
            >
              Rolü Güncelle
            </Button>
          </>
        }
      >
        <form onSubmit={handleExecuteChangeRole}>
          {selectedUserForRole && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'var(--color-bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Seçili Kullanıcı:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedUserForRole.kullaniciAdi}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Mevcut Rol:{' '}
                  <strong>
                    {selectedUserForRole.roller && selectedUserForRole.roller.length > 0
                      ? selectedUserForRole.roller.join(', ')
                      : 'Rol Yok'}
                  </strong>
                </div>
              </div>

              <Select
                label="Yeni Rol Seçiniz"
                required
                options={targetRoleOptions}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                hint="Kullanıcıya atanacak yeni sistem rolü"
              />
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteUserConfirmOpen}
        onClose={() => setIsDeleteUserConfirmOpen(false)}
        onConfirm={handleExecuteDeleteUser}
        title="Kullanıcı Silme İşlemi"
        message={`"${userToDelete?.kullaniciAdi}" adlı kullanıcı kalıcı olarak silinecektir. Bu işlemi onaylıyor musunuz?`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
        isLoading={isDeletingUser}
      />

      <Modal
        isOpen={isCreateRoleModalOpen}
        onClose={() => setIsCreateRoleModalOpen(false)}
        title="Yeni Sistem Rolü Ekle"
        maxWidth="480px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateRoleModalOpen(false)}
              disabled={isCreatingRole}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRoleSubmit}
              isLoading={isCreatingRole}
            >
              Rolü Kaydet
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRoleSubmit}>
          <Input
            label="Rol Adı"
            required
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Örn: ROLE_CLOSED"
            hint="Genellikle ROLE_ ön ekiyle başlar"
          />

          <Input
            label="Rol Açıklaması"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            placeholder="Rolün görev ve yetki tanımı"
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isCreateRoleConfirmOpen}
        onClose={() => setIsCreateRoleConfirmOpen(false)}
        onConfirm={handleExecuteCreateRole}
        title="Rol Oluşturma"
        message={`"${newRoleName.trim()}" rolü sisteme eklenecektir. Onaylıyor musunuz?`}
        confirmText="Evet, Oluştur"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isCreatingRole}
      />
    </div>
  );
};
