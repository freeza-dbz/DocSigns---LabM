import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signatureRequestSchema, SignatureRequestInput } from '@/schemas';
import { signatureApi } from '@/services/signatureApi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import TextArea from '@/components/common/TextArea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Plus, Trash2, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';

const SendDocument: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [signers, setSigners] = useState<Array<{ email: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SignatureRequestInput>({
    resolver: zodResolver(signatureRequestSchema),
  });

  const signerEmail = watch('signerEmail');
  const signerName = watch('signerName');

  const handleAddSigner = () => {
    if (signerEmail && signerName) {
      setSigners([...signers, { email: signerEmail, name: signerName }]);
      setValue('signerEmail', '');
      setValue('signerName', '');
    }
  };

  const handleRemoveSigner = (email: string) => {
    setSigners(signers.filter((s) => s.email !== email));
  };

  const onSubmit = async (data: SignatureRequestInput) => {
    if (!documentId || signers.length === 0) return;

    setIsSubmitting(true);
    try {
      // Send signature requests for each signer
      for (const signer of signers) {
        await signatureApi.createSignatureRequest(documentId, {
          signerName: signer.name,
          signerEmail: signer.email,
          status: 'pending',
          expirationDate: data.expirationDate,
          message: data.message,
        });
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        navigate(`/documents/${documentId}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to send document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Send for Signing</h1>
          <p className="text-text-secondary mt-2">Add signers and send your document</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Add Signers */}
          <Card>
            <CardHeader>
              <CardTitle>Add Signers</CardTitle>
              <CardDescription>Add the people who need to sign this document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Signer Name"
                  placeholder="John Doe"
                  error={errors.signerName?.message}
                  {...register('signerName')}
                />
                <Input
                  label="Signer Email"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.signerEmail?.message}
                  {...register('signerEmail')}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddSigner}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Add Signer
              </Button>

              {/* Signers List */}
              {signers.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Signers ({signers.length})</p>
                  {signers.map((signer, index) => (
                    <div
                      key={signer.email}
                      className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{signer.name}</p>
                        <p className="text-sm text-gray-600">{signer.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">#{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSigner(signer.email)}
                          className="text-danger hover:opacity-70 transition-opacity duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Set expiration and add a message for signers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Expiration Date"
                type="date"
                error={errors.expirationDate?.message}
                {...register('expirationDate', {
                  setValueAs: (v) => new Date(v),
                })}
              />

              <TextArea
                label="Message to Signers (Optional)"
                placeholder="Add a custom message for the signers..."
                rows={4}
                {...register('message')}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/documents/${documentId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={signers.length === 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              Send Document
            </Button>
          </div>
        </form>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Document Sent!"
          size="md"
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                Your document has been sent to {signers.length} signer{signers.length !== 1 ? 's' : ''}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                They'll receive an email with a link to sign the document
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SendDocument;
