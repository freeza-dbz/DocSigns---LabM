import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '@/services/documentApi';
import { auditApi } from '@/services/auditApi';
import { signatureApi } from '@/services/signatureApi';
import { Document, AuditLog, SignatureRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileText, Clock, User, Globe, Download, CheckCircle, Mail,  } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/Badge';

const AuditTrail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [signers, setSigners] = useState<SignatureRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [docResult, signersResult, logsResult] = await Promise.all([
          documentApi.getDocument(documentId!),
          signatureApi.getSignatureRequests(documentId!),
          auditApi.getAuditLogs(documentId!)
        ]);
        setDocument(docResult.data);
        setSigners(signersResult.data || []);
        setAuditLogs(logsResult.data || []);
      } catch (error) {
        console.error('Failed to load document:', error);
        toast.error('Failed to load document details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadData();
    }
  }, [documentId]);

  const eventConfig: Record<string, { icon: any, label: string, color: string }> = {
    UPLOADED: {
      icon: FileText,
      label: 'Document Uploaded',
      color: 'bg-blue-100 text-blue-600',
    },
    SENT: {
      icon: FileText,
      label: 'Document Sent',
      color: 'bg-purple-100 text-purple-600',
    },
    VIEWED: {
      icon: Clock,
      label: 'Document Viewed',
      color: 'bg-yellow-100 text-yellow-600',
    },
    SIGNED: {
      icon: FileText,
      label: 'Document Signed',
      color: 'bg-green-100 text-green-600',
    },
    COMPLETED: {
      icon: FileText,
      label: 'Document Completed',
      color: 'bg-indigo-100 text-indigo-600',
    },
    DECLINED: {
      icon: FileText,
      label: 'Document Declined',
      color: 'bg-red-100 text-red-600',
    },
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleMarkAsCompleted = async () => {
    if (!document || document.status === 'COMPLETED') return;

    setIsCompleting(true);
    try {
      // In a real app, you might want to check if all signers have completed
      // before allowing manual completion, or this could be an override.
      await documentApi.updateDocumentStatus(documentId!, 'COMPLETED');
      setDocument(prevDoc => prevDoc ? { ...prevDoc, status: 'COMPLETED' } : null);
      toast.success('Document marked as completed!');
      
      // Refresh logs to show completion event
      const logsResult = await auditApi.getAuditLogs(documentId!);
      setAuditLogs(logsResult.data || []);
    } catch (error) {
      console.error('Failed to mark document as completed:', error);
      toast.error('Failed to mark document as completed.');
    } finally {
      setIsCompleting(false);
    }
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

  const isDocumentCompleted = document.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/dashboard`)}
            >
              ← Back
            </Button>
            {!isDocumentCompleted && (
              <Button variant="primary" onClick={handleMarkAsCompleted} disabled={isCompleting} className="flex items-center gap-2">
                <CheckCircle size={18} />
                {isCompleting ? 'Completing...' : 'Mark as Completed'}
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-text-primary mt-4">Audit Trail</h1>
          <p className="text-text-secondary mt-2">{document.name}</p>
        </div>

        {/* Signers Progress */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Signer Progress</CardTitle>
                <CardDescription>Track the status of invited signers</CardDescription>
              </div>
              <StatusBadge status={document.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signers.length === 0 ? (
                <p className="text-text-secondary italic col-span-2 py-4 text-center">No signers added to this document yet.</p>
              ) : (
                signers.map((signer) => (
                  <div key={signer._id} className="p-4 rounded-lg border border-border bg-background-secondary flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${signer.status === 'signed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                        {signer.status === 'signed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{signer.signerName}</p>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Mail size={12} />
                          <span>{signer.signerEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                        signer.status === 'signed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {signer.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Document Activity</CardTitle>
            <CardDescription>Complete history of actions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {auditLogs.map((log, index) => {
                const config = eventConfig[log.eventType] || eventConfig.VIEWED;
                const IconComponent = config.icon || FileText;
                const performer = log.user?.fullName || log.signerEmail || 'Unknown User';

                return (
                  <div key={log._id || index} className="relative pb-8">
                    {/* Timeline line */}
                    {index !== auditLogs.length - 1 && (
                      <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-border" />
                    )}

                    {/* Timeline item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`mt-1 p-2 rounded-lg ${config.color}`}>
                        <IconComponent size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-text-primary">{config.label}</p>
                            <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                              <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>{performer}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Globe size={16} />
                                <span>{log.ipAddress}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-text-secondary mt-2 md:mt-0">
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{formatDate(log.createdAt || log.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Download Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.print()}
              >
                <Download size={18} />
                Download Audit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrail;
