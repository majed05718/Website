'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Star, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { addCustomerNote } from '@/lib/api/customers';

const noteSchema = z.object({
  content: z.string().min(1, 'يجب إدخال محتوى الملاحظة'),
  isImportant: z.boolean().default(false),
});

type NoteForm = z.infer<typeof noteSchema>;

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
}

export function AddNoteDialog({ 
  open, 
  onOpenChange, 
  customerId,
  onSuccess 
}: AddNoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
      isImportant: false,
    },
  });

  const isImportant = watch('isImportant');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: NoteForm) => {
    setIsSubmitting(true);
    try {
      await addCustomerNote(
        customerId,
        data.content,
        data.isImportant,
        tags.length > 0 ? tags : undefined
      );
      
      toast.success('تم إضافة الملاحظة بنجاح');
      reset();
      setTags([]);
      setTagInput('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('حدث خطأ في إضافة الملاحظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
          <DialogDescription>
            أضف ملاحظة مهمة حول هذا العميل
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المحتوى <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('content')}
              placeholder="اكتب ملاحظتك هنا..."
              rows={5}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Important Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isImportant"
              checked={isImportant}
              onCheckedChange={(checked) => setValue('isImportant', checked as boolean)}
            />
            <label
              htmlFor="isImportant"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Star className={`h-4 w-4 ${isImportant ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              ملاحظة مهمة
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوسوم (اختياري)
            </label>
            
            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="أضف وسم..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                إضافة
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
