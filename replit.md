# Property Management System

## Overview

A comprehensive property management platform built with a modern microservices architecture. The system enables real estate offices to manage properties, rental contracts, payments, maintenance requests, and tenant communications through WhatsApp integration. It provides multi-tenant support with office-based isolation, role-based access control, and real-time analytics.

## Recent Changes

**October 14, 2025 - Complete TypeORM to Supabase Migration:**
- ✅ Migrated entire backend from TypeORM to Supabase JS Client
- ✅ Removed all TypeORM dependencies (typeorm, @nestjs/typeorm packages)
- ✅ Deleted all entity files (*.entity.ts) and TypeORM repositories
- ✅ Converted all 10+ services to use Supabase queries:
  - Properties, Payments, Maintenance, WhatsApp, Analytics, Onboarding
  - Common interceptors, filters, and N8n integration
- ✅ Updated database operations:
  - repository.find() → supabase.from('table').select()
  - repository.findOne() → supabase.from('table').select().eq().single()
  - repository.save/insert() → supabase.from('table').insert()
  - repository.update() → supabase.from('table').update().eq()
- ✅ Changed naming convention from camelCase to snake_case for database columns
- ✅ API Backend running successfully on port 3001
- ✅ Frontend running successfully on port 5000
- ✅ All routes properly mapped and accessible
- ✅ Swagger documentation available at /api/docs

**Reason for Migration:**
Replit environment doesn't support IPv6 connections, but Supabase direct connections require IPv6. TypeORM with pg library had SASL authentication and SSL certificate issues with Supabase pooler. Migrating to Supabase JS Client resolved all connection issues.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **State Management**: Zustand for global state, React Query (@tanstack/react-query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

**Design Decisions:**
- **Multi-App Structure**: Three separate Next.js applications (`Web/`, `next-app/`) supporting different use cases or deployment targets
- **Type Safety**: Full TypeScript implementation with strict compiler options
- **Component Library**: shadcn/ui for consistent, accessible UI components
- **Responsive Design**: Mobile-first approach with Tailwind utility classes
- **RTL Support**: Built-in support for Arabic language (dir="rtl")

### Backend Architecture

**Technology Stack:**
- **Framework**: NestJS 10.3.0 with TypeScript
- **Runtime**: Node.js with Express platform
- **Authentication**: Passport.js with JWT strategy via Supabase Auth
- **Validation**: class-validator and class-transformer for DTO validation
- **Documentation**: Swagger/OpenAPI for API documentation
- **File Processing**: Multer for file uploads, Sharp for image processing, XLSX for Excel import/export

**Architectural Patterns:**
- **Modular Design**: Feature-based module structure (Properties, Payments, Maintenance, Analytics, WhatsApp, Onboarding)
- **Middleware Chain**: JWT extraction → User enrichment → Role-based authorization
- **Global Services**: SupabaseService as global module for database access
- **Interceptors & Filters**: Activity logging, error handling, and response sanitization
- **Rate Limiting**: Three-tier throttling (default: 1000/min, public: 100/min, authenticated: 20/min)

**Security Measures:**
- Helmet.js for HTTP security headers
- CORS with dynamic origin validation (supports Replit environments)
- Input validation and sanitization on all endpoints
- Role-based access control (manager, staff, technician, accountant, owner, tenant)
- Sensitive data filtering in logs and error responses
- Sentry integration for error monitoring with data scrubbing

**API Structure:**
- RESTful endpoints with consistent response formats
- Role-based route protection using `@Roles()` decorator
- Multi-tenant isolation via `office_id` filtering
- Public endpoints for property listings and maintenance requests
- Webhook endpoints for WhatsApp and n8n integrations

### Data Storage Solutions

**Primary Database:**
- **Platform**: Supabase (PostgreSQL-based)
- **Client**: @supabase/supabase-js (Direct Client Pattern, no ORM)
- **Access Method**: Service role key for backend, anon key for frontend
- **Migration**: Transitioned from TypeORM to Supabase JS Client (October 14, 2025)
- **Configuration**: Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables

**Database Schema:**
- **Multi-tenancy**: Office-based isolation with `office_id` foreign keys
- **Core Entities**: offices, properties, property_images, rental_contracts, rental_payments, maintenance_requests, user_permissions, activity_logs
- **Stored Procedures**: Custom RPC functions for analytics (get_properties_by_status, get_active_contracts_count, get_monthly_revenue, get_maintenance_by_status)

**File Storage:**
- **Platform**: Supabase Storage
- **Bucket**: `properties` for property images
- **Upload Strategy**: Signed upload URLs with 10-minute expiration
- **Organization**: `{office_id}/{property_id}/{uuid}-{filename}` structure
- **Supported Formats**: JPEG, PNG, WebP

### Authentication & Authorization

**Authentication Flow:**
- **Provider**: Supabase Auth
- **Method**: JWT tokens in Authorization header
- **Middleware**: Custom JwtMiddleware extracts and validates tokens
- **User Enrichment**: Injects user data (user_id, office_id, role, phone) into request object

**Authorization Strategy:**
- **Guard**: RolesGuard checks required roles via `@Roles()` decorator
- **Role Hierarchy**: manager > staff > technician > accountant > owner > tenant
- **Enforcement**: Controller-level and route-level role restrictions
- **Error Handling**: Distinguishes between unauthenticated (401) and forbidden (403)

**User Metadata:**
- **Storage**: Supabase user app_metadata and user_metadata
- **Office Association**: Each user linked to an office via office_id
- **Role Assignment**: User permissions stored in user_permissions table

## External Dependencies

### Third-Party Services

**Supabase:**
- **Purpose**: Backend-as-a-Service (Database, Auth, Storage)
- **Configuration**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Usage**: All data persistence, user authentication, file storage

**Sentry:**
- **Purpose**: Error monitoring and performance tracking
- **Configuration**: SENTRY_DSN
- **Integration**: Both frontend and backend with sensitive data filtering

**PostHog (Planned):**
- **Purpose**: Product analytics and feature flags
- **Configuration**: NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
- **Integration**: Client-side tracking with page view events

**Meta WhatsApp Business API:**
- **Purpose**: Tenant communication and maintenance notifications
- **Configuration**: Office-level (whatsapp_api_url, whatsapp_api_token, whatsapp_phone_number_id)
- **Features**: Template messages, webhook handling, reminder sending

**n8n (Automation Platform):**
- **Purpose**: Workflow automation for maintenance and payments
- **Configuration**: N8N_WHATSAPP_WEBHOOK_URL, office-specific webhook URLs
- **Integration**: Webhook triggers for maintenance requests and WhatsApp messages

### External APIs

**WhatsApp Webhooks:**
- **Verification**: GET /whatsapp/webhook with hub.verify_token
- **Message Handling**: POST /whatsapp/webhook for incoming messages
- **Retry Logic**: 3 attempts with exponential backoff

**n8n Webhooks:**
- **Trigger Points**: Maintenance creation, payment overdue, WhatsApp message received
- **Payload**: JSON with office_id, entity details, and context
- **Error Handling**: Silent failures with activity logging

### Development Tools

**Code Quality:**
- ESLint with Next.js and TypeScript configurations
- Prettier for code formatting (configured in Web/ and api/)
- Husky for pre-commit hooks (planned in Web/)

**Build & Deployment:**
- Vercel for frontend deployment (configured in Web/)
- GitHub Actions for CI/CD (mentioned in changelog)
- Docker support (implied by multi-environment setup)

**Type Safety:**
- TypeScript 5.3+ with strict mode
- Path aliases (@/ for imports)
- Shared types between frontend and backend (via DTOs)