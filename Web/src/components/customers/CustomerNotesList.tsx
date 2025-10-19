'use client';

import { useState } from 'react';
import { Edit, Trash2, Star, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CustomerNote } from '@/types/customer';
import { formatDate, formatRelativeTime } from '@/lib/customers-utils';
import { deleteCustomerNote } from '@/lib/api/customers';

interface CustomerNotesListProps {
  notes: CustomerNote[];
  customerId: string;
  onRefresh?: () => void;
}

export function CustomerNotesList({ notes, customerId, onRefresh }: CustomerNotesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteCustomerNote(customerId, deleteId);
      toast.success('تم حذف الملاحظة بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف الملاحظة');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Star className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد ملاحظات
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم إضافة أي ملاحظات لهذا العميل بعد
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
              note.isImportant ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {note.isImportant && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
                <span className="text-sm text-gray-600">
                  {formatRelativeTime(note.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(note.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-900 whitespace-pre-wrap mb-3">{note.content}</p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
              <span>بواسطة: {note.createdByName}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
