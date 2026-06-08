import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    fullWidth,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 focus:ring-primary',
      secondary: 'bg-background-secondary text-text-primary hover:bg-background-tertiary disabled:opacity-50 dark:hover:bg-background-tertiary focus:ring-primary',
      outline: 'border-2 border-border text-text-primary hover:bg-background-secondary disabled:opacity-50 dark:hover:bg-surface-secondary focus:ring-primary',
      ghost: 'text-text-primary hover:bg-background-secondary disabled:opacity-50 dark:hover:bg-surface-secondary focus:ring-primary',
      destructive: 'bg-danger text-danger-light hover:opacity-90 disabled:opacity-50 focus:ring-danger',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
