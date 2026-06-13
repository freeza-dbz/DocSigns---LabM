import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signatureRequestSchema = z.object({
  signerName: z.string().min(2, 'Signer name is required'),
  signerEmail: z.string().email('Invalid email address'),
  expirationDate: z.date().min(new Date(), 'Expiration date must be in the future'),
  message: z.string().optional(),
});

export const documentUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    'Only PDF files are allowed'
  ).refine(
    (file) => file.size <= 50 * 1024 * 1024,
    'File size must not exceed 50MB'
  ),
  documentName: z.string().min(1, 'Document name is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SignatureRequestInput = z.infer<typeof signatureRequestSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
