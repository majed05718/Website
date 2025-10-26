# 🏗️ Templates Implementation Details

## Overview
Complete Excel templates system for customers with predefined and custom templates.

---

## Architecture

```
templates/
├── Types Layer         → template.ts
├── Page Layer          → page.tsx
├── Components Layer    → 4 components
└── Utilities Layer     → template-generator.ts
```

---

## Components

### 1. TemplatesGallery
**Purpose**: Display templates in grid layout

**Props**:
```typescript
interface TemplatesGalleryProps {
  templates: Template[]
}
```

**Usage**:
```tsx
<TemplatesGallery templates={predefinedTemplates} />
```

---

### 2. TemplateCard
**Purpose**: Display single template with download options

**Props**:
```typescript
interface TemplateCardProps {
  template: Template
}
```

**Features**:
- Quick download (Excel with examples)
- Dropdown menu (CSV, empty Excel)
- Expandable fields list
- Icon and color coding

---

### 3. MyTemplates
**Purpose**: Manage custom templates

**Props**:
```typescript
interface MyTemplatesProps {
  templates: Template[]
  onEdit: (template: Template) => void
  onDelete: (templateId: string) => void
}
```

**Features**:
- Grid layout
- Download/Edit/Delete actions
- Creation date display

---

### 4. CustomTemplateCreator
**Purpose**: Create/Edit custom templates

**Props**:
```typescript
interface CustomTemplateCreatorProps {
  template: Template | null
  onSave: (template: any) => void
  onCancel: () => void
}
```

**Features**:
- Field selection (14 available)
- Field reordering (up/down buttons)
- Preview
- Select All/Deselect All

---

## Template Generator

### Main Function
```typescript
async function downloadTemplate(
  template: Template,
  options: TemplateDownloadOptions
): Promise<void>
```

### Excel Features
- ✅ Styled headers (blue background, white text)
- ✅ Example row (gray, italic)
- ✅ Data validation (dropdowns)
- ✅ Instructions sheet
- ✅ Auto column width
- ✅ UTF-8 support

### CSV Features
- ✅ Simple text format
- ✅ UTF-8 with BOM
- ✅ Optional examples

---

## State Management

### Page State
```typescript
const [customTemplates, setCustomTemplates] = useState<Template[]>([])
const [showCustomCreator, setShowCustomCreator] = useState(false)
const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
```

### Actions
- `handleSaveCustomTemplate`: Add new template
- `handleUpdateCustomTemplate`: Update existing
- `handleDeleteCustomTemplate`: Delete with confirmation
- `handleEditCustomTemplate`: Open editor

---

## Data Flow

### Download Flow
```
User clicks "Download"
↓
TemplateCard calls downloadTemplate()
↓
template-generator creates workbook
↓
XLSX.write() generates binary
↓
file-saver downloads file
↓
User gets Excel file
```

### Custom Template Flow
```
User clicks "Create Custom"
↓
CustomTemplateCreator opens
↓
User selects fields
↓
User reorders fields
↓
User clicks "Save"
↓
Page state updates
↓
Template appears in MyTemplates
```

---

## Future Enhancements

### Backend Integration
```typescript
// Save to database
POST /api/customers/templates/custom
Body: { name, description, fields }

// Load user templates
GET /api/customers/templates
Response: Template[]

// Update template
PUT /api/customers/templates/:id
Body: { name, description, fields }

// Delete template
DELETE /api/customers/templates/:id
```

### LocalStorage Persistence
```typescript
// Save on change
useEffect(() => {
  localStorage.setItem('customTemplates', JSON.stringify(customTemplates))
}, [customTemplates])

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('customTemplates')
  if (saved) setCustomTemplates(JSON.parse(saved))
}, [])
```

### Drag & Drop
```typescript
// With react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return
  const items = Array.from(selectedFields)
  const [reorderedItem] = items.splice(result.source.index, 1)
  items.splice(result.destination.index, 0, reorderedItem)
  setSelectedFields(items)
}
```

---

## Testing

### Manual Tests
- ✅ Download predefined templates
- ✅ Download as Excel/CSV
- ✅ Create custom template
- ✅ Edit custom template
- ✅ Delete custom template
- ✅ Reorder fields
- ✅ Preview functionality

### Unit Tests (Future)
```typescript
// template-generator.test.ts
describe('Template Generator', () => {
  it('should generate Excel with headers', async () => {
    const template = PREDEFINED_TEMPLATES[0]
    const result = await generateExcelTemplate(template, {
      format: 'xlsx',
      includeExamples: true,
      includeInstructions: true,
      includeValidation: true
    })
    expect(result).toBeDefined()
  })
})
```

---

## Performance

### Optimizations
- Templates generated on-demand
- No unnecessary re-renders
- Lazy loading for instructions sheet
- Minimal state updates

### Bundle Size
- xlsx: ~500KB
- file-saver: ~5KB
- Components: ~50KB
- Total: ~555KB (acceptable)

---

## Accessibility

- ✅ RTL support
- ✅ Arabic labels
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Color contrast (WCAG AA)

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not tested)

---

## Dependencies

```json
{
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16"
}
```

---

## License
Part of the main project license.
