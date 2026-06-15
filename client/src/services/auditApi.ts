import apiClient from './apiClient';


export const auditApi = {
  // Get audit logs for a document
  getAuditLogs: async (documentId: string) => {
    try {
      const response = await apiClient.get(`/v1/documents/${documentId}/audit-logs`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get paginated audit logs
  getAuditLogsPaginated: async (documentId: string, page: number = 1, limit: number = 50) => {
    try {
      const response = await apiClient.get(`/v1/documents/${documentId}/audit-logs`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Export audit report
  exportAuditReport: async (documentId: string, format: 'pdf' | 'csv' = 'pdf') => {
    try {
      const response = await apiClient.get(`/v1/documents/${documentId}/audit-logs/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
