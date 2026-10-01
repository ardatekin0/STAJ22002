import React, { useState, useMemo, useEffect } from 'react';
import { Skeleton } from './Spinner';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExporter';

export interface Column<T> {
  header: string;
  key?: keyof T | string;
  sortKey?: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number | boolean | Date | null | undefined;
  exportValue?: (item: T) => string | number | boolean | Date | null | undefined;
  exportable?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T, index: number) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onEmptyAction?: () => void;
  emptyActionText?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
  defaultSortKey?: keyof T | string;
  defaultSortDirection?: SortDirection;
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  exportFileName?: string;
  enableExport?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onEmptyAction,
  emptyActionText,
  sortBy,
  sortDirection = 'asc',
  onSortChange,
  pagination = true,
  defaultPageSize = 20,
  pageSizeOptions = [20, 50, 100],
  exportFileName = 'tablo_verileri',
  enableExport = true,
}: DataTableProps<T>): React.ReactElement {

  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSort = (col: Column<T>) => {
    if (col.sortable === false || !onSortChange) return;
    const targetSortKey = col.sortKey || (col.key ? String(col.key) : undefined);
    if (!targetSortKey) return;

    if (sortBy === targetSortKey) {
      onSortChange(targetSortKey, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(targetSortKey, 'asc');
    }
  };

  const tableData = data || [];

  const totalRecords = tableData.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalRecords / pageSize)) : 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    if (!pagination) return tableData;
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return tableData.slice(startIndex, startIndex + pageSize);
  }, [tableData, pagination, currentPage, totalPages, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rIdx) => (
              <tr key={rIdx}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                    <Skeleton height="1.2rem" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          actionText={emptyActionText}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  const startRecord = (Math.min(currentPage, totalPages) - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);

  const handleExportCurrentPage = () => {
    if (paginatedData.length === 0) return;
    exportToExcel(paginatedData, columns, `${exportFileName}_sayfa_${currentPage}`);
  };

  const handleExportAll = () => {
    if (tableData.length === 0) return;
    exportToExcel(tableData, columns, `${exportFileName}_tumu`);
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => {
              const targetSortKey = col.sortKey || (col.key ? String(col.key) : undefined);
              const isSortable = col.sortable !== false && !!targetSortKey && !!onSortChange;

              return (
                <th
                  key={idx}
                  onClick={() => isSortable && handleSort(col)}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                    cursor: isSortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      justifyContent:
                        col.align === 'right'
                          ? 'flex-end'
                          : col.align === 'center'
                          ? 'center'
                          : 'flex-start',
                    }}
                  >
                    <span>{col.header}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, rIdx) => (
            <tr key={keyExtractor(item, rIdx)}>
              {columns.map((col, cIdx) => {
                let cellContent: React.ReactNode = null;
                if (col.render) {
                  cellContent = col.render(item, rIdx);
                } else if (col.key) {
                  const val = (item as Record<string, unknown>)[col.key as string];
                  cellContent = val !== undefined && val !== null ? String(val) : '-';
                }

                return (
                  <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && totalRecords > 0 && (
        <div className="table-pagination">
          <div className="pagination-left">
            <div className="pagination-page-size">
              <span className="pagination-label">Sayfa başına:</span>
              <select
                className="pagination-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <span className="pagination-info">
              Toplam <strong>{totalRecords}</strong> kayıttan <strong>{startRecord}-{endRecord}</strong> arası gösteriliyor
            </span>

            {enableExport && (
              <div className="table-export-group">
                <button
                  type="button"
                  className="btn-export"
                  onClick={handleExportCurrentPage}
                  title={`Mevcut sayfadaki (${paginatedData.length} kayıt) verileri Excel'e aktar`}
                >
                  <FileSpreadsheet size={15} className="btn-export-icon" />
                  <span>Bu Sayfayı Excel'e Aktar</span>
                </button>
                <button
                  type="button"
                  className="btn-export"
                  onClick={handleExportAll}
                  title={`Filtrelenen tüm (${data.length} kayıt) verileri Excel'e aktar`}
                >
                  <FileSpreadsheet size={15} className="btn-export-icon" />
                  <span>Tümünü Excel'e Aktar</span>
                </button>
              </div>
            )}
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-nav-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Önceki Sayfa"
            >
              <ChevronLeft size={16} />
              <span>Önceki</span>
            </button>

            <div className="pagination-pages">
              {pageNumbers.map((page, idx) => {
                if (typeof page === 'string') {
                  return (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                      ...
                    </span>
                  );
                }
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-nav-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Sonraki Sayfa"
            >
              <span>Sonraki</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
