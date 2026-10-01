import type { BatchJobStatus, BatchJobType } from './common.types';

export interface BatchJob {
  id: number;
  jobStatus: BatchJobStatus;
  batchJobType: BatchJobType;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
}
