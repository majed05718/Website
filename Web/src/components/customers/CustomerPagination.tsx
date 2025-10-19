'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomersStore } from '@/store/customers-store';

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function CustomerPagination({
  currentPage,
  totalPages,
  totalCount,
}: CustomerPaginationProps) {
  const { setPage } = useCustomersStore();

  const handlePrevious = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setPage(page);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * 20 + 1;
  const endItem = Math.min(currentPage * 20, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
      {/* Mobile View */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          السابق
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          التالي
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            عرض{' '}
            <span className="font-medium">{startItem}</span>
            {' '}إلى{' '}
            <span className="font-medium">{endItem}</span>
            {' '}من{' '}
            <span className="font-medium">{totalCount}</span>
            {' '}نتيجة
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="rounded-l-md rounded-r-none"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => handlePageClick(pageNum)}
                  className="rounded-none"
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-r-md rounded-l-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
