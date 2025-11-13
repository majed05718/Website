# Detailed Design Document (DDD)
## Real Estate Management System - نظام إدارة العقارات

**Version:** 1.0  
**Date:** November 8, 2025  
**Status:** Final  
**Architecture:** Monorepo, Client-Server, Three-Tier

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Security Design](#7-security-design)
8. [Performance Considerations](#8-performance-considerations)

---

## 1. Introduction

### 1.1 Purpose

This Detailed Design Document (DDD) provides comprehensive technical specifications for the Real Estate Management System. It serves as the blueprint for developers, architects, and technical stakeholders to understand the system's internal structure, component interactions, and design decisions.

### 1.2 Scope

This document covers:
- High-level and detailed system architecture
- Component design and interactions
- Database schema and relationships
- API endpoints and data flow
- Frontend architecture and state management
- Security mechanisms
- Performance optimization strategies

### 1.3 Design Principles

The system adheres to the following principles:
- **Separation of Concerns:** Clear boundaries between frontend, backend, and database
- **Modularity:** Independent, reusable modules with single responsibilities
- **Scalability:** Designed to handle growth in users and data
- **Security First:** Defense in depth with multiple security layers
- **Performance:** Optimized for fast response times and efficient resource usage
- **Maintainability:** Clean code, documentation, and established patterns

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend Layer - Next.js 14"
        NextJS[Next.js Application]
        UI[UI Components<br/>Shadcn/UI]
        State[State Management<br/>Zustand]
        API_Client[API Client<br/>Axios]
    end

    subgraph "Backend Layer - NestJS"
        Gateway[API Gateway]
        Auth[Auth Module]
        Properties[Properties Module]
        Customers[Customers Module]
        Contracts[Contracts Module]
        Payments[Payments Module]
        Excel[Excel Module]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Supabase)]
        Storage[File Storage<br/>Supabase Storage]
        Redis[(Redis Cache)<br/>Optional]
    end

    subgraph "External Services"
        WhatsApp[WhatsApp API]
        Email[Email Service]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> UI
    NextJS --> State
    NextJS --> API_Client
    API_Client --> Gateway
    Gateway --> Auth
    Gateway --> Properties
    Gateway --> Customers
    Gateway --> Contracts
    Gateway --> Payments
    Gateway --> Excel
    
    Auth --> PostgreSQL
    Properties --> PostgreSQL
    Customers --> PostgreSQL
    Contracts --> PostgreSQL
    Payments --> PostgreSQL
    Excel --> PostgreSQL
    
    Properties --> Storage
    Excel --> Storage
    
    Customers --> WhatsApp
    Payments --> Email
    
    Properties -.Cache.-> Redis
    Customers -.Cache.-> Redis

    classDef frontend fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef backend fill:#2196F3,stroke:#1565C0,color:#fff
    classDef data fill:#FF9800,stroke:#E65100,color:#fff
    classDef external fill:#9C27B0,stroke:#6A1B9A,color:#fff
    
    class NextJS,UI,State,API_Client frontend
    class Gateway,Auth,Properties,Customers,Contracts,Payments,Excel backend
    class PostgreSQL,Storage,Redis data
    class WhatsApp,Email external
```

### 2.2 Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer<br/>Nginx/Caddy]
        
        subgraph "Web Tier (Port 5000)"
            Web1[Next.js Instance 1]
            Web2[Next.js Instance 2]
        end
        
        subgraph "API Tier (Port 3001)"
            API1[NestJS Instance 1]
            API2[NestJS Instance 2]
        end
        
        PM2[PM2 Process Manager]
        
        subgraph "Data Tier"
            DB[(PostgreSQL<br/>Primary)]
            DB_Replica[(PostgreSQL<br/>Read Replica)]
            Storage[Supabase Storage]
        end
    end

    Users[Users] --> LB
    LB --> Web1
    LB --> Web2
    Web1 --> API1
    Web2 --> API2
    Web1 --> API2
    Web2 --> API1
    
    PM2 -.Manages.-> Web1
    PM2 -.Manages.-> Web2
    PM2 -.Manages.-> API1
    PM2 -.Manages.-> API2
    
    API1 --> DB
    API2 --> DB
    API1 -.Reads.-> DB_Replica
    API2 -.Reads.-> DB_Replica
    API1 --> Storage
    API2 --> Storage

    classDef tier1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef tier2 fill:#2196F3,stroke:#1565C0,color:#fff
    classDef tier3 fill:#FF9800,stroke:#E65100,color:#fff
    
    class Web1,Web2 tier1
    class API1,API2 tier2
    class DB,DB_Replica,Storage tier3
```

---

## 3. Component Design

### 3.1 Backend Module Structure

```mermaid
graph LR
    subgraph "NestJS Application"
        Main[main.ts<br/>Bootstrap]
        
        subgraph "Core Modules"
            AppModule[App Module]
            ConfigModule[Config Module]
            DatabaseModule[Database Module]
        end
        
        subgraph "Feature Modules"
            AuthModule[Auth Module]
            PropertiesModule[Properties Module]
            CustomersModule[Customers Module]
            ContractsModule[Contracts Module]
            PaymentsModule[Payments Module]
            ExcelModule[Excel Module]
        end
        
        subgraph "Common"
            Guards[Guards<br/>JWT/Roles]
            Interceptors[Interceptors<br/>Logging/Transform]
            Pipes[Pipes<br/>Validation]
            Filters[Filters<br/>Exception]
        end
    end

    Main --> AppModule
    AppModule --> ConfigModule
    AppModule --> DatabaseModule
    AppModule --> AuthModule
    AppModule --> PropertiesModule
    AppModule --> CustomersModule
    AppModule --> ContractsModule
    AppModule --> PaymentsModule
    AppModule --> ExcelModule
    
    AuthModule -.Uses.-> Guards
    PropertiesModule -.Uses.-> Guards
    CustomersModule -.Uses.-> Guards
    
    AppModule -.Global.-> Interceptors
    AppModule -.Global.-> Pipes
    AppModule -.Global.-> Filters

    classDef core fill:#2196F3,stroke:#1565C0,color:#fff
    classDef feature fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef common fill:#FF9800,stroke:#E65100,color:#fff
    
    class AppModule,ConfigModule,DatabaseModule core
    class AuthModule,PropertiesModule,CustomersModule,ContractsModule,PaymentsModule,ExcelModule feature
    class Guards,Interceptors,Pipes,Filters common
```

### 3.2 Properties Module - Detailed Design

#### 3.2.1 Class Diagram

```mermaid
classDiagram
    class PropertiesController {
        +findAll(filters: FilterDto)
        +findOne(id: string)
        +create(dto: CreatePropertyDto)
        +update(id: string, dto: UpdatePropertyDto)
        +delete(id: string)
        +uploadImages(files: Array)
    }

    class PropertiesService {
        -propertyRepo: Repository
        -storageService: StorageService
        +findAll(officeId, filters)
        +findOne(id, officeId)
        +create(data, officeId, userId)
        +update(id, data, officeId)
        +softDelete(id, officeId)
        +validateProperty(data)
        +generatePropertyCode()
    }

    class Property {
        +id: string
        +property_code: string
        +title: string
        +description: string
        +property_type: enum
        +listing_type: enum
        +status: enum
        +price: number
        +currency: string
        +area: number
        +bedrooms: number
        +bathrooms: number
        +city: string
        +district: string
        +address: string
        +images: string[]
        +office_id: string
        +created_by: string
        +created_at: Date
        +updated_at: Date
        +deleted_at: Date
    }

    class CreatePropertyDto {
        +title: string
        +description: string
        +property_type: string
        +listing_type: string
        +price: number
        +area: number
        +bedrooms: number
        +bathrooms: number
        +city: string
        +district: string
        +address: string
    }

    class FilterPropertiesDto {
        +property_type?: string
        +listing_type?: string
        +status?: string
        +city?: string
        +min_price?: number
        +max_price?: number
        +search?: string
        +page?: number
        +limit?: number
    }

    class StorageService {
        +uploadFile(file, path)
        +deleteFile(path)
        +getPublicUrl(path)
    }

    PropertiesController --> PropertiesService
    PropertiesService --> Property
    PropertiesService --> StorageService
    PropertiesController ..> CreatePropertyDto
    PropertiesController ..> FilterPropertiesDto
```

#### 3.2.2 Sequence Diagram - Property Listing

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant API as API Gateway
    participant Guard as JWT Guard
    participant Controller as Properties Controller
    participant Service as Properties Service
    participant Cache as Redis Cache
    participant DB as PostgreSQL

    User->>Frontend: Request properties list
    Frontend->>API: GET /properties?page=1&limit=20
    Note over API: Headers: Authorization: Bearer {token}
    
    API->>Guard: Verify JWT token
    Guard->>Guard: Decode & validate
    alt Token invalid
        Guard-->>API: 401 Unauthorized
        API-->>Frontend: Error response
        Frontend-->>User: Show login page
    else Token valid
        Guard-->>API: User context (office_id, role)
        API->>Controller: findAll(filters, user)
        Controller->>Service: findAll(office_id, filters)
        
        Service->>Cache: Check cache key: properties:office:page
        alt Cache hit
            Cache-->>Service: Cached data
        else Cache miss
            Service->>DB: SELECT * FROM properties WHERE office_id=? AND deleted_at IS NULL
            Note over DB: Uses index: idx_properties_office_id_status
            DB-->>Service: Query results
            Service->>Cache: Store in cache (5 min TTL)
        end
        
        Service->>Service: Transform data
        Service-->>Controller: PaginatedResponse
        Controller-->>API: JSON response
        API-->>Frontend: Properties data
        Frontend->>Frontend: Render PropertyCard components
        Frontend-->>User: Display properties
    end
```

### 3.3 Customers Module - Detailed Design

#### 3.3.1 Class Diagram

```mermaid
classDiagram
    class CustomersController {
        +findAll(filters: FilterDto)
        +findOne(id: string)
        +create(dto: CreateCustomerDto)
        +update(id: string, dto: UpdateDto)
        +delete(id: string)
        +exportExcel(filters: FilterDto)
        +addNote(id: string, note: CreateNoteDto)
        +addInteraction(id: string, interaction: CreateInteractionDto)
    }

    class CustomersService {
        -customerRepo: Repository
        -notesRepo: Repository
        -interactionsRepo: Repository
        -excelService: ExcelService
        +findAll(officeId, filters)
        +findOne(id, officeId)
        +create(data, officeId, userId)
        +update(id, data, officeId)
        +exportToExcel(customers)
        +getStats(officeId)
        +addNote(customerId, note)
        +getCustomerHistory(customerId)
    }

    class Customer {
        +id: string
        +name: string
        +phone: string
        +email: string
        +national_id: string
        +type: enum
        +status: enum
        +address: string
        +city: string
        +preferred_contact_method: enum
        +source: string
        +rating: number
        +assigned_staff_id: string
        +office_id: string
        +last_contact_date: Date
        +created_at: Date
    }

    class CustomerNote {
        +id: string
        +customer_id: string
        +content: string
        +is_important: boolean
        +created_by: string
        +created_at: Date
    }

    class CustomerInteraction {
        +id: string
        +customer_id: string
        +interaction_type: enum
        +date: Date
        +description: string
        +next_follow_up: Date
        +staff_id: string
    }

    class ExcelService {
        +generateExcel(data, columns)
        +parseExcel(file)
        +validateData(data)
    }

    CustomersController --> CustomersService
    CustomersService --> Customer
    CustomersService --> CustomerNote
    CustomersService --> CustomerInteraction
    CustomersService --> ExcelService
    Customer "1" -- "0..*" CustomerNote
    Customer "1" -- "0..*" CustomerInteraction
```

#### 3.3.2 Sequence Diagram - Customer Export to Excel

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js
    participant Controller as Customers Controller
    participant Service as Customers Service
    participant ExcelService as Excel Service
    participant DB as PostgreSQL

    User->>Frontend: Click "Export to Excel"
    Frontend->>Frontend: Show loading state
    Frontend->>Controller: GET /customers/export?filters=...
    
    Controller->>Service: exportExcel(officeId, filters)
    Service->>DB: SELECT * FROM customers WHERE office_id=? AND ...
    Note over DB: Applies filters
    DB-->>Service: Customer records (up to 10,000)
    
    Service->>Service: Validate & transform data
    Service->>ExcelService: generateExcel(customers, columns)
    
    ExcelService->>ExcelService: Create workbook
    ExcelService->>ExcelService: Add headers & styles
    ExcelService->>ExcelService: Add data rows
    ExcelService->>ExcelService: Format cells
    ExcelService->>ExcelService: Add metadata sheet
    ExcelService-->>Service: Excel buffer
    
    Service-->>Controller: File buffer
    Controller-->>Frontend: File response (Content-Type: xlsx)
    Note over Frontend: Headers: Content-Disposition: attachment
    
    Frontend->>Frontend: Trigger download
    Frontend-->>User: File downloaded: customers_export_2025-11-08.xlsx
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    OFFICES ||--o{ USERS : has
    OFFICES ||--o{ PROPERTIES : manages
    OFFICES ||--o{ CUSTOMERS : manages
    OFFICES ||--o{ CONTRACTS : manages
    
    USERS ||--o{ PROPERTIES : creates
    USERS ||--o{ CUSTOMERS : manages
    USERS ||--o{ CUSTOMER_NOTES : writes
    USERS ||--o{ APPOINTMENTS : schedules
    
    PROPERTIES ||--o{ APPOINTMENTS : "has viewings"
    PROPERTIES ||--o{ CONTRACTS : "subject of"
    PROPERTIES ||--o{ CUSTOMER_PROPERTIES : "linked to"
    PROPERTIES ||--o{ MAINTENANCE_REQUESTS : "requires"
    
    CUSTOMERS ||--o{ APPOINTMENTS : "books"
    CUSTOMERS ||--o{ CUSTOMER_NOTES : has
    CUSTOMERS ||--o{ CUSTOMER_INTERACTIONS : has
    CUSTOMERS ||--o{ CUSTOMER_PROPERTIES : "interested in"
    CUSTOMERS ||--o{ CONTRACTS : signs
    
    CONTRACTS ||--o{ PAYMENTS : "generates"
    CONTRACTS ||--o{ CONTRACT_DOCUMENTS : has
    
    OFFICES {
        uuid id PK
        string name
        string city
        boolean is_active
        timestamp created_at
    }
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role
        uuid office_id FK
        boolean is_active
        timestamp created_at
    }
    
    PROPERTIES {
        uuid id PK
        string property_code UK
        string title
        enum property_type
        enum listing_type
        enum status
        decimal price
        decimal area
        integer bedrooms
        integer bathrooms
        string city
        string district
        jsonb images
        uuid office_id FK
        uuid created_by FK
        timestamp created_at
        timestamp deleted_at
    }
    
    CUSTOMERS {
        uuid id PK
        string name
        string phone UK
        string email
        string national_id UK
        enum type
        enum status
        string city
        integer rating
        uuid assigned_staff_id FK
        uuid office_id FK
        date last_contact_date
        timestamp created_at
    }
    
    CUSTOMER_NOTES {
        uuid id PK
        uuid customer_id FK
        text content
        boolean is_important
        uuid created_by FK
        timestamp created_at
    }
    
    CUSTOMER_INTERACTIONS {
        uuid id PK
        uuid customer_id FK
        enum interaction_type
        date date
        text description
        date next_follow_up
        uuid staff_id FK
        timestamp created_at
    }
    
    CUSTOMER_PROPERTIES {
        uuid customer_id FK
        uuid property_id FK
        enum relationship
        timestamp created_at
    }
    
    APPOINTMENTS {
        uuid id PK
        uuid property_id FK
        uuid customer_id FK
        uuid assigned_staff_id FK
        date date
        time start_time
        time end_time
        enum status
        text notes
        uuid office_id FK
        timestamp created_at
    }
    
    CONTRACTS {
        uuid id PK
        string contract_number UK
        uuid property_id FK
        uuid customer_id FK
        enum contract_type
        enum status
        decimal monthly_rent
        date start_date
        date end_date
        decimal security_deposit
        uuid office_id FK
        timestamp created_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid contract_id FK
        decimal amount
        date due_date
        date paid_date
        enum status
        enum payment_method
        text notes
        uuid office_id FK
        timestamp created_at
    }
    
    MAINTENANCE_REQUESTS {
        uuid id PK
        uuid property_id FK
        string title
        text description
        enum priority
        enum status
        uuid assigned_to FK
        date scheduled_date
        uuid office_id FK
        timestamp created_at
    }
    
    CONTRACT_DOCUMENTS {
        uuid id PK
        uuid contract_id FK
        string document_type
        string file_url
        timestamp uploaded_at
    }
```

### 4.2 Database Indexes (Performance Critical)

**High Priority Indexes:**

```sql
-- Properties - Most queried table
CREATE INDEX idx_properties_office_status ON properties(office_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_city_type ON properties(city, property_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_price ON properties(price) WHERE deleted_at IS NULL AND status = 'available';

-- Customers - High volume reads
CREATE INDEX idx_customers_office_status ON customers(office_id, status);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE status = 'active';
CREATE INDEX idx_customers_last_contact ON customers(last_contact_date DESC NULLS LAST);

-- Appointments - Time-sensitive queries
CREATE INDEX idx_appointments_date_staff ON appointments(date, assigned_staff_id) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX idx_appointments_upcoming ON appointments(date, start_time) WHERE status IN ('scheduled', 'confirmed') AND date >= CURRENT_DATE;

-- Payments - Financial operations
CREATE INDEX idx_payments_contract_status ON payments(contract_id, status);
CREATE INDEX idx_payments_overdue ON payments(status, due_date) WHERE status = 'overdue';
CREATE INDEX idx_payments_due_date ON payments(due_date) WHERE status IN ('pending', 'due');
```

### 4.3 Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policies - Users only see data from their office
CREATE POLICY "Users view own office properties"
ON properties FOR SELECT
USING (office_id = (auth.jwt() ->> 'office_id')::uuid);

CREATE POLICY "Users view own office customers"
ON customers FOR SELECT
USING (office_id = (auth.jwt() ->> 'office_id')::uuid);

-- Managers can insert/update
CREATE POLICY "Managers can modify properties"
ON properties FOR ALL
USING (
  office_id = (auth.jwt() ->> 'office_id')::uuid
  AND (auth.jwt() ->> 'role') IN ('manager', 'admin')
);
```

---

## 5. API Design

### 5.1 API Structure

**Base URL:** `http://localhost:3001/api/v1`

**Authentication:** Bearer Token (JWT)

**Response Format:**
```json
{
  "data": {...},
  "message": "Success message",
  "statusCode": 200,
  "timestamp": "2025-11-08T10:30:00Z"
}
```

**Error Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 5.2 Properties API Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/properties` | List all properties | Yes | All |
| GET | `/properties/:id` | Get property details | Yes | All |
| POST | `/properties` | Create new property | Yes | Manager, Staff |
| PATCH | `/properties/:id` | Update property | Yes | Manager, Staff |
| DELETE | `/properties/:id` | Delete property (soft) | Yes | Manager |
| POST | `/properties/:id/images` | Upload images | Yes | Manager, Staff |
| GET | `/properties/stats` | Get statistics | Yes | All |

**Example Request:**
```http
GET /api/v1/properties?page=1&limit=20&city=Riyadh&property_type=apartment&status=available
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "property_code": "PROP-2025-001",
        "title": "Modern Apartment in Riyadh",
        "property_type": "apartment",
        "listing_type": "rent",
        "status": "available",
        "price": 3500,
        "currency": "SAR",
        "area": 120,
        "bedrooms": 2,
        "bathrooms": 2,
        "city": "Riyadh",
        "district": "Al Olaya",
        "images": [
          "https://storage.supabase.co/properties/image1.jpg"
        ],
        "created_at": "2025-11-01T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "statusCode": 200
}
```

### 5.3 Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthController
    participant AuthService
    participant DB
    participant JWTService

    User->>Frontend: Enter email & password
    Frontend->>AuthController: POST /auth/login
    
    AuthController->>AuthService: login(email, password)
    AuthService->>DB: SELECT user WHERE email=?
    DB-->>AuthService: User record (with password_hash)
    
    AuthService->>AuthService: bcrypt.compare(password, hash)
    
    alt Password valid
        AuthService->>JWTService: Generate access token (15m)
        JWTService-->>AuthService: Access token
        AuthService->>JWTService: Generate refresh token (7d)
        JWTService-->>AuthService: Refresh token
        
        AuthService->>AuthService: Hash refresh token
        AuthService->>DB: UPDATE user SET refresh_token=?
        
        AuthService-->>AuthController: {user, accessToken, refreshToken}
        AuthController-->>Frontend: 200 OK + tokens
        Frontend->>Frontend: Store tokens in state
        Frontend-->>User: Redirect to dashboard
    else Password invalid
        AuthService-->>AuthController: UnauthorizedException
        AuthController-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end
```

---

## 6. Frontend Architecture

### 6.1 Next.js Application Structure

```
Web/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── login/
│   │   │   └── page.tsx       # Login page
│   │   └── dashboard/
│   │       ├── layout.tsx     # Dashboard layout
│   │       ├── page.tsx       # Dashboard home
│   │       ├── properties/
│   │       │   ├── page.tsx   # Properties list
│   │       │   ├── [id]/page.tsx  # Property details
│   │       │   └── import/page.tsx # Import wizard
│   │       ├── customers/
│   │       │   ├── page.tsx
│   │       │   └── export/page.tsx
│   │       ├── contracts/
│   │       ├── payments/
│   │       └── finance/
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── table.tsx
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   └── PropertyFilters.tsx
│   │   ├── customers/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                  # Utilities & configs
│   │   ├── api/
│   │   │   ├── client.ts     # Axios instance
│   │   │   ├── properties.ts # Properties API
│   │   │   ├── customers.ts  # Customers API
│   │   │   └── auth.ts       # Auth API
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   └── constants.ts
│   │
│   ├── store/                # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── properties-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/                # TypeScript types
│       ├── property.ts
│       ├── customer.ts
│       └── api.ts
```

### 6.2 State Management (Zustand)

```typescript
// auth-store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: () => boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

// Usage in components
function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    redirect('/login');
  }
  
  return <div>Welcome {user.name}</div>;
}
```

### 6.3 Component Hierarchy - Property Listing

```mermaid
graph TD
    Page[properties/page.tsx]
    Page --> Header[Layout Header]
    Page --> Filters[PropertyFilters]
    Page --> Grid[Property Grid]
    Page --> Pagination[Pagination]
    
    Grid --> Card1[PropertyCard]
    Grid --> Card2[PropertyCard]
    Grid --> CardN[PropertyCard ...]
    
    Card1 --> Image[Next/Image]
    Card1 --> Title[Property Title]
    Card1 --> Details[Property Details]
    Card1 --> Actions[Action Buttons]
    
    Actions --> ViewBtn[View Button]
    Actions --> EditBtn[Edit Button]
    Actions --> DeleteBtn[Delete Button]
    
    DeleteBtn --> Dialog[Confirmation Dialog]

    classDef page fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef component fill:#2196F3,stroke:#1565C0,color:#fff
    classDef ui fill:#FF9800,stroke:#E65100,color:#fff
    
    class Page page
    class Filters,Grid,Card1,Card2,CardN component
    class Image,Title,Details,Actions,ViewBtn,EditBtn,DeleteBtn,Dialog ui
```

---

## 7. Security Design

### 7.1 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "manager",
  "office_id": "office-uuid",
  "iat": 1699454400,
  "exp": 1699455300
}
```

**Authorization Levels:**
1. **Admin:** Full system access
2. **Manager:** Office-wide management
3. **Staff:** Limited to assigned tasks
4. **Viewer:** Read-only access

**Guard Implementation:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager', 'admin')
@Delete('properties/:id')
async deleteProperty(@Param('id') id: string) {
  return this.propertiesService.softDelete(id);
}
```

### 7.2 Security Layers

```mermaid
graph TB
    Request[HTTP Request]
    
    Request --> HTTPS[HTTPS/TLS Layer]
    HTTPS --> CORS[CORS Validation]
    CORS --> RateLimit[Rate Limiting]
    RateLimit --> JWT[JWT Verification]
    JWT --> RLS[Row Level Security]
    RLS --> Validation[Input Validation]
    Validation --> Sanitization[Data Sanitization]
    Sanitization --> Business[Business Logic]
    Business --> DB[(Database)]

    classDef security fill:#f44336,stroke:#c62828,color:#fff
    classDef data fill:#FF9800,stroke:#E65100,color:#fff
    
    class HTTPS,CORS,RateLimit,JWT,RLS,Validation,Sanitization security
    class DB data
```

### 7.3 Data Validation Pipeline

**Backend Validation:**
```typescript
// 1. DTO with decorators
export class CreatePropertyDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsNumber()
  @Min(0)
  @Max(999999999)
  price: number;
}

// 2. Global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown
    transform: true,           // Auto-transform types
  }),
);
```

**Frontend Validation:**
```typescript
// React Hook Form + Zod
const schema = z.object({
  title: z.string().min(5).max(200),
  price: z.number().min(0).max(999999999),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

---

## 8. Performance Considerations

### 8.1 Database Query Optimization

**Inefficient Query (N+1 Problem):**
```typescript
// BAD - Causes N+1 queries
async getPropertiesWithOwner() {
  const properties = await this.propertyRepo.find();
  for (const property of properties) {
    property.owner = await this.userRepo.findOne(property.created_by);
  }
  return properties;
}
```

**Optimized Query:**
```typescript
// GOOD - Single query with join
async getPropertiesWithOwner() {
  return this.propertyRepo
    .createQueryBuilder('property')
    .leftJoinAndSelect('property.creator', 'user')
    .where('property.deleted_at IS NULL')
    .getMany();
}
```

### 8.2 Caching Strategy

```mermaid
graph LR
    Request[API Request]
    Cache{Cache Hit?}
    DB[(Database)]
    Response[Response]

    Request --> Cache
    Cache -->|Yes| Response
    Cache -->|No| DB
    DB --> UpdateCache[Update Cache]
    UpdateCache --> Response

    style Cache fill:#4CAF50,stroke:#2E7D32,color:#fff
    style DB fill:#FF9800,stroke:#E65100,color:#fff
```

**Cache Implementation:**
```typescript
async findAll(filters) {
  const cacheKey = `properties:${JSON.stringify(filters)}`;
  
  // Try cache first
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached;
  
  // Query database
  const data = await this.propertyRepo.find(filters);
  
  // Store in cache (5 minutes TTL)
  await this.cacheService.set(cacheKey, data, 300);
  
  return data;
}
```

### 8.3 Frontend Performance Optimizations

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
const FinanceChart = dynamic(
  () => import('@/components/finance/FinanceChart'),
  {
    loading: () => <Skeleton />,
    ssr: false,
  }
);
```

**Image Optimization:**
```typescript
// Use Next.js Image component
<Image
  src={property.image}
  alt={property.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**API Call Optimization:**
```typescript
// React Query for caching & deduplication
const { data } = useQuery({
  queryKey: ['properties', filters],
  queryFn: () => propertiesApi.getProperties(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

```typescript
// Structured logging
logger.log({
  level: 'info',
  message: 'Property created',
  context: 'PropertiesService',
  userId: user.id,
  officeId: user.office_id,
  propertyId: property.id,
  timestamp: new Date().toISOString(),
});
```

### 9.2 Performance Metrics

**Key Metrics to Track:**
- API response time (P50, P95, P99)
- Database query time
- Frontend page load time
- Error rate
- Active users
- Memory usage
- CPU usage

---

## Appendix: Technology Stack

**Backend:**
- NestJS 10.x
- TypeORM 0.3.x
- PostgreSQL 14+
- JWT (Passport)
- Class Validator
- Multer, Sharp, XLSX

**Frontend:**
- Next.js 14.x
- React 18.x
- TypeScript 5.x
- Zustand 4.x
- React Hook Form
- Zod
- Axios
- Recharts
- Shadcn/UI
- Tailwind CSS

**Infrastructure:**
- PM2 (Process Manager)
- Supabase (Database + Storage)
- Node.js 18+

---

**Document Status:** ✅ FINAL  
**Last Updated:** November 8, 2025  
**Version:** 1.0

---

**End of Detailed Design Document**
