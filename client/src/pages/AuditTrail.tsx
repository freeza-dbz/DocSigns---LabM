import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '@/services/documentApi';
import { Document, AuditLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileText, Clock, User, Globe, Download } from 'lucide-react';

const AuditTrail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const result = await documentApi.getDocument(documentId!);
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

  // Mock audit logs
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      documentId: documentId || '',
      eventType: 'uploaded',
      user: 'You',
      ipAddress: '192.168.1.1',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      documentId: documentId || '',
      eventType: 'sent',
      user: 'You',
      ipAddress: '192.168.1.1',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      documentId: documentId || '',
      eventType: 'viewed',
      user: 'John Doe (john@example.com)',
      ipAddress: '203.45.67.89',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      documentId: documentId || '',
      eventType: 'signed',
      user: 'John Doe (john@example.com)',
      ipAddress: '203.45.67.89',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      documentId: documentId || '',
      eventType: 'completed',
      user: 'You',
      ipAddress: '192.168.1.1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const eventConfig = {
    uploaded: {
      icon: FileText,
      label: 'Document Uploaded',
      color: 'bg-blue-100 text-blue-600',
    },
    sent: {
      icon: FileText,
      label: 'Document Sent',
      color: 'bg-purple-100 text-purple-600',
    },
    viewed: {
      icon: Clock,
      label: 'Document Viewed',
      color: 'bg-yellow-100 text-yellow-600',
    },
    signed: {
      icon: FileText,
      label: 'Document Signed',
      color: 'bg-green-100 text-green-600',
    },
    completed: {
      icon: FileText,
      label: 'Document Completed',
      color: 'bg-indigo-100 text-indigo-600',
    },
    declined: {
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

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/documents/${documentId}`)}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Audit Trail</h1>
          <p className="text-text-secondary mt-2">{document.name}</p>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Document Activity</CardTitle>
            <CardDescription>Complete history of actions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {auditLogs.map((log, index) => {
                const config = eventConfig[log.eventType];
                const IconComponent = config.icon;

                return (
                  <div key={log.id} className="relative pb-8">
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
                                <span>{log.user}</span>
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
                              <span>{formatDate(log.timestamp)}</span>
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
