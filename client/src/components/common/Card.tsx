import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'bg-card rounded-lg border border-border shadow-sm p-6 transition-colors duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('pb-4 border-b border-border', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => (
  <h2 className={cn('text-2xl font-bold text-text-primary', className)} {...props}>
    {children}
  </h2>
);

export const CardDescription: React.FC<CardProps> = ({ className, children, ...props }) => (
  <p className={cn('text-text-secondary text-sm', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('pt-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('pt-4 border-t border-border flex justify-between items-center', className)} {...props}>
    {children}
  </div>
);
