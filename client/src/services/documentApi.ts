import apiClient from './apiClient';
import { Document, PaginatedResponse, SignatureField } from '@/types';

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contract Agreement.pdf',
    ownerId: 'user1',
    ownerName: 'John Doe',
    status: 'pending',
    fileUrl: '/mock-pdf.pdf',
    fileSize: 245000,
    totalPages: 5,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    signatureFieldCount: 2,
  },
  {
    id: '2',
    name: 'NDA.pdf',
    ownerId: 'user1',
    ownerName: 'John Doe',
    status: 'signed',
    fileUrl: '/mock-pdf.pdf',
    fileSize: 180000,
    totalPages: 3,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08'),
    signatureFieldCount: 1,
  },
  {
    id: '3',
    name: 'Service Agreement.pdf',
    ownerId: 'user1',
    ownerName: 'John Doe',
    status: 'completed',
    fileUrl: '/mock-pdf.pdf',
    fileSize: 320000,
    totalPages: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-07'),
    signatureFieldCount: 3,
  },
];

export const documentApi = {
  // Get paginated documents
  getDocuments: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      // Mock API response
      let filtered = [...mockDocuments];
      
      if (search) {
        filtered = filtered.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
      }
      
      if (status) {
        filtered = filtered.filter(d => d.status === status);
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);

      return {
        data: {
          items,
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId: string) => {
    try {
      const doc = mockDocuments.find(d => d.id === documentId);
      if (!doc) {
        throw new Error('Document not found');
      }
      return { data: doc };
    } catch (error) {
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (file: File, documentName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', documentName);

      const response = await apiClient.post('/documents/upload', formData);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId: string) => {
    try {
      return await apiClient.delete(`/documents/${documentId}`);
    } catch (error) {
      throw error;
    }
  },

  // Update document
  updateDocument: async (documentId: string, data: Partial<Document>) => {
    try {
      return await apiClient.put(`/documents/${documentId}`, data);
    } catch (error) {
      throw error;
    }
  },
};
