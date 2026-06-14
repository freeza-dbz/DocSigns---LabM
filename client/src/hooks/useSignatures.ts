import { useState, useCallback } from 'react';
import { signatureApi } from '@/services/signatureApi';
import { SignatureField, SignatureRequest } from '@/types';

export const useSignatures = (documentId: string) => {
  const [fields, setFields] = useState<SignatureField[]>([]);
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignatureFields = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await signatureApi.getSignatureFields(documentId);
      setFields(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch signature fields';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const saveSignatureFields = useCallback(
    async (newFields: SignatureField[]) => {
      try {
        setError(null);
        const response = await signatureApi.saveSignatureFields(documentId, newFields);
        setFields(response.data);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save signature fields';
        setError(message);
        throw err;
      }
    },
    [documentId]
  );

  

  const fetchSignatureRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await signatureApi.getSignatureRequests(documentId);
      setRequests(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch signature requests';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const submitSignature = useCallback(
    async (fieldId: string, signatureData: string) => {
      try {
        setError(null);
        const response = await signatureApi.submitSignature(documentId, fieldId, signatureData);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit signature';
        setError(message);
        throw err;
      }
    },
    [documentId]
  );

  return {
    fields,
    requests,
    isLoading,
    error,
    fetchSignatureFields,
    saveSignatureFields,
    fetchSignatureRequests,
    submitSignature,
  };
};
