export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: Date;
}

export interface Document {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  ownerId?: string;
  ownerName?: string;
  uploadedBy?: string;
  status: DocumentStatus;
  fileUrl?: string;
  cloudinaryUrl?: string;
  fileSize: number;
  totalPages: number;
  createdAt: Date;
  updatedAt?: Date;
  signatureFieldCount?: number;
  signatureFields?: any[];
}

export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'completed' | string;

export interface SignatureField {
  id: string;
  documentId: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isSigned: boolean;
  signatureData?: string;
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  status: SignatureStatus;
  expirationDate: Date;
  message?: string;
  signedAt?: Date;
  createdAt: Date;
}

export type SignatureStatus = 'pending' | 'viewed' | 'signed' | 'declined' | string;

export interface AuditLog {
  id: string;
  documentId: string;
  eventType: AuditEventType;
  user: string;
  ipAddress: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type AuditEventType = 'uploaded' | 'sent' | 'viewed' | 'signed' | 'completed' | 'declined';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: DocumentStatus;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

