import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import ThemeToggle from '@/components/common/ThemeToggle';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-text-primary">SignDoc</span>
          </Link>

          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200">
                  Dashboard
                </Link>
                <Link to="/documents/upload" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200">
                  Upload
                </Link>
                <div className="flex items-center gap-4 pl-6 border-l border-border">
                  <div className="text-sm">
                    <p className="font-medium text-text-primary">{user?.fullName}</p>
                    <p className="text-text-muted text-xs">{user?.email}</p>
                  </div>
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200">
                  Login
                </Link>
                <ThemeToggle />
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
