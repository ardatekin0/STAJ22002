import { apiClient } from '../api/client';
import type { BatchJob } from '../types';

export const batchService = {
  uploadExcel: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<string>('/api/batch/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getJob: async (jobId: number): Promise<BatchJob> => {
    return apiClient<BatchJob>(`/api/batch/job/${jobId}`, {
      method: 'GET',
    });
  },
};
