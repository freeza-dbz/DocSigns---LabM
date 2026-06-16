import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Input from '@/components/common/Input';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
}

const SignaturePadModal: React.FC<SignaturePadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [font, setFont] = useState('font-cursive');
  const sigCanvas = useRef<SignatureCanvas>(null);

  if (!isOpen) return null;

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    let signatureData = '';
    if (tab === 'draw' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
      signatureData = sigCanvas.current.toDataURL('image/png');
    } else if (tab === 'type' && typedSignature.trim()) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        let fontStyle = '48px';
        if (font === 'font-cursive') fontStyle += ' "Great Vibes", cursive';
        else if (font === 'font-sans') fontStyle += ' "Helvetica", sans-serif';
        else fontStyle += ' "Times New Roman", serif';
        ctx.font = fontStyle;
        ctx.fillText(typedSignature, 20, 90);
        signatureData = canvas.toDataURL('image/png');
      }
    }

    if (signatureData) {
      onSave(signatureData);
    }
  };

  const fonts = {
    'font-cursive': 'Cursive',
    'font-sans': 'Sans-Serif',
    'font-serif': 'Serif',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create Your Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${tab === 'draw' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
              onClick={() => setTab('draw')}
            >
              Draw
            </button>
            <button
              className={`px-4 py-2 ${tab === 'type' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
              onClick={() => setTab('type')}
            >
              Type
            </button>
          </div>

          {tab === 'draw' && (
            <div className="border rounded-lg">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: 'w-full h-48 rounded-lg' }}
              />
            </div>
          )}

          {tab === 'type' && (
            <div className="space-y-4">
              <Input
                placeholder="Type your name"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className={`${font} text-3xl`}
              />
              <div className="flex gap-2">
                {Object.entries(fonts).map(([key, name]) => (
                  <Button
                    key={key}
                    variant={font === key ? 'primary' : 'outline'}
                    onClick={() => setFont(key)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <div>
              {tab === 'draw' && (
                <Button variant="ghost" onClick={clear}>
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save}>
                Apply & Sign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* For the cursive font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .font-cursive { font-family: 'Great Vibes', cursive; }
        .font-sans { font-family: 'Helvetica', sans-serif; }
        .font-serif { font-family: 'Times New Roman', serif; }
      `}</style>
    </div>
  );
};

export default SignaturePadModal;