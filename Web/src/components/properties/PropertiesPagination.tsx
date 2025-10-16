'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PropertiesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PropertiesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PropertiesPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // عدد الصفحات المرئية

    if (totalPages <= showPages) {
      // إذا كان العدد قليل، اعرض الكل
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // دائماً اعرض الصفحة الأولى
      pages.push(1);

      // الصفحات الوسطى
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // دائماً اعرض الصفحة الأخيرة
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* الذهاب للأولى */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronsRight className="w-4 h-4" />
        <span className="hidden sm:inline">الأولى</span>
      </Button>

      {/* السابق */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="w-4 h-4" />
        <span className="hidden sm:inline">السابق</span>
      </Button>

      {/* أرقام الصفحات */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={currentPage === page ? 'bg-[#0066CC]' : ''}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* التالي */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline">التالي</span>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* الذهاب للأخيرة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        <span className="hidden sm:inline">الأخيرة</span>
        <ChevronsLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}