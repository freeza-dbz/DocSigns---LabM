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

  const addSignatureField = useCallback(
    async (field: Omit<SignatureField, 'id'>) => {
      try {
        setError(null);
        const response = await signatureApi.addSignatureField(documentId, field);
        setFields([...fields, response.data]);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add signature field';
        setError(message);
        throw err;
      }
    },
    [documentId, fields]
  );

  const deleteSignatureField = useCallback(
    async (fieldId: string) => {
      try {
        setError(null);
        await signatureApi.deleteSignatureField(documentId, fieldId);
        setFields(fields.filter((f) => f.id !== fieldId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete signature field';
        setError(message);
        throw err;
      }
    },
    [documentId, fields]
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
    addSignatureField,
    deleteSignatureField,
    fetchSignatureRequests,
    submitSignature,
  };
};
