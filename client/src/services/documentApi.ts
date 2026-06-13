import apiClient from './apiClient';
import { Document } from '@/types';

export const documentApi = {
  // Get paginated documents
  getDocuments: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await apiClient.get('/v1/documents?' + params.toString());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/documents/' + documentId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (file: File, documentName: string) => {
    try {
      const response = await apiClient.postForm('/v1/documents/upload', { file, documentName });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId: string) => {
    try {
      const response = await apiClient.delete('/v1/documents/' + documentId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update document
  updateDocument: async (documentId: string, data: Partial<Document>) => {
    try {
      const response = await apiClient.patch('/v1/documents/' + documentId, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get document stats
  getDocumentStats: async () => {
    try {
      const response = await apiClient.get('/v1/documents/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update document status
  updateDocumentStatus: async (documentId: string, status: string) => {
    try {
      const response = await apiClient.patch('/v1/documents/' + documentId + '/status', { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
