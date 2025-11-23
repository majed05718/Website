# API Error Handling Best Practices

## Overview

All API calls in the frontend MUST be wrapped in proper error handling to provide a good user experience and prevent application crashes. The Axios interceptor handles global errors (401, 403, 5xx), but component-level error handling is still required for:
- Setting loading states
- Displaying success messages
- Handling business logic errors
- Graceful degradation

## Core Pattern: Try-Catch-Finally with Toast Notifications

### Standard Pattern

```typescript
'use client'

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/endpoint');
      
      // Success: Update state
      setData(response.data);
      
      // Optional: Show success toast
      toast.success('تم تحميل البيانات بنجاح', {
        description: 'Data loaded successfully',
      });
    } catch (err: any) {
      // Error: Set error state
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات';
      setError(errorMessage);
      
      // Note: Axios interceptor already shows toast for 401/403/5xx
      // Only show toast here for business logic errors (4xx except 401/403)
      if (err.response?.status && err.response.status >= 400 && err.response.status < 500) {
        if (err.response.status !== 401 && err.response.status !== 403) {
          toast.error(errorMessage);
        }
      }
      
      console.error('Error fetching data:', err);
    } finally {
      // Always: Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {data && <div>{/* Render data */}</div>}
    </div>
  );
}
```

## Pattern 1: GET Request (Fetching Data)

```typescript
const fetchProperties = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await api.get('/api/properties', {
      params: { status: 'available' },
    });
    
    setProperties(response.data.data);
    setTotal(response.data.total);
  } catch (err: any) {
    console.error('Error fetching properties:', err);
    setError('فشل تحميل العقارات');
    // Axios interceptor handles toast notifications
  } finally {
    setIsLoading(false);
  }
};
```

## Pattern 2: POST Request (Creating Data)

```typescript
const createProperty = async (propertyData: CreatePropertyDto) => {
  setIsSubmitting(true);

  try {
    const response = await api.post('/api/properties', propertyData);
    
    // Success: Show toast and redirect
    toast.success('تم إضافة العقار بنجاح', {
      description: 'Property created successfully',
    });
    
    // Redirect or update state
    router.push(`/dashboard/properties/${response.data.property.id}`);
  } catch (err: any) {
    console.error('Error creating property:', err);
    
    // Business logic error (e.g., duplicate property code)
    if (err.response?.status === 400) {
      toast.error(err.response.data.message || 'بيانات غير صحيحة');
    }
    // Axios interceptor handles other errors
  } finally {
    setIsSubmitting(false);
  }
};
```

## Pattern 3: PATCH/PUT Request (Updating Data)

```typescript
const updateProperty = async (id: string, updates: Partial<Property>) => {
  setIsUpdating(true);

  try {
    const response = await api.patch(`/api/properties/${id}`, updates);
    
    // Success: Update local state + toast
    setProperty(response.data.property);
    toast.success('تم تحديث العقار بنجاح', {
      description: 'Property updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating property:', err);
    // Axios interceptor handles toast
  } finally {
    setIsUpdating(false);
  }
};
```

## Pattern 4: DELETE Request (Deleting Data)

```typescript
const deleteProperty = async (id: string) => {
  // Confirm before deleting
  if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) {
    return;
  }

  setIsDeleting(true);

  try {
    await api.delete(`/api/properties/${id}`);
    
    // Success: Remove from state + toast
    setProperties(prev => prev.filter(p => p.id !== id));
    toast.success('تم حذف العقار بنجاح', {
      description: 'Property deleted successfully',
    });
  } catch (err: any) {
    console.error('Error deleting property:', err);
    // Axios interceptor handles toast
  } finally {
    setIsDeleting(false);
  }
};
```

## Pattern 5: useEffect Data Fetching

```typescript
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      // Don't show toast in useEffect (already handled by interceptor)
      // Just log the error
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [/* dependencies */]);
```

## Pattern 6: Multiple Parallel Requests

```typescript
const loadPageData = async () => {
  setIsLoading(true);

  try {
    // Execute all requests in parallel
    const [propertiesRes, statsRes, contractsRes] = await Promise.all([
      api.get('/api/properties'),
      api.get('/api/stats'),
      api.get('/api/contracts'),
    ]);

    // Update all state
    setProperties(propertiesRes.data.data);
    setStats(statsRes.data);
    setContracts(contractsRes.data.data);
  } catch (err) {
    console.error('Error loading page data:', err);
    // If ANY request fails, show error
    toast.error('فشل تحميل البيانات');
  } finally {
    setIsLoading(false);
  }
};
```

## Pattern 7: File Upload with Progress

```typescript
const uploadFile = async (file: File) => {
  setIsUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        setUploadProgress(percentCompleted);
      },
    });

    toast.success('تم رفع الملف بنجاح');
    return response.data.url;
  } catch (err) {
    console.error('Error uploading file:', err);
    toast.error('فشل رفع الملف');
    throw err;
  } finally {
    setIsUploading(false);
  }
};
```

## Anti-Patterns (❌ AVOID)

### ❌ Anti-Pattern 1: No Error Handling

```typescript
// WRONG: No try-catch, will crash on error
const fetchData = async () => {
  const response = await api.get('/api/data');
  setData(response.data);
};
```

### ❌ Anti-Pattern 2: Not Setting Loading State

```typescript
// WRONG: User has no feedback that request is in progress
const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    setData(response.data);
  } catch (err) {
    console.error(err);
  }
};
```

### ❌ Anti-Pattern 3: Forgetting Finally Block

```typescript
// WRONG: Loading state never resets on error
const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await api.get('/api/data');
    setData(response.data);
    setIsLoading(false); // ❌ Won't run if error occurs
  } catch (err) {
    console.error(err);
  }
};
```

### ❌ Anti-Pattern 4: Silent Failures

```typescript
// WRONG: Error is caught but user sees nothing
const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    setData(response.data);
  } catch (err) {
    // Error silently swallowed - user has no idea what happened
  }
};
```

### ❌ Anti-Pattern 5: Duplicate Toast Notifications

```typescript
// WRONG: Axios interceptor already shows toast for 401/403/5xx
const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    setData(response.data);
  } catch (err) {
    // Axios interceptor already showed toast
    toast.error('Error occurred'); // ❌ Duplicate notification!
  }
};
```

## Error State Management

### Option 1: Local Error State (Simple)

```typescript
const [error, setError] = useState<string | null>(null);

// In try-catch
catch (err: any) {
  const message = err.response?.data?.message || 'حدث خطأ';
  setError(message);
}

// In JSX
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

### Option 2: Toast Only (Recommended)

```typescript
// Don't store error in state, just show toast
catch (err: any) {
  console.error(err);
  // Axios interceptor handles toast for most errors
  // Only add custom toast for specific business logic errors
}
```

### Option 3: Error Boundary (Advanced)

For critical errors that should crash the component tree:

```typescript
throw new Error('Critical error: API unavailable');
```

## Loading State Best Practices

### Multiple Loading States

```typescript
const [isLoadingProperties, setIsLoadingProperties] = useState(false);
const [isLoadingStats, setIsLoadingStats] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

// Different loading states for different operations
// Prevents race conditions and provides granular UX feedback
```

### Loading UI Examples

```typescript
// Skeleton Loading
{isLoading && <PropertySkeleton />}
{!isLoading && properties.map(p => <PropertyCard key={p.id} property={p} />)}

// Spinner Loading
{isLoading ? (
  <div className="flex justify-center">
    <Spinner />
  </div>
) : (
  <PropertyList properties={properties} />
)}

// Button Loading
<button disabled={isSubmitting}>
  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
</button>
```

## Checklist for Every API Call

Before deploying a component with API calls, verify:

- [ ] Wrapped in try-catch-finally
- [ ] Loading state set at start
- [ ] Loading state reset in finally block
- [ ] Success case updates state correctly
- [ ] Error case logs to console
- [ ] Appropriate toast notifications (avoid duplicates with interceptor)
- [ ] User receives feedback for all states (loading, success, error)
- [ ] No silent failures

## Testing Error Scenarios

Test your error handling by:

1. **Simulating 401**: Remove auth token from localStorage
2. **Simulating 403**: Try accessing admin-only endpoint as regular user
3. **Simulating 500**: Configure backend to throw error
4. **Simulating timeout**: Set very low timeout in Axios config
5. **Simulating network error**: Turn off internet connection

## Summary

**Golden Rules:**
1. Always use try-catch-finally
2. Always set and reset loading states
3. Always log errors to console
4. Don't duplicate toast notifications (interceptor handles 401/403/5xx)
5. Provide user feedback for all states

**Standard Template:**
```typescript
const apiCall = async () => {
  setIsLoading(true);
  try {
    const response = await api.method(url, data);
    // Handle success
  } catch (err) {
    console.error('Error:', err);
    // Axios interceptor handles most toasts
  } finally {
    setIsLoading(false);
  }
};
```

This pattern ensures:
- ✅ No application crashes
- ✅ User always has feedback
- ✅ Errors are logged for debugging
- ✅ Professional user experience
