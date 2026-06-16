import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signatureApi } from '@/services/signatureApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileText, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import SignaturePadModal from '../components/SignaturePadModal';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface SignRequestData {
  documentTitle: string;
  ownerName: string;
  message?: string;
  fileUrl: string;
  fields?: any[];
}

const PublicSign: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<SignRequestData | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    const loadRequest = async () => {
      if (!token) {
        setError('Invalid access: No token provided.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await signatureApi.getPublicSignatureRequest(token);
        const data = response.data || response;
        
        if (data && data.document) {
          setRequestData({
            documentTitle: data.document.title || 'Document',
            ownerName: 'Sender', 
            fileUrl: data.document.cloudinaryUrl,
            fields: data.fields || []
          });
        } else {
          setError('The signing request could not be found.');
        }
      } catch (err: any) {
        console.error('Failed to load signing request:', err);
        setError(err.response?.data?.message || 'The signing link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequest();
  }, [token]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };
  const handleOpenSignatureModal = () => {
    setIsSignatureModalOpen(true);
  };

  const handleSaveSignature = async (signatureData: string) => {
    setIsSignatureModalOpen(false);
    if (!token || !requestData?.fields || requestData.fields.length === 0) return;

    setIsSigning(true);
    try {
      const signaturePromises = requestData.fields
        .filter(field => !field.isSigned)
        .map(field => signatureApi.submitSignature(token, field._id, signatureData, 'DRAW'));

      await Promise.all(signaturePromises);

      setIsCompleted(true);
      Swal.fire({
        icon: 'success',
        title: 'Document Signed!',
        text: 'You have successfully signed the document.',
        confirmButtonColor: '#2563eb',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Signing Failed',
        text: err.response?.data?.message || 'An error occurred while signing the document.',
      });
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <AlertCircle className="h-16 w-16 text-danger mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Invalid Link</CardTitle>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Thank You!</CardTitle>
          <p className="text-text-secondary mb-6">
            Your signature has been recorded. The document owner will be notified.
          </p>
        </Card>
      </div>
    );
  }

  if (!requestData) {
    return null;
  }

  return (
    <>
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
      />
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Document Info and Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign Document</CardTitle>
              <CardDescription>Review the document and confirm your signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <FileText className="text-primary mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">{requestData.documentTitle}</p>
                  <p className="text-sm text-text-secondary">From: {requestData.ownerName}</p>
                </div>
              </div>
              
              {requestData.message && (
                <div className="text-sm text-text-secondary bg-gray-50 p-3 rounded border-l-4 border-primary">
                  <p className="font-medium text-xs uppercase tracking-wider text-text-muted mb-1">A message from the sender:</p>
                  <blockquote className="italic text-gray-700 mt-2 pl-2 border-l-2 border-gray-300">
                    {requestData.message}
                  </blockquote>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-4 text-xs text-text-muted">
                  <Shield size={14} className="text-green-500" />
                  <span>Secure SSL Encrypted Signing</span>
                </div>
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={handleOpenSignatureModal}
                  isLoading={isSigning}
                  disabled={isSigning}
                >
                  Confirm & Sign Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card className="h-[80vh] overflow-auto flex flex-col">
             <CardContent className="flex-1 p-2 md:p-4 bg-gray-100 flex justify-center">
                <PdfDocument
                  file={requestData.fileUrl || null}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={console.error}
                  loading={<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} className="mb-4 shadow-md" renderTextLayer={false} />
                  ))}
                </PdfDocument>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default PublicSign;
