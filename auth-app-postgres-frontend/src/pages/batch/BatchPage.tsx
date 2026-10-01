import React, { useState } from 'react';
import { batchService } from '../../services';
import type { BatchJob } from '../../types';
import { BatchStatusBadge, BatchTypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { formatErrorMessage } from '../../utils/errorFormatter';
import { formatDate } from '../../utils/formatters';
import {
  Cpu,
  Upload,
  Search,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { downloadBatchCustomerTemplate } from '../../utils/excelExporter';

export const BatchPage: React.FC = () => {
  const [jobIdInput, setJobIdInput] = useState('');
  const [isSearchingJob, setIsSearchingJob] = useState(false);
  const [queriedJob, setQueriedJob] = useState<BatchJob | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedJobId, setLastUploadedJobId] = useState<number | null>(null);

  const { success, error: toastError } = useToast();

  const handleSearchJob = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobIdInput.trim()) {
      toastError('Lütfen sorgulamak istediğiniz Job ID değerini giriniz.');
      return;
    }

    setIsSearchingJob(true);
    try {
      const job = await batchService.getJob(Number(jobIdInput));
      setQueriedJob(job);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'İş kaydı bulunamadı';
      toastError(formatErrorMessage(raw, 'batch'));
      setQueriedJob(null);
    } finally {
      setIsSearchingJob(false);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toastError('Lütfen bir Excel (.xlsx / .xls) dosyası seçiniz.');
      return;
    }

    setIsUploadConfirmOpen(true);
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const res = await batchService.uploadExcel(selectedFile);
      success(typeof res === 'string' ? res : 'Excel dosyası yüklendi ve toplu işlem başlatıldı.');

      const match = typeof res === 'string' ? res.match(/Job\s*Id:\s*(\d+)/i) : null;
      if (match && match[1]) {
        const jobId = Number(match[1]);
        setLastUploadedJobId(jobId);
        setJobIdInput(String(jobId));

        batchService.getJob(jobId).then((j) => setQueriedJob(j)).catch(() => {});
      }

      setIsUploadConfirmOpen(false);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Dosya yükleme başarısız';
      toastError(formatErrorMessage(raw, 'batch'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Cpu size={28} color="var(--color-primary)" />
            <span>Toplu İşlem (Batch) Merkezi</span>
          </h2>
          <p className="page-subtitle">
            Excel üzerinden müşteri toplu veri aktarımlarını başlatın ve kuyruk/iş durumlarını sorgulayın.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={downloadBatchCustomerTemplate}
            leftIcon={<FileDown size={16} />}
            title="Kabul edilen formatta boş Excel şablonunu indirin"
          >
            Örnek Şablonu İndir
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Upload size={18} />}
          >
            Excel İle Müşteri Yükle
          </Button>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          İş (Job) Durumu Sorgulama
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Çalışan veya tamamlanan bir batch işleminin durumunu öğrenmek için Job ID numarasını giriniz.
        </p>

        <form onSubmit={handleSearchJob} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Örn: 101"
              value={jobIdInput}
              onChange={(e) => setJobIdInput(e.target.value)}
              type="number"
              min="1"
              leftIcon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleSearchJob}
            isLoading={isSearchingJob}
            leftIcon={<Search size={16} />}
          >
            Sorgula
          </Button>
        </form>

        {lastUploadedJobId && (
          <div
            style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-success)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>
              Son yüklenen işlem Job ID: <strong>{lastUploadedJobId}</strong>
            </span>
          </div>
        )}
      </div>

      {queriedJob && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>İş Numarası</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Job {queriedJob.id}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <BatchTypeBadge type={queriedJob.batchJobType} />
              <BatchStatusBadge status={queriedJob.jobStatus} />
            </div>
          </div>

          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Oluşturulma Zamanı</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                {formatDate(queriedJob.createdAt)}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Başlama Zamanı</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                {formatDate(queriedJob.startedAt)}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bitiş / Tamamlanma</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                {formatDate(queriedJob.completedAt)}
              </div>
            </div>
          </div>

          {queriedJob.errorMessage && (
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                  İşlem Hatası:
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
                  {formatErrorMessage(queriedJob.errorMessage, 'batch')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Excel İle Toplu Müşteri Yükleme"
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadSubmit}
              isLoading={isUploading}
              leftIcon={<Upload size={16} />}
            >
              Yükle ve Başlat
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Toplu müşteri kaydı için hazırladığınız Excel dosyasını yükleyin. Yükleme sonrası işlem arka planda asenkron
              olarak çalıştırılacaktır.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={downloadBatchCustomerTemplate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  color: 'var(--color-primary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                <FileDown size={14} />
                <span>Örnek Excel şablonunu indirmek için tıklayınız</span>
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Excel Dosyası (.xlsx / .xls) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-input)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <FileSpreadsheet size={40} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                {selectedFile ? selectedFile.name : 'Dosya Seçin veya Sürükleyin'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Yalnızca .xlsx ve .xls formatları desteklenmektedir'}
              </div>
              <input
                id="file-upload-input"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isUploadConfirmOpen}
        onClose={() => setIsUploadConfirmOpen(false)}
        onConfirm={handleExecuteUpload}
        title="Toplu Müşteri Yükleme"
        message={
          selectedFile
            ? `"${selectedFile.name}" dosyası yüklenerek toplu müşteri oluşturma batch işlemi başlatılacaktır. Onaylıyor musunuz?`
            : 'Toplu müşteri yükleme işlemi başlatılacaktır. Onaylıyor musunuz?'
        }
        confirmText="Evet, Yükle ve Başlat"
        cancelText="Vazgeç"
        variant="primary"
        isLoading={isUploading}
      />
    </div>
  );
};
