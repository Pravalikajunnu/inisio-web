import React from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
};

const spinnerSizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      aria-label="Loading"
      className={`${spinnerSizes[size]} animate-spin rounded-full border-slate-200 border-t-slate-700`}
      role="status"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" className="space-y-6" role="status">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}
