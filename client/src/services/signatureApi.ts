import apiClient from './apiClient';
import { SignatureField, SignatureRequest } from '@/types';

export const signatureApi = {
  // Save all signature fields for a document
  saveSignatureFields: async (documentId: string, signatureFields: any[]) => {
    try {
      const response = await apiClient.post('/v1/signatures/' + documentId + '/fields', { signatureFields });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get signature fields for document
  getSignatureFields: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/signatures/' + documentId + '/fields');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create signature request
  createSignatureRequest: async (documentId: string, request: Omit<SignatureRequest, 'id' | 'createdAt'>) => {
    try {
      const response = await apiClient.post('/v1/signatures/' + documentId + '/requests', request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get signature requests
  getSignatureRequests: async (documentId: string) => {
    try {
      const response = await apiClient.get('/v1/signatures/' + documentId + '/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get public signature request
  getPublicSignatureRequest: async (token: string) => {
    try {
      const response = await apiClient.get('/v1/signatures/public/' + token);
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
      const response = await apiClient.post('/v1/signatures/public/' + token + '/submit', {
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
