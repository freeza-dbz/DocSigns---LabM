import { useState, useCallback } from 'react';
import { documentApi } from '@/services/documentApi';
import { Document as AppDocument, PaginationParams } from '@/types';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (params: PaginationParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await documentApi.getDocuments(
        params.page,
        params.limit,
        params.search,
        params.status
      );
      // Backend returns ApiResponse: { data: { documents: [], total: ... } }
      setDocuments(result.data?.documents || []);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await documentApi.uploadDocument(file, name);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setError(null);
      await documentApi.deleteDocument(documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
      throw err;
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
};
