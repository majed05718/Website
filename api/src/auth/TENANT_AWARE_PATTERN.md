# Tenant-Aware Service Pattern

## Overview

All database queries in the Real Estate Management System MUST be scoped by `officeId` to prevent data leaks between tenants (real estate offices). This document provides patterns and examples for implementing tenant-aware queries.

## Core Principle: Zero Trust

**Never trust the user to provide their own `officeId`**. Always extract it from the authenticated JWT token.

## Pattern 1: Controller Level - Extract officeId from JWT

Every controller method must extract `officeId` from `req.user`:

```typescript
@Get()
@Roles('SystemAdmin', 'OfficeAdmin', 'Manager', 'Staff')
async list(@Req() req: any, @Query() filters: FilterDto) {
  // ✅ CORRECT: Extract from JWT token (populated by JwtAuthGuard)
  const officeId = req?.user?.office_id || req?.user?.officeId;
  
  // ❌ WRONG: Never accept office_id from query params or body
  // const officeId = filters.office_id; // SECURITY VULNERABILITY!
  
  return this.service.findAll(officeId, filters);
}
```

## Pattern 2: Service Level - Always Filter by officeId

### Example 1: TypeORM Repository (When Implemented)

```typescript
@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async findAll(officeId: string, filters: FilterPropertiesDto) {
    // ✅ CORRECT: officeId is always in WHERE clause
    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .where('property.office_id = :officeId', { officeId });

    // Add additional filters
    if (filters.status) {
      queryBuilder.andWhere('property.status = :status', { status: filters.status });
    }

    return await queryBuilder.getMany();
  }

  async findById(officeId: string, propertyId: string) {
    // ✅ CORRECT: Both officeId AND id in WHERE clause
    const property = await this.propertyRepository.findOne({
      where: {
        id: propertyId,
        office_id: officeId, // Critical: Prevents cross-tenant access
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }
}
```

### Example 2: Supabase Client (Current Implementation)

```typescript
@Injectable()
export class PropertiesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(officeId: string, filters: FilterPropertiesDto) {
    // ✅ CORRECT: .eq('office_id', officeId) is ALWAYS first filter
    let query = this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('office_id', officeId); // Must be first!

    // Add additional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  async findById(officeId: string, propertyId: string) {
    // ✅ CORRECT: Filter by BOTH office_id AND id
    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('office_id', officeId) // Critical security filter
      .single();

    if (error || !data) {
      throw new NotFoundException('Property not found');
    }

    return data;
  }
}
```

## Common Pitfalls & Security Vulnerabilities

### ❌ VULNERABILITY 1: Missing officeId Filter

```typescript
// ❌ WRONG: Returns ALL properties across ALL offices
async findAll() {
  return await this.supabase.getClient()
    .from('properties')
    .select('*');
}
```

**Impact:** Office A can see Office B's properties

---

### ❌ VULNERABILITY 2: Trusting Client-Provided officeId

```typescript
// ❌ WRONG: User can manipulate officeId in request body
@Post()
async create(@Body() dto: CreatePropertyDto) {
  // User sends: { office_id: 'someone-elses-office', ... }
  return await this.service.create(dto.office_id, dto);
}
```

**Impact:** User can create properties in other offices

---

### ❌ VULNERABILITY 3: Only Filtering by ID (Assuming Uniqueness)

```typescript
// ❌ WRONG: IDs are globally unique, but still need tenant scope
async findById(propertyId: string) {
  return await this.supabase.getClient()
    .from('properties')
    .select('*')
    .eq('id', propertyId) // Missing .eq('office_id', officeId)
    .single();
}
```

**Impact:** If user guesses/finds another office's property UUID, they can access it

---

## Pattern 3: Composite Indexes for Performance

When filtering by `office_id`, ensure database has proper indexes:

```typescript
// In entity definition
@Entity('properties')
export class Property {
  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  // Composite index for common query patterns
  @Index(['office_id', 'status'])
  composite_office_status?: void;
}
```

**Why:** `office_id` is in every query. Without an index, every query performs a full table scan.

---

## Pattern 4: Testing Tenant Isolation

Every service method should have a test verifying tenant isolation:

```typescript
describe('PropertiesService - Tenant Isolation', () => {
  it('should NOT return properties from different office', async () => {
    const officeA = 'office-a-id';
    const officeB = 'office-b-id';

    // Create property in office A
    await service.create(officeA, { title: 'Property A' });

    // Try to fetch from office B
    const results = await service.findAll(officeB, {});

    // Should return empty array, not Property A
    expect(results).toHaveLength(0);
  });
});
```

---

## Checklist: Implementing a New Service Method

Before deploying a new service method, verify:

- [ ] `officeId` parameter is ALWAYS required (except public endpoints)
- [ ] `officeId` is extracted from `req.user` in controller, NOT from request body/query
- [ ] Database query includes `.eq('office_id', officeId)` or `WHERE office_id = ?`
- [ ] Method signature is: `methodName(officeId: string, ...otherParams)`
- [ ] Service method is called as: `this.service.method(req.user.officeId, ...)`
- [ ] Tenant isolation test exists

---

## Exception: SystemAdmin Cross-Tenant Access

`SystemAdmin` role may need to access data across all offices for administrative purposes:

```typescript
@Get('admin/all-properties')
@Roles('SystemAdmin')
async getAllProperties(@Req() req: any, @Query() filters: FilterDto) {
  const userRole = req.user.role;

  if (userRole === 'SystemAdmin') {
    // SystemAdmin: Query without office_id filter
    return this.service.findAllGlobal(filters);
  } else {
    // Regular users: Scoped to their office
    const officeId = req.user.officeId;
    return this.service.findAll(officeId, filters);
  }
}
```

**Important:** Document this exception clearly and add audit logging.

---

## Summary

**Golden Rule:** Every query MUST filter by `office_id` from the authenticated user's JWT token.

**Service Method Signature:**
```typescript
async methodName(officeId: string, ...otherParams): Promise<Result> {
  // Always filter by officeId first
}
```

**Controller Pattern:**
```typescript
@Get()
@Roles('Manager', 'Staff')
async endpoint(@Req() req: any, @Query() filters: FilterDto) {
  const officeId = req.user.officeId; // From JWT
  return this.service.methodName(officeId, filters);
}
```

This pattern prevents **100% of cross-tenant data leaks** when applied consistently.
