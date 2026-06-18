import React, { useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { signatureApi } from '@/services/signatureApi';

import { documentApi } from '@/services/documentApi';

import Button from '@/components/common/Button';

import Input from '@/components/common/Input';

import TextArea from '@/components/common/TextArea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';

import { Plus, Trash2, AlertCircle } from 'lucide-react';

import Swal from 'sweetalert2';


const sendDocumentSchema = z.object({

  expirationDate: z.date({

    required_error: 'Expiration date is required',

    invalid_type_error: 'Invalid date format',

  }).min(new Date(), 'Expiration date must be in the future'),

  message: z.string().optional(),

});


type SendDocumentInput = z.infer<typeof sendDocumentSchema>;


const SendDocument: React.FC = () => {

  const { documentId } = useParams<{ documentId: string }>();

  const navigate = useNavigate();

  

  const [signers, setSigners] = useState<Array<{ email: string; name: string }>>([]);

  const [tempName, setTempName] = useState('');

  const [tempEmail, setTempEmail] = useState('');

  const [tempError, setTempError] = useState('');

  

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);


  const {

    register,

    handleSubmit,

    formState: { errors },

  } = useForm<SendDocumentInput>({

    resolver: zodResolver(sendDocumentSchema),

  });



  const handleAddSigner = () => {

    setTempError('');

    if (!tempName || tempName.trim().length < 2) {

      setTempError('Signer name is required (min 2 chars)');

      return;

    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!tempEmail || !emailRegex.test(tempEmail)) {

      setTempError('A valid signer email is required');

      return;

    }

    if (signers.some(s => s.email === tempEmail)) {

      setTempError('Signer with this email is already added');

      return;

    }

    

    setSigners([...signers, { email: tempEmail.trim(), name: tempName.trim() }]);

    setTempName('');

    setTempEmail('');

  };


  const handleRemoveSigner = (email: string) => {

    setSigners(signers.filter((s) => s.email !== email));

  };


  const onSubmit = async (data: SendDocumentInput) => {

    if (!documentId) return;

    

    if (signers.length === 0) {

      setApiError('Please add at least one signer.');

      return;

    }


    setIsSubmitting(true);

    setApiError(null);

    try {

      await documentApi.updateDocumentStatus(documentId, 'SENT');


      for (const signer of signers) {

        await signatureApi.createSignatureRequest(documentId, {

          documentId,

          signerName: signer.name,

          signerEmail: signer.email,

          status: 'pending',

          expirationDate: data.expirationDate,

          message: data.message,

        });

      }


      Swal.fire({

        position: 'center',

        icon: 'success',

        title: 'Document Sent!',

        text: 'Your document has been sent to ' + signers.length + ' signer(s).',

        showConfirmButton: false,

        timer: 2000,

      });


      setTimeout(() => {

        navigate('/documents/' + documentId);

      }, 2100);

    } catch (err: any) {

      console.error('Failed to send document:', err);

      let errorMsg = 'An error occurred while sending the document';


      if (err.response?.data) {

        errorMsg = err.response.data.message || errorMsg;

      } else if (err instanceof Error) {

        errorMsg = err.message;

      }


      setApiError(errorMsg);

      Swal.fire({

        position: 'center',

        icon: 'error',

        title: 'Send Failed',

        text: errorMsg,

        confirmButtonColor: '#ef4444',

      });

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




        {apiError && (

          <div className="mb-8 p-4 bg-danger-light border border-danger rounded-lg flex items-center gap-3">

            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />

            <p className="font-medium text-danger text-sm">{apiError}</p>

          </div>

        )}



        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

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

                  value={tempName}

                  onChange={(e) => setTempName(e.target.value)}

                />

                <Input

                  label="Signer Email"

                  type="email"

                  placeholder="john@example.com"

                  value={tempEmail}

                  onChange={(e) => setTempEmail(e.target.value)}

                />

              </div>

              

              {tempError && (

                <p className="text-sm text-danger mt-1">{tempError}</p>

              )}


              <Button

                type="button"

                variant="outline"

                onClick={handleAddSigner}

                className="flex items-center gap-2"

              >

                <Plus size={18} />

                Add Signer

              </Button>


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

                  setValueAs: (v) => (v ? new Date(v) : undefined),

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


          <div className="flex justify-between gap-4">

            <Button

              type="button"

              variant="outline"

              onClick={() => navigate('/documents/' + documentId)}

            >

              Cancel

            </Button>

            <Button

              type="submit"

              variant="primary"

              disabled={isSubmitting}

              isLoading={isSubmitting}

            >

              Send Document

            </Button>

          </div>

        </form>

      </div>

    </div>

  );

};


export default SendDocument;
