import apiClient from './apiClient';
import { AuditLog } from '@/types';

export const auditApi = {
  // Get audit logs for a document
  getAuditLogs: async (documentId: string) => {
    try {
      return await apiClient.get<AuditLog[]>(`/documents/${documentId}/audit-logs`);
    } catch (error) {
      throw error;
    }
  },

  // Get paginated audit logs
  getAuditLogsPaginated: async (documentId: string, page: number = 1, limit: number = 50) => {
    try {
      return await apiClient.get(`/documents/${documentId}/audit-logs`, {
        params: { page, limit },
      });
    } catch (error) {
      throw error;
    }
  },

  // Export audit report
  exportAuditReport: async (documentId: string, format: 'pdf' | 'csv' = 'pdf') => {
    try {
      return await apiClient.get(`/documents/${documentId}/audit-logs/export`, {
        params: { format },
        responseType: 'blob',
      });
    } catch (error) {
      throw error;
    }
  },
};
