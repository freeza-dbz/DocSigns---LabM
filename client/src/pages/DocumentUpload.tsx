import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentUploadSchema, DocumentUploadInput } from '@/schemas';
import { documentApi } from '@/services/documentApi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DocumentUploadInput>({
    resolver: zodResolver(documentUploadSchema),
  });

  const documentName = watch('documentName');

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setValue('file', file);
        if (!documentName) {
          setValue('documentName', file.name.replace('.pdf', ''));
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setValue('file', file);
        if (!documentName) {
          setValue('documentName', file.name.replace('.pdf', ''));
        }
      }
    }
  };

  const onSubmit = async (data: DocumentUploadInput) => {
    setApiError(null);
    try {
      setUploadProgress(30);

      const fileToUpload = data.file || selectedFile;
      if (!fileToUpload) throw new Error('No file selected');
      const res_data = await documentApi.uploadDocument(fileToUpload, data.documentName);
      setUploadProgress(100);

      if (res_data.success) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Document Uploaded!',
          text: 'Your document has been successfully uploaded.',
          showConfirmButton: false,
          timer: 2000,
          showClass: {
            popup: `animate__animated animate__fadeInUp animate__faster`,
          },
          hideClass: {
            popup: `animate__animated animate__fadeOutDown animate__faster`,
          },
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2100);
      } else {
        const errorMessage = res_data.message || 'Upload failed. Please try again.';
        setApiError(errorMessage);
        setUploadProgress(0);
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Upload Failed',
          text: errorMessage,
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadProgress(0);
      let errorMsg = 'An error occurred during upload';

      if (err.response?.data) {
        errorMsg = err.response.data.message || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setApiError(errorMsg);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Upload Error',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Upload Document</h1>
          <p className="text-text-secondary mt-2">Upload a PDF document to get started with signing</p>
        </div>

        {apiError && (
          <div className="mb-8 p-4 bg-danger-light border border-danger rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
            <p className="font-medium text-danger text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {/* File Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Select PDF File</CardTitle>
                <CardDescription>Upload your document to begin adding signature fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
                    isDragging
                      ? 'border-primary bg-info-light'
                      : 'border-border bg-background-secondary hover:border-primary'
                  }`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-white-900 mb-2">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-gray-600 text-sm mb-4">or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget as HTMLElement).parentElement?.querySelector(
                          'input[type="file"]'
                        ) as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                  <p className="text-gray-500 text-xs mt-4">PDF files only � Max 50MB</p>
                </div>

                {selectedFile && (
                  <div className="mt-6 p-4 bg-success-light border border-success rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-success mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-success">{selectedFile.name}</p>
                        <p className="text-sm text-text-secondary">
                          {formatFileSize(selectedFile.size)} � PDF Document
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.file && (
                  <div className="mt-4 p-4 bg-danger-light border border-danger rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-danger">{errors.file.message}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Name */}
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>Provide a name for your document</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  label="Document Name"
                  placeholder="e.g., Service Agreement"
                  error={errors.documentName?.message}
                  {...register('documentName')}
                />
                <p className="text-sm text-text-muted mt-2">
                  This helps you identify the document in your account
                </p>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">Uploading...</p>
                      <p className="text-sm text-gray-600">{uploadProgress}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!selectedFile || isSubmitting}
                isLoading={isSubmitting}
              >
                Upload & Continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;
