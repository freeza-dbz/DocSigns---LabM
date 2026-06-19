import apiClient from './apiClient';
import { SignatureField, SignatureRequest } from '@/types';

export const signatureApi = {
  // Save all signature fields for a document
  saveSignatureFields: async (documentId: string, signatureFields: any[]) => {
    try {
      const response = await apiClient.post('/v1/signature-fields/' + documentId, { signatureFields });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get signature fields for document
  getSignatureFields: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/signature-fields/' + documentId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create signature request
  createSignatureRequest: async (documentId: string, request: Omit<SignatureRequest, 'id' | 'createdAt'>) => {
    try {
      const response = await apiClient.post('/v1/signature-requests/' + documentId, request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get signature requests
  getSignatureRequests: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/signature-requests/' + documentId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get public signature request
  getPublicSignatureRequest: async (token: string) => {
    try {
      const response = await apiClient.get('/v1/signature-requests/public/' + token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get public signature request document preview (CORS-friendly)
  getPublicDocumentPreview: async (token: string) => {
    try {
      const response = await apiClient.get('/v1/signature-requests/public/' + token + '/preview', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit signature
  submitSignature: async (
    token: string,
    fieldId: string,
    signatureData: string,
    signatureMethod: string = 'DRAW'
  ) => {
    try {
      const response = await apiClient.post('/v1/signature-requests/submit/' + token, {
        fieldId,
        signatureData,
        signatureMethod
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
