import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Building2 } from 'lucide-react';

interface PlaceholderProps {
  title?: string;
  message?: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({
  title = 'Coming Soon',
  message = 'This page is under development. Let us know what you\'d like to see here!',
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-200">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8">
          <Building2 className="mx-auto h-16 w-16 text-text-muted mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
          <p className="text-text-secondary mb-6">{message}</p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              fullWidth
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              fullWidth
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Placeholder;
