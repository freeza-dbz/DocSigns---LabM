import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/schemas';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Card, CardContent } from '@/components/common/Card';
import { AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const storeTokenInLS = (token: string) => {
  localStorage.setItem('token', token);
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
      };

      const response = await apiClient.post('/v1/users/register', payload);
      const res_data = response.data;

      if (res_data.success || response.status === 201) {
        // Success case
        if (res_data.data?.accessToken) {
          storeTokenInLS(res_data.data.accessToken);
        } else if (res_data.data?.refreshToken) {
          storeTokenInLS(res_data.data.refreshToken);
        } else if (res_data.token) {
          storeTokenInLS(res_data.token);
        }

        const userData = res_data.data?.user || res_data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Account Created!',
          text: 'Your account has been successfully created.',
          showConfirmButton: false,
          timer: 2000,
          showClass: {
            popup: `
              animate__animated
              animate__fadeInUp
              animate__faster
            `,
          },
          hideClass: {
            popup: `
              animate__animated
              animate__fadeOutDown
              animate__faster
            `,
          },
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2100);
      } else {
        // Error case
        console.log('Signup error response:', res_data);
        const errorMessage =
          res_data?.message ||
          res_data?.error?.message ||
          res_data?.error ||
          `Signup failed. Please try again.`;

        setApiError(errorMessage);

        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Signup Failed',
          text: errorMessage,
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err: any) {
      console.error('Signup network error:', err);
      let errorMsg = 'An error occurred during signup';

      if (err.response?.data) {
        const res_data = err.response.data;
        errorMsg =
          res_data?.message ||
          res_data?.error?.message ||
          res_data?.error ||
          errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setApiError(errorMsg);

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary px-4 transition-colors duration-200">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary text-sm mt-2">Join SignDoc to start signing documents</p>
        </div>

        <CardContent>
          {apiError && (
            <div className="mb-4 p-4 bg-danger-light border border-danger rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
              <p className="font-medium text-danger text-sm">{apiError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-text-secondary pt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:opacity-80 font-medium transition-opacity duration-200">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;