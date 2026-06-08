import React from 'react';
import { cn } from '@/lib/utils';
import { DocumentStatus, SignatureStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => {
  const variants = {
    default: 'bg-background-tertiary text-text-primary border border-border',
    success: 'bg-success-light text-success border border-success',
    warning: 'bg-warning-light text-warning border border-warning',
    danger: 'bg-danger-light text-danger border border-danger',
    info: 'bg-info-light text-info border border-info',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium inline-block transition-colors duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: DocumentStatus | SignatureStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, ...props }) => {
  const statusConfig = {
    draft: { label: 'Draft', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    viewed: { label: 'Viewed', variant: 'info' as const },
    signed: { label: 'Signed', variant: 'success' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    declined: { label: 'Declined', variant: 'danger' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};
