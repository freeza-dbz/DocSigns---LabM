import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../services/documentApi';
import { signatureApi } from '../services/signatureApi';
import { Document, SignatureField } from '../types';
import Button from '../components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const DocumentDetail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [selectedField, setSelectedField] = useState<SignatureField | null>(null);
  const [isPlacingField, setIsPlacingField] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Drag state
  const [dragState, setDragState] = useState<{ fieldId: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const result = await documentApi.getDocument(documentId!);
        setDocument(result.data);
        try {
          const blob = await documentApi.getDocumentPreview(documentId!);
          setPdfBlob(blob);
        } catch (e) { console.error(e); }
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

  useEffect(() => {
    if (document) {

      const fetchSignatureFields = async () => {
        try {
          const response = await signatureApi.getSignatureFields(documentId!);
          if (response.data && response.data.length > 0) {
            setSignatureFields(response.data.map((f: any) => ({
              id: f._id || `field-${Date.now()}-${Math.random()}`,
              documentId: documentId!,
              pageNumber: f.page,
              x: f.x,
              y: f.y,
              width: f.width || 150,
              height: f.height || 60,
              isSigned: f.isSigned || false,
              signatureData: f.signatureDataUrl || f.signatureData, // For displaying signed fields
            })));
          }
        } catch (error) {
          console.error('Failed to load signature fields:', error);
        }
      };

      fetchSignatureFields();
    }
  }, [document, documentId]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  const handleAddSignatureField = () => {
    setIsPlacingField(true);
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingField) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newField: SignatureField = {
      id: `field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    const field = signatureFields.find(f => f.id === fieldId);
    if (field) {
      setDragState({
        fieldId,
        startX: e.clientX,
        startY: e.clientY,
        initialX: field.x,
        initialY: field.y
      });
      setSelectedField(field);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const field = signatureFields.find(f => f.id === dragState.fieldId);
    if (!field) return;

    // We get the rect of the container to calculate percentages
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();

    // Pixel diff
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    const unscaledWidth = rect.width / (zoom / 100);
    const unscaledHeight = rect.height / (zoom / 100);

    // Convert to percent relative to the container
    const dxPercent = (dx / unscaledWidth) * 100;
    const dyPercent = (dy / unscaledHeight) * 100;

    const fieldWidthPercent = (field.width / unscaledWidth) * 100;
    const fieldHeightPercent = (field.height / unscaledHeight) * 100;

    // Bound the values
    let newX = Math.max(0, Math.min(100 - fieldWidthPercent, dragState.initialX + dxPercent));
    let newY = Math.max(0, Math.min(100 - fieldHeightPercent, dragState.initialY + dyPercent));

    setSignatureFields(prev => prev.map(f =>
      f.id === dragState.fieldId ? { ...f, x: newX, y: newY } : f
    ));
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const saveFields = async (): Promise<boolean> => {
    if (!document) return false;
    try {
      const fieldsToSave = signatureFields.map(f => ({
        page: f.pageNumber,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height
      }));
      await signatureApi.saveSignatureFields(document?._id || documentId!, fieldsToSave);
      return true;
    } catch (error) {
      console.error('Failed to save fields:', error);
      return false;
    }
  };

  const handleSaveCoordinates = async () => {
    setIsSaving(true);
    const success = await saveFields();
    if (success) {
      toast.success('Signature fields saved successfully');
    } else {
      toast.error('Failed to save signature fields');
    }
    setIsSaving(false);
  };

  const handleSendForSigning = async () => {
    setIsSending(true);
    const success = await saveFields();
    if (success) {
      toast.success('Coordinates saved.');
      navigate(`/documents/${document?._id || documentId}/send`);
    } else {
      toast.error('Could not save coordinates before sending.');
    }
    setIsSending(false);
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
                  {numPages || document.totalPages} pages • {document.signatureFieldCount || signatureFields.length} signature fields
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleAddSignatureField}
              className="flex items-center gap-2"
              disabled={isPlacingField || isSaving || isSending}
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
                      {isPlacingField && '👇 Click to place a signature field'}
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
                  className={`border-2 border-border rounded-lg overflow-auto flex justify-center p-4 transition-colors duration-200 bg-gray-100 dark:bg-background-secondary ${isPlacingField ? 'cursor-crosshair' : ''
                    }`}
                  style={{ maxHeight: '70vh', minHeight: '400px' }}
                >
                  <div
                    className="relative"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: dragState ? 'none' : 'transform 0.2s' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <PdfDocument
                      file={pdfBlob || document?.fileUrl || document?.cloudinaryUrl || null}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={console.error}
                      loading={<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />}
                    >
                      <div onClick={handlePageClick} className="relative shadow-lg">
                        <Page
                          pageNumber={currentPage}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                        {/* Render signature field overlays */}
                        {fieldsOnCurrentPage.map((field) => (
                          <div
                            key={field.id}
                            onMouseDown={(e) => handleMouseDown(e, field.id)}
                            onClick={(e) => { e.stopPropagation(); setSelectedField(field); }}
                            className={`absolute border-2 flex items-center justify-center cursor-move font-medium text-sm transition-colors duration-200 ${field.isSigned ? 'border-green-400 bg-green-100/50' :
                                selectedField?.id === field.id ? 'border-primary bg-info-light border-dashed' : 'border-warning bg-warning-light hover:border-warning border-dashed'
                              }`}
                            style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}px`, height: `${field.height}px` }}
                          >
                            {field.isSigned && field.signatureData ? (
                              <img src={field.signatureData} alt="Signed" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-warning text-xs select-none pointer-events-none whitespace-nowrap">[ Sign Here ]</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </PdfDocument>
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                    disabled={currentPage >= numPages || numPages === 0}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSaveCoordinates}
                  isLoading={isSaving}
                  disabled={isSaving || isSending}
                  className="flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Coordinates'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleSendForSigning}
                  isLoading={isSending}
                  disabled={isSaving || isSending}>
                  {isSending ? 'Saving...' : 'Save & Send for Signing'}
                </Button>
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
                    {fieldsOnCurrentPage.map((field, index) => (
                      <div
                        key={field.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedField?.id === field.id
                            ? 'border-primary bg-info-light'
                            : 'border-border hover:border-primary'
                          }`}
                        onClick={() => setSelectedField(field)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              Field {index + 1}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
