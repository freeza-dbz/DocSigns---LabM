import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { CheckCircle, FileText, Lock, Zap, Users, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const features = [
    {
      icon: FileText,
      title: 'Easy Document Upload',
      description: 'Upload PDF documents and manage them all in one secure place',
    },
    {
      icon: Zap,
      title: 'Quick Signature Fields',
      description: 'Drag and drop signature fields exactly where you need them',
    },
    {
      icon: Lock,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with audit trails and legal compliance',
    },
    {
      icon: Users,
      title: 'Multi-Signer Support',
      description: 'Send documents to multiple signers with custom requests',
    },
    {
      icon: Shield,
      title: 'Audit Trail',
      description: 'Complete history of every action with timestamps and IP logging',
    },
    {
      icon: CheckCircle,
      title: 'Real-time Tracking',
      description: 'Know exactly when documents are viewed, signed, or completed',
    },
  ];

  const stats = [
    { number: '10M+', label: 'Documents Signed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '50+', label: 'Countries' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background-secondary to-background-tertiary -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    ✨ Enterprise Document Signing
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight">
                  Sign Documents
                  <span className="text-primary"> Instantly</span>
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  SignDoc makes it easy to securely sign, send, and manage documents. Say goodbye to printing and scanning.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="text-base"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="text-base"
                >
                  Sign In
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-gray-700">No credit card required</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Takes less than 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-3xl opacity-10 blur-3xl" />
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl">
                <div className="aspect-video bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-24 h-24 text-white opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Everything you need to manage digital signatures at scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl p-8 border border-border hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                  <div className="inline-block p-3 bg-info-light rounded-lg mb-4">
                    <IconComponent className="text-info" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies using SignDoc to streamline their document signing process
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 hover:bg-gray-50 text-base"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-secondary text-text-muted py-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-text-primary">SignDoc</span>
            </div>
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} SignDoc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
