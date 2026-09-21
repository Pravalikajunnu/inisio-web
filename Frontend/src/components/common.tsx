import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} text-blue-600 animate-spin`} />
      {label && <span className="text-xs text-zinc-500 font-medium">{label}</span>}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 bg-zinc-200/70 rounded-2xl w-full" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-zinc-200/60 rounded-xl" />
        <div className="h-24 bg-zinc-200/60 rounded-xl" />
        <div className="h-24 bg-zinc-200/60 rounded-xl" />
        <div className="h-24 bg-zinc-200/60 rounded-xl" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-zinc-200/50 rounded-2xl" />
        <div className="h-96 bg-zinc-200/50 rounded-2xl" />
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  DashboardSkeleton
};
