'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Templates Gallery - معرض القوالب
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لعرض القوالب في grid layout
 */

import { TemplateCard } from './TemplateCard'
import type { Template } from '@/types/template'

interface TemplatesGalleryProps {
  templates: Template[]
}

export function TemplatesGallery({ templates }: TemplatesGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
