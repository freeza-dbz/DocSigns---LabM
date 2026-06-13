import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '@/services/documentApi';
import { Document, SignatureField } from '@/types';
import Button from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Trash2, FileText } from 'lucide-react';

const DocumentDetail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [selectedField, setSelectedField] = useState<SignatureField | null>(null);
  const [isPlacingField, setIsPlacingField] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const result = await documentApi.getDocument(document?._id || documentId!);
        setDocument(result.data);
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  // Mock PDF - in production use react-pdf or PDF.js
  useEffect(() => {
    if (document) {
      setNumPages(document.totalPages || 5);
    }
  }, [document]);

  const handleAddSignatureField = () => {
    setIsPlacingField(true);
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingField) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      documentId: document?._id || documentId!,
      pageNumber: currentPage,
      x,
      y,
      width: 150,
      height: 60,
      isSigned: false,
    };

    setSignatureFields([...signatureFields, newField]);
    setIsPlacingField(false);
  };

  const handleDeleteField = (fieldId: string) => {
    setSignatureFields(signatureFields.filter(f => f.id !== fieldId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">Document not found</p>
            <Button onClick={() => navigate('/dashboard')} variant="primary">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fieldsOnCurrentPage = signatureFields.filter(f => f.pageNumber === currentPage);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              ← Back
            </Button>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{document.title || document.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <StatusBadge status={document.status} />
                <span className="text-sm text-text-secondary">
                  {document.totalPages} pages • {document.signatureFieldCount} signature fields
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleAddSignatureField}
              className="flex items-center gap-2"
              disabled={isPlacingField}
            >
              <Plus size={20} />
              {isPlacingField ? 'Click to place field...' : 'Add Signature Field'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Document Preview</CardTitle>
                    <CardDescription>
                      {isPlacingField && '👆 Click to place a signature field'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(zoom - 10, 50))}
                    >
                      <ZoomOut size={18} />
                    </Button>
                    <span className="text-sm font-medium text-gray-700 w-12 text-center">
                      {zoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(zoom + 10, 200))}
                    >
                      <ZoomIn size={18} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  onClick={handlePageClick}
                  className={`border-2 border-border rounded-lg overflow-auto flex justify-center items-center p-4 transition-colors duration-200 bg-background-secondary ${
                    isPlacingField ? 'cursor-crosshair' : ''
                  }`}
                  style={{ maxHeight: '600px', minHeight: '400px', position: 'relative' }}
                >
                  {/* PDF Placeholder - Mock viewer */}
                  <div className="relative w-full max-w-2xl bg-white dark:bg-surface-secondary p-8 rounded-lg shadow-sm border border-border">
                    {/* Page indicator */}
                    <div className="text-center mb-6 pb-4 border-b border-border">
                      <p className="text-text-secondary text-sm">Page {currentPage} of {numPages}</p>
                    </div>

                    {/* PDF Content Area */}
                    <div
                      className="min-h-96 bg-white dark:bg-surface-tertiary rounded flex items-center justify-center relative"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.2s',
                      }}
                    >
                      {/* Document content placeholder */}
                      <div className="text-center space-y-4">
                        <FileText className="mx-auto text-text-muted" size={48} />
                        <div>
                          <p className="font-semibold text-text-primary">{document.title || document.name}</p>
                          <p className="text-sm text-text-secondary mt-2">Page {currentPage} of {numPages}</p>
                        </div>
                      </div>

                      {/* Render signature field overlays */}
                      {fieldsOnCurrentPage.map((field) => (
                        <div
                          key={field.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedField(field);
                          }}
                          className={`absolute border-2 border-dashed flex items-center justify-center cursor-move font-medium text-sm transition-all duration-200 ${
                            selectedField?.id === field.id
                              ? 'border-primary bg-info-light'
                              : 'border-warning bg-warning-light hover:border-warning'
                          }`}
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            width: `${field.width}px`,
                            height: `${field.height}px`,
                          }}
                        >
                          <span className="text-warning text-xs">[ Sign Here ]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="text-sm text-text-primary">
                    Page {currentPage} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, numPages))}
                    disabled={currentPage === numPages}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <p className="font-medium text-text-primary mt-1">
                    <StatusBadge status={document.status} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Created</p>
                  <p className="font-medium text-text-primary mt-1">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(document.createdAt))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Owner</p>
                  <p className="font-medium text-text-primary mt-1">{document.ownerName || 'Me'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Signature Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signature Fields</CardTitle>
                <CardDescription>Page {currentPage} ({fieldsOnCurrentPage.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {fieldsOnCurrentPage.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-4">
                    No signature fields on this page
                  </p>
                ) : (
                  <div className="space-y-2">
                    {fieldsOnCurrentPage.map((field) => (
                      <div
                        key={field.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedField?.id === field.id
                            ? 'border-primary bg-info-light'
                            : 'border-border hover:border-primary'
                        }`}
                        onClick={() => setSelectedField(field)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              Field {field.id.split('-')[1]}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              Position: {Math.round(field.x)}%, {Math.round(field.y)}%
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(field.id);
                            }}
                            className="text-danger hover:opacity-70 transition-opacity duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="primary" fullWidth>
                Send for Signing
              </Button>
              <Button variant="outline" fullWidth>
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
