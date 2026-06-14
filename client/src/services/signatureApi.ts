import apiClient from './apiClient';
import { SignatureField, SignatureRequest } from '@/types';

export const signatureApi = {
  // Save all signature fields for a document
  saveSignatureFields: async (documentId: string, signatureFields: any[]) => {
    try {
      const response = await apiClient.post('/v1/signatures/' + documentId, { signatureFields });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get signature fields for document
  getSignatureFields: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/signatures/' + documentId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create signature request (placeholder for future use)
  createSignatureRequest: async (documentId: string, request: Omit<SignatureRequest, 'id' | 'createdAt'>) => {
    try {
      return await apiClient.post('/v1/signatures/' + documentId + '/requests', request);
    } catch (error) {
      throw error;
    }
  },

  // Get signature requests (placeholder for future use)
  getSignatureRequests: async (documentId: string) => {
    try {
      return await apiClient.get<SignatureRequest[]>('/v1/signatures/' + documentId + '/requests');
    } catch (error) {
      throw error;
    }
  },

  // Submit signature (placeholder for future use)
  submitSignature: async (
    documentId: string,
    fieldId: string,
    signatureData: string
  ) => {
    try {
      return await apiClient.post('/v1/signatures/' + documentId + '/submit', {
        fieldId,
        signatureData,
      });
    } catch (error) {
      throw error;
    }
  },
};
