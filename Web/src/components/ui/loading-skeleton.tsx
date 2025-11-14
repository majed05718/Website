'use client';

/**
 * Reusable loading skeletons for dynamic imports
 */

import { Loader2 } from 'lucide-react';

export function ChartLoadingSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
    </div>
  );
}

export function ComponentLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-8 bg-gray-100 rounded w-1/2"></div>
    </div>
  );
}
