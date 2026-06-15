import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentApi } from '@/services/documentApi';
import { Document, DocumentStatus } from '@/types';
import Button from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { FileText, Plus, Search, Clock, CheckCircle, Archive, History } from 'lucide-react';
import Input from '@/components/common/Input';

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [docStats, setDocStats] = useState({ total: 0, PENDING: 0, COMPLETED: 0, DRAFT: 0 });

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const result = await documentApi.getDocuments(
          page,
          10,
          search || undefined,
          filterStatus === 'all' ? undefined : filterStatus
        );
        setDocuments(result.data?.documents || []);

        const statsResult = await documentApi.getDocumentStats();
        setDocStats(statsResult.data || { total: 0, PENDING: 0, COMPLETED: 0, DRAFT: 0 });
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadDocuments, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, page]);

  const stats = [
    {
      title: 'Total Documents',
      value: docStats.total.toString(),
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Signatures',
      value: (docStats.PENDING || 0).toString(),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Completed',
      value: (docStats.COMPLETED || 0).toString(),
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Drafts',
      value: (docStats.DRAFT || 0).toString(),
      icon: Archive,
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-2">Manage and track your documents</p>
          </div>
          <Link to="/documents/upload">
            <Button variant="primary" size="lg" className="flex items-center gap-2">
              <Plus size={20} />
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <IconComponent size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as DocumentStatus | 'all');
                setPage(1);
              }}
              className="px-4 py-2 bg-input border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>View and manage your signed documents</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-secondary">No documents found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Size</th>
                      <th className="text-right py-3 px-4 font-semibold text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id || doc.id} className="border-b border-border hover:bg-background-secondary transition-colors duration-200">
                        <td className="py-4 px-4">
                          <Link to={`/documents/${doc._id || doc.id}`} className="text-primary hover:opacity-80 font-medium transition-opacity duration-200">
                            {doc.title || doc.name}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-text-primary">{doc.ownerName || 'Me'}</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="py-4 px-4 text-text-secondary text-sm">{formatDate(doc.createdAt)}</td>
                        <td className="py-4 px-4 text-text-secondary text-sm">{formatFileSize(doc.fileSize)}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/documents/${doc._id || doc.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link to={`/audit-trail/${doc._id || doc.id}`}>
                              <Button variant="ghost" size="sm" title="Audit Trail">
                                <History size={16} />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
