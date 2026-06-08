import apiClient from './apiClient';
import { SignatureField, SignatureRequest } from '@/types';

export const signatureApi = {
  // Add signature field
  addSignatureField: async (documentId: string, field: Omit<SignatureField, 'id'>) => {
    try {
      return await apiClient.post(`/documents/${documentId}/signature-fields`, field);
    } catch (error) {
      throw error;
    }
  },

  // Get signature fields for document
  getSignatureFields: async (documentId: string) => {
    try {
      return await apiClient.get<SignatureField[]>(`/documents/${documentId}/signature-fields`);
    } catch (error) {
      throw error;
    }
  },

  // Update signature field
  updateSignatureField: async (
    documentId: string,
    fieldId: string,
    data: Partial<SignatureField>
  ) => {
    try {
      return await apiClient.put(
        `/documents/${documentId}/signature-fields/${fieldId}`,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  // Delete signature field
  deleteSignatureField: async (documentId: string, fieldId: string) => {
    try {
      return await apiClient.delete(`/documents/${documentId}/signature-fields/${fieldId}`);
    } catch (error) {
      throw error;
    }
  },

  // Create signature request
  createSignatureRequest: async (documentId: string, request: Omit<SignatureRequest, 'id' | 'createdAt'>) => {
    try {
      return await apiClient.post(`/documents/${documentId}/signature-requests`, request);
    } catch (error) {
      throw error;
    }
  },

  // Get signature requests
  getSignatureRequests: async (documentId: string) => {
    try {
      return await apiClient.get<SignatureRequest[]>(`/documents/${documentId}/signature-requests`);
    } catch (error) {
      throw error;
    }
  },

  // Submit signature
  submitSignature: async (
    documentId: string,
    fieldId: string,
    signatureData: string
  ) => {
    try {
      return await apiClient.post(`/documents/${documentId}/signatures`, {
        fieldId,
        signatureData,
      });
    } catch (error) {
      throw error;
    }
  },
};
