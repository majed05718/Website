# Software Requirements Specification (SRS)

## Property Management System (إداره العقارات)

**Version:** 1.0  
**Date:** November 8, 2025  
**Prepared By:** Senior Software Analyst Team

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - 1.4 [Overview](#14-overview)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [User Classes and Characteristics](#22-user-classes-and-characteristics)
   - 2.3 [Operating Environment](#23-operating-environment)
   - 2.4 [Design and Implementation Constraints](#24-design-and-implementation-constraints)
3. [System Features](#3-system-features)
   - 3.1 [User Authentication and Authorization](#31-user-authentication-and-authorization)
   - 3.2 [Property Management](#32-property-management)
   - 3.3 [Customer Relationship Management (CRM)](#33-customer-relationship-management-crm)
   - 3.4 [Appointments Management](#34-appointments-management)
   - 3.5 [Contracts Management](#35-contracts-management)
   - 3.6 [Payments Management](#36-payments-management)
   - 3.7 [Maintenance Management](#37-maintenance-management)
   - 3.8 [Finance Reports and Analytics](#38-finance-reports-and-analytics)
   - 3.9 [Excel Import/Export System](#39-excel-importexport-system)
   - 3.10 [WhatsApp Integration](#310-whatsapp-integration)
   - 3.11 [Analytics Dashboard](#311-analytics-dashboard)
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 [User Interfaces](#41-user-interfaces)
   - 4.2 [Software Interfaces](#42-software-interfaces)
   - 4.3 [Communication Interfaces](#43-communication-interfaces)
5. [Non-functional Requirements](#5-non-functional-requirements)
   - 5.1 [Performance Requirements](#51-performance-requirements)
   - 5.2 [Security Requirements](#52-security-requirements)
   - 5.3 [Reliability Requirements](#53-reliability-requirements)
   - 5.4 [Maintainability Requirements](#54-maintainability-requirements)
   - 5.5 [Usability Requirements](#55-usability-requirements)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the **Property Management System** (إداره العقارات). The purpose of this document is to:

- Define all functional and non-functional requirements for the system
- Serve as a reference for developers, testers, and stakeholders
- Establish a clear understanding of system capabilities and limitations
- Provide a baseline for project planning and validation

The intended audience includes:
- Development team members
- Quality assurance engineers
- Project managers
- System administrators
- Business stakeholders
- End users

### 1.2 Scope

The Property Management System is a comprehensive web-based platform designed to streamline and automate the operations of real estate offices. The system encompasses the following major capabilities:

**Core Functionalities:**
- Complete property lifecycle management (listing, tracking, sales/rental)
- Customer relationship management with interaction tracking
- Appointment scheduling with conflict detection
- Contract management with payment tracking
- Financial reporting and analytics
- Maintenance request management
- Excel/CSV import and export capabilities
- WhatsApp integration for customer communication

**Benefits:**
- Reduced manual paperwork and data entry
- Improved customer service and response time
- Enhanced visibility into business operations
- Automated reminders and notifications
- Data-driven decision making through analytics
- Streamlined workflows for staff productivity

**Out of Scope:**
- Mobile native applications (iOS/Android)
- Third-party accounting software integration (except basic export)
- Property valuation algorithms
- Mortgage calculator
- Legal document generation

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - Interface for communication between software components |
| **CRM** | Customer Relationship Management - System for managing customer interactions |
| **CSV** | Comma-Separated Values - File format for data exchange |
| **DTO** | Data Transfer Object - Object that carries data between processes |
| **JWT** | JSON Web Token - Standard for secure authentication |
| **KPI** | Key Performance Indicator - Measurable value demonstrating effectiveness |
| **NestJS** | Progressive Node.js framework for building server-side applications |
| **Next.js** | React framework for production-grade web applications |
| **ORM** | Object-Relational Mapping - Technique for converting data between systems |
| **REST** | Representational State Transfer - Architectural style for web services |
| **RLS** | Row Level Security - Database security feature |
| **RTL** | Right-to-Left - Text direction for Arabic language |
| **SRS** | Software Requirements Specification |
| **TypeORM** | ORM library for TypeScript and JavaScript |
| **UI/UX** | User Interface/User Experience |
| **UUID** | Universally Unique Identifier |

### 1.4 Overview

This SRS document is organized into five main sections:

1. **Introduction** - Provides context and overview of the document
2. **Overall Description** - Describes the system from a high-level perspective
3. **System Features** - Details specific functional requirements for each feature
4. **External Interface Requirements** - Defines interface specifications
5. **Non-functional Requirements** - Specifies quality attributes and constraints

---

## 2. Overall Description

### 2.1 Product Perspective

The Property Management System is a standalone, self-contained web application designed to operate independently while providing integration capabilities with external services. The system architecture consists of:

**Frontend Layer (Next.js):**
- Modern, responsive web interface
- Progressive Web Application (PWA) capabilities
- Client-side state management using Zustand
- Real-time updates and notifications
- Supports Arabic (RTL) and English languages

**Backend Layer (NestJS):**
- RESTful API architecture
- JWT-based authentication
- Role-based access control (RBAC)
- Comprehensive validation and error handling
- API documentation via Swagger

**Database Layer (PostgreSQL via Supabase):**
- Relational database with ACID compliance
- Row-Level Security (RLS) for multi-tenancy
- Indexed queries for optimal performance
- Automatic backups and point-in-time recovery

**External Integrations:**
- Supabase for database and storage
- WhatsApp Business API for messaging
- Excel/CSV file processing
- PDF generation for reports and invoices

### 2.2 User Classes and Characteristics

The system supports multiple user roles with varying levels of access and privileges:

#### 2.2.1 Manager (مدير)
- **Characteristics:** Office owner or senior manager with full system access
- **Technical Expertise:** Moderate - familiar with business software
- **Frequency of Use:** Daily, throughout business hours
- **Privileges:**
  - Full CRUD operations on all entities
  - Access to financial reports and analytics
  - User and staff management
  - System configuration and settings
  - Delete permissions

#### 2.2.2 Staff (موظف)
- **Characteristics:** Real estate agents and administrative staff
- **Technical Expertise:** Basic to moderate
- **Frequency of Use:** Daily, throughout business hours
- **Privileges:**
  - Property listing and management
  - Customer interaction and tracking
  - Appointment scheduling
  - Contract viewing and editing (limited)
  - Report viewing
  - Cannot delete critical records

#### 2.2.3 Accountant (محاسب)
- **Characteristics:** Financial staff responsible for payments and accounting
- **Technical Expertise:** Moderate
- **Frequency of Use:** Daily for financial tasks
- **Privileges:**
  - Payment recording and tracking
  - Financial report generation
  - Invoice creation
  - Cannot modify properties or contracts

#### 2.2.4 Technician (فني صيانة)
- **Characteristics:** Maintenance staff responding to service requests
- **Technical Expertise:** Basic
- **Frequency of Use:** As needed for maintenance tasks
- **Privileges:**
  - View and update maintenance requests
  - Mark requests as completed
  - Upload completion photos and reports
  - Limited access to property details

#### 2.2.5 Customer (عميل) - External User
- **Characteristics:** Property buyers, sellers, renters, or landlords
- **Technical Expertise:** Varies (basic to moderate)
- **Frequency of Use:** Occasional, as needed
- **Access:**
  - Submit maintenance requests (for tenants)
  - View contract information (limited)
  - Receive notifications and reminders
  - Access through public portals

### 2.3 Operating Environment

#### 2.3.1 Hardware Requirements

**Server Environment:**
- **CPU:** Multi-core processor (minimum 2 cores, recommended 4+ cores)
- **RAM:** Minimum 4GB, recommended 8GB+
- **Storage:** Minimum 20GB SSD, recommended 50GB+ for file storage
- **Network:** Broadband internet connection (minimum 10 Mbps upload/download)

**Client Environment:**
- **Devices:** Desktop computers, laptops, tablets, smartphones
- **Screen Resolution:** Minimum 320px width (mobile) to 1920px+ (desktop)
- **Input:** Keyboard, mouse/trackpad, touchscreen

#### 2.3.2 Software Requirements

**Server-Side:**
- **Operating System:** Linux (Ubuntu 20.04+ recommended), Windows Server, or macOS
- **Runtime:** Node.js v18.x or higher
- **Database:** PostgreSQL 14+ (managed by Supabase)
- **Process Manager:** PM2 or similar for production

**Client-Side:**
- **Web Browsers:**
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
  - Safari 14+
  - Mobile browsers (Chrome, Safari)
- **JavaScript:** Enabled (required)
- **Cookies:** Enabled for authentication

**Development Environment:**
- **Node.js:** v18.x or higher
- **Package Manager:** npm or yarn
- **IDE:** Visual Studio Code, WebStorm, or similar
- **Git:** For version control

### 2.4 Design and Implementation Constraints

#### 2.4.1 Technical Constraints

1. **Technology Stack:**
   - Must use TypeScript for type safety
   - Frontend must be built with Next.js 14
   - Backend must use NestJS framework
   - Database must be PostgreSQL

2. **Performance:**
   - API response time must not exceed 2 seconds for 95% of requests
   - Frontend page load time should be under 3 seconds
   - System must handle at least 100 concurrent users

3. **Security:**
   - All API communications must use HTTPS
   - Passwords must be hashed using bcrypt or similar
   - JWT tokens must expire after configurable period
   - Must implement CORS protection
   - SQL injection prevention through ORM

4. **Data Storage:**
   - Files must be stored with access control
   - Maximum file upload size: 10MB per file
   - Supported image formats: JPEG, PNG, WebP
   - Supported document formats: PDF, Excel, CSV

#### 2.4.2 Business Rules

1. **Multi-tenancy:**
   - Each office operates in isolated environment
   - No cross-office data access
   - Office-specific branding and configuration

2. **Data Integrity:**
   - Unique phone numbers per office
   - Property codes must be unique within office
   - Cannot delete records with active dependencies
   - Soft delete for most entities (audit trail)

3. **Appointments:**
   - No overlapping appointments for same staff member
   - Minimum 30-minute duration
   - Must be within business hours (configurable)

4. **Payments:**
   - Payment amounts must match contract terms
   - Cannot mark overdue payments as future
   - Require approval for large transactions

#### 2.4.3 Regulatory Constraints

1. **Data Privacy:**
   - Compliance with local data protection laws
   - User consent for data processing
   - Right to data deletion (GDPR-like requirements)
   - Secure handling of personal information

2. **Financial:**
   - Accurate financial record keeping
   - Audit trail for all transactions
   - Tax calculation compliance (Saudi VAT 15%)

---

## 3. System Features

### 3.1 User Authentication and Authorization

#### 3.1.1 Description

The authentication and authorization system provides secure access control to the platform. It manages user identities, validates credentials, maintains sessions, and enforces role-based permissions throughout the application.

#### 3.1.2 Functional Requirements

**REQ-AUTH-001: User Login**
- **Priority:** Critical
- **Description:** Users must be able to log in using credentials
- **Inputs:** Email/username and password
- **Processing:**
  - Validate credentials against database
  - Generate JWT token with user information
  - Set token expiration time
  - Log login attempt
- **Outputs:** Authentication token, user profile data
- **Error Handling:** Invalid credentials return error message

**REQ-AUTH-002: Token-Based Authentication**
- **Priority:** Critical
- **Description:** All protected API requests must include valid JWT token
- **Processing:**
  - Validate token signature
  - Check token expiration
  - Extract user and office information
  - Verify user is not blocked
- **Error Handling:** Return 401 Unauthorized for invalid tokens

**REQ-AUTH-003: Role-Based Access Control**
- **Priority:** Critical
- **Description:** System must enforce role-based permissions
- **Roles:** Manager, Staff, Accountant, Technician
- **Processing:**
  - Check user role from JWT token
  - Verify role has permission for requested operation
  - Apply role-specific data filters
- **Error Handling:** Return 403 Forbidden for insufficient permissions

**REQ-AUTH-004: Session Management**
- **Priority:** High
- **Description:** System must manage active user sessions
- **Features:**
  - Token refresh mechanism
  - Automatic logout after inactivity
  - Multi-device session support
  - Manual logout functionality

**REQ-AUTH-005: Password Security**
- **Priority:** Critical
- **Description:** Passwords must be securely stored and managed
- **Requirements:**
  - Hash passwords using bcrypt (10+ rounds)
  - Minimum password length: 8 characters
  - Password reset via email
  - Password change functionality

#### 3.1.3 Use Cases

**Use Case: User Login**
```
Actor: Staff Member
Preconditions: User has valid credentials
Main Flow:
  1. User navigates to login page
  2. User enters email and password
  3. System validates credentials
  4. System generates JWT token
  5. System redirects to dashboard
  6. User is successfully logged in
Alternate Flow:
  3a. Invalid credentials
      - System displays error message
      - User can retry login
Postconditions: User is authenticated and can access protected resources
```

### 3.2 Property Management

#### 3.2.1 Description

The Property Management module enables real estate offices to manage their property inventory, including residential, commercial, and land properties. It provides comprehensive CRUD operations, advanced search and filtering, media management, and bulk operations through Excel import/export.

#### 3.2.2 Functional Requirements

**REQ-PROP-001: Property Listing**
- **Priority:** Critical
- **Description:** Display paginated list of properties with filters
- **Features:**
  - Grid and list view modes
  - Sortable columns
  - Quick search by title, code, or location
  - Advanced filters (type, status, price range, city)
  - Pagination with configurable page size
- **Performance:** Load within 2 seconds for up to 1000 properties

**REQ-PROP-002: Property Creation**
- **Priority:** Critical
- **Description:** Allow authorized users to add new properties
- **Required Fields:**
  - Property code (unique per office)
  - Title (Arabic and English)
  - Property type (apartment, villa, land, commercial, etc.)
  - Listing type (sale, rent)
  - Price and currency
  - Area (square meters)
  - Location (city, district, address)
  - Number of rooms, bathrooms
  - Status (available, rented, sold, under_maintenance)
- **Optional Fields:**
  - Description
  - Features (parking, pool, garden, etc.)
  - Year built
  - Owner information
  - Custom fields
- **Validation:**
  - All required fields must be provided
  - Price must be positive number
  - Area must be positive number
  - Property code must be unique
  - Phone numbers must follow format

**REQ-PROP-003: Property Update**
- **Priority:** High
- **Description:** Modify existing property information
- **Processing:**
  - Validate ownership (same office)
  - Apply role-based permissions
  - Track changes in audit log
  - Update modification timestamp
- **Restrictions:** Cannot change property code after creation

**REQ-PROP-004: Property Deletion**
- **Priority:** Medium
- **Description:** Soft delete properties from system
- **Access:** Manager role only
- **Processing:**
  - Check for active contracts
  - Check for scheduled appointments
  - Perform soft delete (mark as deleted)
  - Preserve data for audit trail
- **Error Handling:** Prevent deletion if active dependencies exist

**REQ-PROP-005: Property Media Management**
- **Priority:** High
- **Description:** Manage property images and documents
- **Features:**
  - Upload multiple images (up to 20 per property)
  - Set primary/featured image
  - Drag-and-drop reordering
  - Image optimization and compression
  - Caption and alt text for images
  - Upload PDF documents (floor plans, contracts)
- **File Requirements:**
  - Image formats: JPEG, PNG, WebP
  - Maximum size: 10MB per file
  - Automatic resizing to standard dimensions
  - Generate thumbnails

**REQ-PROP-006: Property Details View**
- **Priority:** High
- **Description:** Display comprehensive property information
- **Sections:**
  - Property overview
  - Image gallery with lightbox
  - Location map integration
  - Features and amenities
  - Financial information
  - Related contracts
  - Viewing history
  - Customer interest tracking

**REQ-PROP-007: Property Search and Filters**
- **Priority:** High
- **Description:** Advanced search and filtering capabilities
- **Search Criteria:**
  - Text search (title, description, code)
  - Property type
  - Listing type (sale/rent)
  - Price range (min-max)
  - Area range (min-max)
  - Number of bedrooms
  - Number of bathrooms
  - City and district
  - Status (available, rented, sold)
  - Features (parking, pool, garden)
  - Date added
- **Features:**
  - Real-time search results
  - Search suggestions
  - Save search criteria
  - Clear all filters option

#### 3.2.3 Data Model

**Property Entity:**
```typescript
interface Property {
  id: UUID
  office_id: UUID
  property_code: string (unique)
  property_type: enum ('apartment', 'villa', 'land', 'commercial', 'duplex', 'townhouse', 'penthouse', 'studio', 'chalet', 'farm')
  listing_type: enum ('sale', 'rent')
  status: enum ('available', 'rented', 'sold', 'reserved', 'under_maintenance', 'draft')
  title: string
  title_en?: string
  description?: text
  description_en?: text
  price: decimal
  currency: string (default: 'SAR')
  area: decimal (square meters)
  city: string
  district?: string
  address: text
  location?: point (latitude, longitude)
  bedrooms: integer
  bathrooms: integer
  features?: jsonb (parking, pool, garden, elevator, security, gym, etc.)
  year_built?: integer
  floor_number?: integer
  owner_name?: string
  owner_phone?: string
  is_featured: boolean
  view_count: integer
  created_by: UUID
  assigned_agent?: UUID
  created_at: timestamp
  updated_at: timestamp
  deleted_at?: timestamp
}
```

### 3.3 Customer Relationship Management (CRM)

#### 3.3.1 Description

The CRM module manages all customer-related information and interactions. It tracks potential buyers, sellers, renters, and landlords, maintaining detailed profiles, interaction history, property interests, and communication preferences.

#### 3.3.2 Functional Requirements

**REQ-CRM-001: Customer Profile Management**
- **Priority:** Critical
- **Description:** Create and maintain comprehensive customer profiles
- **Required Fields:**
  - Name
  - Phone number (unique per office)
  - Customer type (buyer, seller, renter, landlord, both)
  - Status (active, inactive, blocked)
- **Optional Fields:**
  - Email address
  - National ID
  - City and address
  - Preferred contact method (phone, email, WhatsApp)
  - Budget range
  - Preferred property types
  - Preferred locations
  - Rating (1-5 stars)
  - Source (website, referral, walk-in, social media)
  - Notes
  - Custom tags
- **Validation:**
  - Phone number format validation
  - Email format validation
  - Unique phone number per office
  - Required fields must be provided

**REQ-CRM-002: Customer Interactions Tracking**
- **Priority:** High
- **Description:** Log all customer interactions and communication
- **Interaction Types:**
  - Phone calls
  - Meetings
  - Email correspondence
  - WhatsApp messages
  - Property viewings
- **Tracked Information:**
  - Interaction type
  - Date and time
  - Description/summary
  - Related property (if applicable)
  - Staff member involved
  - Outcome/result
  - Next follow-up date
- **Features:**
  - Timeline view of all interactions
  - Filter by type and date
  - Automated reminders for follow-ups
  - Export interaction history

**REQ-CRM-003: Customer Notes**
- **Priority:** Medium
- **Description:** Add and manage internal notes about customers
- **Features:**
  - Rich text notes
  - Mark notes as important
  - Tag notes by category
  - Track note author and timestamp
  - Search within notes
  - Edit and delete notes

**REQ-CRM-004: Property Interest Tracking**
- **Priority:** High
- **Description:** Track customer interest in properties
- **Relationship Types:**
  - Owner (owns the property)
  - Interested (expressed interest)
  - Viewed (attended viewing)
  - Negotiating (in negotiation phase)
  - Contracted (signed contract)
- **Features:**
  - Link customers to properties
  - Track viewing history
  - Record interest level
  - Monitor negotiation status
  - View customer's property portfolio

**REQ-CRM-005: Customer Search and Filtering**
- **Priority:** High
- **Description:** Search and filter customer database
- **Search Criteria:**
  - Name, phone, or email
  - Customer type
  - Status
  - City
  - Source
  - Rating
  - Assigned staff member
  - Date range
- **Features:**
  - Quick search bar
  - Advanced filter panel
  - Save filter combinations
  - Export filtered results

**REQ-CRM-006: Customer Statistics**
- **Priority:** Medium
- **Description:** Display key customer metrics
- **Metrics:**
  - Total customers
  - Customers by type (buyers, sellers, etc.)
  - Customers by status (active, inactive)
  - New customers this month
  - Total spent by customer
  - Total earned from customer
  - Outstanding balance
  - Average rating

**REQ-CRM-007: Customer Import/Export**
- **Priority:** Medium
- **Description:** Bulk import and export customer data
- **Features:**
  - Import from Excel/CSV
  - Column mapping tool
  - Validation before import
  - Duplicate detection
  - Export to Excel/CSV/PDF
  - Custom column selection
  - Filter before export

#### 3.3.3 Data Model

**Customer Entity:**
```typescript
interface Customer {
  id: UUID
  office_id: UUID
  name: string
  phone: string (unique per office)
  email?: string
  national_id?: string
  type: enum ('buyer', 'seller', 'renter', 'landlord', 'both')
  status: enum ('active', 'inactive', 'blocked')
  city?: string
  address?: text
  preferred_contact_method?: enum ('phone', 'email', 'whatsapp')
  source?: string (website, referral, walk-in, social_media, etc.)
  rating?: integer (1-5)
  notes?: text
  tags?: jsonb
  total_spent: decimal (default: 0)
  total_earned: decimal (default: 0)
  outstanding_balance: decimal (default: 0)
  assigned_staff_id?: UUID
  last_contact_date?: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.4 Appointments Management

#### 3.4.1 Description

The Appointments Management module handles scheduling and tracking of all property-related appointments, including viewings, meetings, contract signings, and inspections. It provides conflict detection, reminders, and calendar integration.

#### 3.4.2 Functional Requirements

**REQ-APPT-001: Appointment Scheduling**
- **Priority:** Critical
- **Description:** Create and schedule appointments
- **Required Fields:**
  - Title
  - Type (viewing, meeting, signing, inspection, consultation, other)
  - Date
  - Start time
  - End time
  - Assigned staff member
- **Optional Fields:**
  - Description
  - Property (if applicable)
  - Customer (if applicable)
  - Location/address
  - Meeting link (for virtual meetings)
  - Notes
- **Validation:**
  - End time must be after start time
  - Minimum duration: 30 minutes
  - Date must not be in the past
  - Staff member must be available (no conflicts)

**REQ-APPT-002: Conflict Detection**
- **Priority:** High
- **Description:** Prevent scheduling conflicts
- **Processing:**
  - Check for overlapping appointments
  - Validate against staff member's schedule
  - Consider travel time between locations
  - Respect business hours
- **Actions:**
  - Display warning if conflict detected
  - Suggest alternative times
  - Allow override for managers (with warning)

**REQ-APPT-003: Appointment Status Management**
- **Priority:** High
- **Description:** Track appointment lifecycle
- **Statuses:**
  - Scheduled (initial state)
  - Confirmed (customer confirmed)
  - In Progress (appointment started)
  - Completed (successfully finished)
  - Cancelled (cancelled by either party)
  - No Show (customer didn't attend)
- **State Transitions:**
  - Record who changed status
  - Record timestamp of change
  - Optionally require notes for cancellation
  - Track completion notes

**REQ-APPT-004: Calendar View**
- **Priority:** High
- **Description:** Display appointments in calendar format
- **Views:**
  - Month view
  - Week view
  - Day view
  - List view
- **Features:**
  - Color-coded by type
  - Filter by staff member
  - Filter by property
  - Filter by customer
  - Filter by status
  - Drag-and-drop rescheduling (with validation)
  - Click to view/edit details

**REQ-APPT-005: Appointment Reminders**
- **Priority:** Medium
- **Description:** Send automated reminders
- **Reminder Types:**
  - Email notifications
  - SMS messages
  - WhatsApp messages
  - In-app notifications
- **Timing:**
  - Configurable reminder intervals (24h, 1h before, etc.)
  - Multiple reminders per appointment
  - Staff and customer reminders
- **Content:**
  - Appointment details
  - Property information
  - Staff member contact
  - Location/directions
  - Confirmation/cancellation links

**REQ-APPT-006: Appointment Completion**
- **Priority:** Medium
- **Description:** Record appointment outcomes
- **Fields:**
  - Completion notes
  - Customer feedback
  - Next steps
  - Follow-up date
  - Outcome (successful, unsuccessful, needs_follow_up)
- **Actions:**
  - Log interaction in CRM
  - Create follow-up task
  - Update property viewing count
  - Trigger automated workflows

**REQ-APPT-007: Appointment Statistics**
- **Priority:** Low
- **Description:** Display appointment metrics
- **Metrics:**
  - Total appointments
  - Appointments by type
  - Appointments by status
  - Today's appointments
  - Upcoming appointments
  - Completion rate
  - No-show rate
  - Average duration

#### 3.4.3 Data Model

**Appointment Entity:**
```typescript
interface Appointment {
  id: UUID
  office_id: UUID
  title: string
  description?: text
  type: enum ('viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other')
  status: enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
  date: date
  start_time: time
  end_time: time
  duration: integer (minutes)
  property_id?: UUID
  customer_id?: UUID
  assigned_staff_id: UUID
  location?: text
  meeting_link?: string
  notes?: text
  completion_notes?: text
  created_by: UUID
  cancelled_by?: UUID
  cancelled_at?: timestamp
  cancellation_reason?: text
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.5 Contracts Management

#### 3.5.1 Description

The Contracts Management module handles rental and sale agreements, tracking contract lifecycle, payment schedules, renewals, and terminations. It provides comprehensive contract tracking and financial monitoring.

#### 3.5.2 Functional Requirements

**REQ-CONT-001: Contract Creation**
- **Priority:** Critical
- **Description:** Create new rental or sale contracts
- **Required Fields:**
  - Contract number (auto-generated: CON-YYYY-XXXX)
  - Contract type (rent, sale, maintenance)
  - Property
  - Customer(s)
  - Start date
  - End date (for rental contracts)
  - Total value
  - Payment terms
- **Optional Fields:**
  - Deposit amount
  - Commission amount
  - Payment schedule
  - Terms and conditions
  - Special clauses
  - Attached documents
- **Validation:**
  - Property must be available
  - End date must be after start date
  - Total value must be positive
  - Payment schedule must match total value

**REQ-CONT-002: Contract Status Tracking**
- **Priority:** High
- **Description:** Track contract lifecycle states
- **Statuses:**
  - Draft (being prepared)
  - Active (currently valid)
  - Expired (end date passed)
  - Cancelled (terminated early)
  - Suspended (temporarily paused)
- **Automated Status Updates:**
  - Mark as expired when end date passes
  - Alert when nearing expiration (30 days)
  - Track payment status
  - Calculate days remaining

**REQ-CONT-003: Payment Schedule Management**
- **Priority:** High
- **Description:** Manage contract payment installments
- **Features:**
  - Create payment schedule
  - Track paid vs unpaid installments
  - Record partial payments
  - Calculate outstanding balance
  - Payment due dates
  - Late payment tracking
- **Payment Methods:**
  - Cash
  - Bank transfer
  - Cheque
  - Credit card
  - Online payment

**REQ-CONT-004: Contract Renewal**
- **Priority:** Medium
- **Description:** Handle contract renewal process
- **Features:**
  - Renewal alerts before expiration
  - Generate renewal contract from existing
  - Update terms (price, duration)
  - Track renewal history
  - Link to previous contract
- **Processing:**
  - Copy contract details
  - Update dates and amounts
  - Reset payment schedule
  - Maintain relationship to original

**REQ-CONT-005: Contract Termination**
- **Priority:** Medium
- **Description:** Process early contract termination
- **Required Information:**
  - Termination date
  - Reason for termination
  - Final settlement amount
  - Penalty fees (if applicable)
- **Processing:**
  - Calculate outstanding payments
  - Apply termination penalties
  - Generate final invoice
  - Update property status
  - Log termination in history

**REQ-CONT-006: Contract Documents**
- **Priority:** Medium
- **Description:** Manage contract-related documents
- **Document Types:**
  - Signed contract PDF
  - Addendums
  - Payment receipts
  - Correspondence
  - ID copies
  - Property documents
- **Features:**
  - Upload multiple documents
  - Version control
  - Download and print
  - Generate contract from template

**REQ-CONT-007: Contract Reporting**
- **Priority:** Medium
- **Description:** Generate contract-related reports
- **Reports:**
  - Active contracts list
  - Expiring contracts (next 30/60/90 days)
  - Contract revenue summary
  - Payment status report
  - Overdue payments
  - Commission summary
- **Export Formats:** Excel, PDF, CSV

#### 3.5.3 Data Model

**Contract Entity:**
```typescript
interface Contract {
  id: UUID
  office_id: UUID
  contract_number: string (unique)
  contract_type: enum ('rent', 'sale', 'maintenance')
  status: enum ('draft', 'active', 'expired', 'cancelled', 'suspended')
  property_id: UUID
  customer_id: UUID
  landlord_id?: UUID
  start_date: date
  end_date?: date
  total_value: decimal
  currency: string
  deposit_amount?: decimal
  commission_amount?: decimal
  commission_percentage?: decimal
  payment_frequency?: enum ('monthly', 'quarterly', 'yearly', 'one_time')
  payment_terms?: text
  terms_and_conditions?: text
  special_clauses?: text
  created_by: UUID
  cancelled_at?: timestamp
  cancellation_reason?: text
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.6 Payments Management

#### 3.6.1 Description

The Payments Management module tracks all financial transactions related to contracts, including rent payments, sale installments, deposits, commissions, and penalties. It provides payment tracking, reminders, and financial reporting.

#### 3.6.2 Functional Requirements

**REQ-PAY-001: Payment Recording**
- **Priority:** Critical
- **Description:** Record customer payments
- **Required Fields:**
  - Contract reference
  - Amount
  - Payment date
  - Payment method
- **Optional Fields:**
  - Transaction reference
  - Cheque number
  - Bank name
  - Notes
  - Receipt number
- **Processing:**
  - Validate amount matches expected
  - Update contract balance
  - Generate receipt
  - Send confirmation notification
  - Log in financial records

**REQ-PAY-002: Payment Status Tracking**
- **Priority:** High
- **Description:** Monitor payment states
- **Statuses:**
  - Pending (not yet due)
  - Due (payment date reached)
  - Paid (fully paid)
  - Partial (partially paid)
  - Overdue (past due date)
  - Waived (forgiven)
- **Calculations:**
  - Days until due
  - Days overdue
  - Outstanding amount
  - Payment history
  - Payment progress percentage

**REQ-PAY-003: Payment Reminders**
- **Priority:** High
- **Description:** Automated payment reminders
- **Reminder Schedule:**
  - 7 days before due date
  - 3 days before due date
  - On due date
  - 3 days after due date (overdue)
  - 7 days after due date (overdue)
- **Channels:**
  - Email
  - SMS
  - WhatsApp
  - In-app notification
- **Content:**
  - Amount due
  - Due date
  - Contract reference
  - Payment methods
  - Payment link (if available)

**REQ-PAY-004: Overdue Payment Management**
- **Priority:** High
- **Description:** Handle late payments
- **Features:**
  - Identify overdue payments
  - Calculate late fees (if applicable)
  - Send escalating reminders
  - Flag customers with multiple overdue payments
  - Generate overdue payment report
- **Actions:**
  - Send urgent notifications
  - Escalate to management
  - Initiate collection process
  - Suspend services (if policy allows)

**REQ-PAY-005: Bulk Payment Actions**
- **Priority:** Medium
- **Description:** Process multiple payments
- **Actions:**
  - Mark multiple payments as paid
  - Send reminders to multiple customers
  - Generate batch receipts
  - Export payment list
- **Features:**
  - Select payments by filter
  - Preview before action
  - Confirmation dialog
  - Bulk validation

**REQ-PAY-006: Payment Analytics**
- **Priority:** Medium
- **Description:** Financial insights and metrics
- **Metrics:**
  - Total payments this month
  - Outstanding payments
  - Overdue payments
  - Collection rate
  - Average payment time
  - Payment method distribution
- **Visualizations:**
  - Payment trends chart
  - Collection rate over time
  - Payment method breakdown
  - Outstanding vs collected

**REQ-PAY-007: Receipt Generation**
- **Priority:** High
- **Description:** Generate payment receipts
- **Features:**
  - Auto-generate receipt number
  - Professional PDF format
  - Include office branding
  - Payment details
  - Contract information
  - "Paid" stamp
- **Actions:**
  - Download receipt
  - Print receipt
  - Email to customer
  - WhatsApp to customer

#### 3.6.3 Data Model

**Payment Entity:**
```typescript
interface Payment {
  id: UUID
  office_id: UUID
  contract_id: UUID
  payment_number: string (unique)
  payment_type: enum ('rent', 'deposit', 'commission', 'penalty', 'maintenance', 'other')
  status: enum ('pending', 'due', 'paid', 'partial', 'overdue', 'waived')
  amount: decimal
  paid_amount: decimal (default: 0)
  due_date: date
  payment_date?: date
  payment_method?: enum ('cash', 'bank_transfer', 'cheque', 'credit_card', 'online')
  transaction_reference?: string
  cheque_number?: string
  bank_name?: string
  notes?: text
  late_fee?: decimal
  created_by?: UUID
  recorded_by?: UUID
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.7 Maintenance Management

#### 3.7.1 Description

The Maintenance Management module handles property maintenance and repair requests from tenants and property owners. It tracks requests from submission to completion, assigns technicians, and manages costs.

#### 3.7.2 Functional Requirements

**REQ-MAINT-001: Maintenance Request Submission**
- **Priority:** High
- **Description:** Allow users to submit maintenance requests
- **Submission Channels:**
  - Internal (staff submission)
  - Public portal (tenant submission)
  - Mobile app (future)
  - Phone call (staff records)
- **Required Fields:**
  - Property
  - Issue category (plumbing, electrical, AC, etc.)
  - Issue description
  - Priority (low, medium, high, urgent)
- **Optional Fields:**
  - Photos/attachments
  - Preferred date/time
  - Contact information
  - Special instructions
- **Processing:**
  - Generate unique request number
  - Send confirmation notification
  - Assign based on category
  - Estimate cost (if known)

**REQ-MAINT-002: Request Assignment**
- **Priority:** High
- **Description:** Assign requests to technicians
- **Assignment Methods:**
  - Manual assignment by manager
  - Auto-assignment based on category
  - Auto-assignment based on workload
  - Self-assignment by technician
- **Factors:**
  - Technician expertise
  - Current workload
  - Location proximity
  - Availability
- **Notifications:**
  - Notify assigned technician
  - Notify property owner
  - Notify tenant

**REQ-MAINT-003: Request Status Tracking**
- **Priority:** High
- **Description:** Track maintenance lifecycle
- **Statuses:**
  - Submitted (initial state)
  - Assigned (technician assigned)
  - Scheduled (date/time confirmed)
  - In Progress (work started)
  - Completed (work finished)
  - Cancelled (request cancelled)
  - On Hold (awaiting parts/approval)
- **Features:**
  - Status history
  - Time spent in each status
  - Automated status updates
  - Status change notifications

**REQ-MAINT-004: Work Completion**
- **Priority:** High
- **Description:** Record maintenance completion
- **Required Information:**
  - Completion date/time
  - Work performed description
  - Parts used
  - Labor hours
  - Total cost
- **Optional Information:**
  - Before/after photos
  - Customer signature
  - Quality rating
  - Follow-up required
- **Processing:**
  - Generate completion report
  - Update property maintenance log
  - Generate invoice (if billable)
  - Notify property owner
  - Close request

**REQ-MAINT-005: Cost Tracking**
- **Priority:** Medium
- **Description:** Track maintenance expenses
- **Cost Components:**
  - Labor cost
  - Parts/materials cost
  - Travel expenses
  - Contractor fees
- **Processing:**
  - Calculate total cost
  - Determine responsibility (owner/tenant)
  - Generate invoice if billable
  - Update property maintenance history
  - Track warranty claims

**REQ-MAINT-006: Maintenance History**
- **Priority:** Medium
- **Description:** Maintain property maintenance records
- **Features:**
  - View all maintenance for property
  - Filter by category, date, cost
  - Search maintenance records
  - Export maintenance history
  - Identify recurring issues
- **Reports:**
  - Maintenance cost by property
  - Most common issues
  - Response time analysis
  - Technician performance

#### 3.7.3 Data Model

**Maintenance Request Entity:**
```typescript
interface MaintenanceRequest {
  id: UUID
  office_id: UUID
  request_number: string (unique)
  property_id: UUID
  submitted_by?: UUID
  tenant_name?: string
  tenant_phone?: string
  category: enum ('plumbing', 'electrical', 'ac', 'carpentry', 'painting', 'appliances', 'pest_control', 'other')
  priority: enum ('low', 'medium', 'high', 'urgent')
  title: string
  description: text
  status: enum ('submitted', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')
  assigned_to?: UUID (technician)
  scheduled_date?: date
  scheduled_time?: time
  completed_date?: timestamp
  work_performed?: text
  parts_used?: text
  labor_hours?: decimal
  labor_cost?: decimal
  parts_cost?: decimal
  total_cost?: decimal
  billable_to?: enum ('owner', 'tenant', 'office')
  notes?: text
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.8 Finance Reports and Analytics

#### 3.8.1 Description

The Finance Reports and Analytics module provides comprehensive financial visibility through dashboards, reports, and interactive charts. It tracks revenue, expenses, profitability, and key performance indicators.

#### 3.8.2 Functional Requirements

**REQ-FIN-001: Financial Dashboard**
- **Priority:** High
- **Description:** Display key financial metrics
- **KPI Cards:**
  - Monthly revenue (with trend)
  - Monthly expenses (with trend)
  - Net profit (with trend)
  - Outstanding payments
- **Features:**
  - Sparkline charts in KPI cards
  - Comparison with previous period
  - Percentage change indicators
  - Color-coded performance
  - Refresh data automatically

**REQ-FIN-002: Revenue Analytics**
- **Priority:** High
- **Description:** Analyze revenue sources and trends
- **Charts:**
  - Revenue vs Expenses line chart (12 months)
  - Revenue by source pie chart
  - Monthly revenue trend
  - Property revenue ranking
- **Revenue Sources:**
  - Rental income
  - Sales revenue
  - Commission income
  - Maintenance fees
  - Other income
- **Filters:**
  - Date range selection
  - Property type
  - Revenue source
  - Staff member

**REQ-FIN-003: Expense Tracking**
- **Priority:** High
- **Description:** Monitor and categorize expenses
- **Charts:**
  - Expenses by category donut chart
  - Monthly expense trends
  - Budget vs actual comparison
- **Expense Categories:**
  - Salaries and wages
  - Maintenance costs
  - Marketing expenses
  - Utilities
  - Office rent
  - Administrative costs
  - Other expenses
- **Features:**
  - Budget alerts
  - Expense approval workflow
  - Receipt management

**REQ-FIN-004: Profit & Loss Statement**
- **Priority:** High
- **Description:** Generate P&L statements
- **Sections:**
  - Revenue (itemized by source)
  - Cost of Sales
  - Gross Profit
  - Operating Expenses (itemized)
  - Operating Profit
  - Other Income/Expenses
  - Net Profit/Loss
- **Features:**
  - Compare multiple periods
  - Export to Excel/PDF
  - Print-friendly format
  - Drill-down to details

**REQ-FIN-005: Cash Flow Analysis**
- **Priority:** Medium
- **Description:** Track cash inflows and outflows
- **Charts:**
  - Cash flow area chart
  - Projected vs actual
  - Running balance
- **Analysis:**
  - Operating cash flow
  - Investing cash flow
  - Financing cash flow
  - Net cash flow
- **Alerts:**
  - Low cash balance warning
  - Negative cash flow alert
  - Upcoming large expenses

**REQ-FIN-006: Top Properties Report**
- **Priority:** Medium
- **Description:** Rank properties by profitability
- **Metrics per Property:**
  - Total revenue
  - Total expenses
  - Net profit
  - ROI percentage
  - Occupancy rate
  - Trend indicator
- **Features:**
  - Top 10 most profitable
  - Bottom 10 least profitable
  - Sort by any metric
  - Export report

**REQ-FIN-007: Budget Planning**
- **Priority:** Medium
- **Description:** Create and track budgets
- **Features:**
  - Set monthly budget targets
  - Track actual vs budget
  - Calculate variance
  - Alert when over budget (90% threshold)
  - Budget categories breakdown
  - Visual progress bars
- **Budget Categories:**
  - Revenue targets
  - Expense limits
  - Marketing budget
  - Maintenance budget
  - Staff costs

**REQ-FIN-008: Report Generator**
- **Priority:** Medium
- **Description:** Generate custom financial reports
- **Report Types:**
  - Revenue report
  - Expense report
  - Profit & Loss statement
  - Cash flow statement
  - Comprehensive report
- **Options:**
  - Date range selection
  - Quick date presets (this month, last month, etc.)
  - Output format (PDF/Excel)
  - Include/exclude sections
- **Features:**
  - Save report templates
  - Schedule automated reports
  - Email report to stakeholders

#### 3.8.3 Required Charts

1. **Revenue vs Expenses Line Chart** (12 months)
2. **Revenue Sources Pie Chart**
3. **Expenses by Category Donut Chart**
4. **Cash Flow Area Chart** (6 months)
5. **Budget Progress Bars**
6. **KPI Sparkline Charts** (embedded in cards)

### 3.9 Excel Import/Export System

#### 3.9.1 Description

The Excel Import/Export System provides bulk data management through Excel and CSV files. It includes intelligent column matching, data validation, and customizable export templates.

#### 3.9.2 Functional Requirements

**REQ-EXCEL-001: Property Import**
- **Priority:** High
- **Description:** Import properties from Excel/CSV files
- **Features:**
  - Drag-and-drop file upload
  - Support .xlsx, .xls, .csv formats
  - File size limit: 10MB
  - Preview first 10 rows
  - Column mapping interface
- **Processing:**
  - Parse file structure
  - Auto-detect columns
  - Map to system fields
  - Validate data
  - Preview import results
  - Import in batches (100 rows)
- **Validation:**
  - Required fields present
  - Data type validation
  - Format validation (phone, email, dates)
  - Duplicate detection
  - Dependency checking
- **Results:**
  - Success count
  - Error count
  - Warning count
  - Detailed error messages
  - Downloadable error report

**REQ-EXCEL-002: Intelligent Column Matching**
- **Priority:** High
- **Description:** AI-powered column mapping
- **Algorithm:** Levenshtein Distance
- **Features:**
  - Auto-match similar column names
  - Support Arabic and English
  - Confidence score (High/Medium/Low)
  - Suggest top 3 matches
  - Synonym dictionary
  - Manual override option
- **Mappings:**
  - Arabic → English
  - Different naming conventions
  - Abbreviations
  - Common variations
- **Confidence Levels:**
  - High (0.9-1.0): Green indicator
  - Medium (0.7-0.89): Yellow indicator
  - Low (0-0.69): Red indicator

**REQ-EXCEL-003: Customer Import**
- **Priority:** High
- **Description:** Bulk import customer records
- **Features:**
  - Similar to property import
  - Additional phone validation
  - Duplicate phone detection
  - Email validation
  - Batch processing
- **Special Handling:**
  - Customer type validation
  - Status assignment
  - Auto-assign to staff (optional)
  - Tags import (JSON format)

**REQ-EXCEL-004: Data Export**
- **Priority:** High
- **Description:** Export data to Excel/CSV/PDF
- **Export Options:**
  - Export all records
  - Export selected records
  - Export filtered records
  - Export by date range
- **Column Selection:**
  - Choose which columns to export
  - Reorder columns
  - Rename column headers
  - Show/hide specific fields
- **Format Options:**
  - Excel (.xlsx)
  - CSV (.csv)
  - PDF (formatted)
- **Formatting:**
  - Office branding
  - Header styling
  - Color coding
  - Auto-fit columns
  - Statistics footer

**REQ-EXCEL-005: Export Templates**
- **Priority:** Medium
- **Description:** Pre-configured export templates
- **Built-in Templates:**
  - Basic template (all fields)
  - Buyer template (buyer-specific fields)
  - Seller template (seller-specific fields)
  - Renter template (renter-specific fields)
  - Quick template (essential fields only)
- **Custom Templates:**
  - Create custom templates
  - Save field selections
  - Manage template library
  - Share templates (optional)
  - Edit existing templates
- **Template Features:**
  - Data validation dropdowns
  - Sample data rows
  - Instructions sheet
  - Formatted headers

**REQ-EXCEL-006: Export History**
- **Priority:** Low
- **Description:** Track export operations
- **Tracked Information:**
  - Export timestamp
  - User who exported
  - Number of records
  - Export type
  - Filters applied
- **Features:**
  - View last 5 exports
  - Re-download previous exports
  - Export statistics

**REQ-EXCEL-007: Import Validation**
- **Priority:** Critical
- **Description:** Comprehensive data validation
- **Validations:**
  - Required fields check
  - Data type validation
  - Format validation (phone: +966XXXXXXXXX)
  - Range validation (prices, areas)
  - Enum value validation
  - Cross-field validation
  - Duplicate detection
- **Results:**
  - Valid rows (green)
  - Warnings (yellow)
  - Errors (red)
  - Detailed error messages
  - Row-by-row status

#### 3.9.3 Column Matcher Algorithm

**Supported Synonyms:**
- السعر → price, cost, value
- العنوان → title, name, heading
- الوصف → description, details
- المساحة → area, size, square_meters
- نوع العقار → property_type, type
- الهاتف → phone, mobile, contact
- البريد → email, mail
- المدينة → city, location

### 3.10 WhatsApp Integration

#### 3.10.1 Description

Integration with WhatsApp Business API for automated customer communication, notifications, and two-way messaging.

#### 3.10.2 Functional Requirements

**REQ-WA-001: Message Sending**
- **Priority:** Medium
- **Description:** Send WhatsApp messages to customers
- **Message Types:**
  - Payment reminders
  - Appointment confirmations
  - Property updates
  - Maintenance updates
  - Marketing messages
- **Features:**
  - Template messages
  - Dynamic content insertion
  - Bulk messaging
  - Scheduled messages
  - Message status tracking (sent, delivered, read)

**REQ-WA-002: Notification System**
- **Priority:** Medium
- **Description:** Automated WhatsApp notifications
- **Triggers:**
  - Payment due
  - Appointment reminder
  - Maintenance request status change
  - Contract expiry warning
  - New property matching criteria
- **Configuration:**
  - Enable/disable per notification type
  - Customize message templates
  - Set timing rules
  - Opt-out management

**REQ-WA-003: Message History**
- **Priority:** Low
- **Description:** Track WhatsApp communications
- **Features:**
  - View message history per customer
  - Search messages
  - Filter by date and type
  - Delivery status
  - Read receipts

### 3.11 Analytics Dashboard

#### 3.11.1 Description

Executive-level analytics dashboard providing high-level insights, trends, and performance metrics for management decision-making.

#### 3.11.2 Functional Requirements

**REQ-ANALYTICS-001: Executive Summary**
- **Priority:** Medium
- **Description:** High-level business overview
- **Metrics:**
  - Total properties
  - Total customers
  - Active contracts
  - Monthly revenue
  - Monthly growth rate
  - Occupancy rate
  - Average deal size
- **Visualizations:**
  - KPI grid
  - Trend indicators
  - Comparison cards
  - Goal progress

**REQ-ANALYTICS-002: Sales Funnel**
- **Priority:** Medium
- **Description:** Visualize sales pipeline
- **Stages:**
  - Leads
  - Property viewings
  - Negotiations
  - Contracts signed
  - Completed deals
- **Metrics:**
  - Conversion rates
  - Drop-off points
  - Average time per stage
  - Success rate

**REQ-ANALYTICS-003: Performance Tracking**
- **Priority:** Medium
- **Description:** Track staff and office performance
- **Metrics:**
  - Top performers (staff)
  - Sales by agent
  - Properties listed per agent
  - Customer satisfaction ratings
  - Response time metrics
- **Visualizations:**
  - Leaderboard
  - Performance charts
  - Comparison graphs

**REQ-ANALYTICS-004: Market Insights**
- **Priority:** Low
- **Description:** Real estate market analysis
- **Insights:**
  - Average property prices by area
  - Most popular property types
  - Seasonal trends
  - Price trends over time
  - Demand by location
- **Features:**
  - Interactive charts
  - Filter by property type
  - Date range selection
  - Export insights

**REQ-ANALYTICS-005: Goals Tracking**
- **Priority:** Low
- **Description:** Track business goals and targets
- **Goal Types:**
  - Revenue targets
  - Sales targets
  - New customer acquisition
  - Contract renewals
  - Occupancy rate
- **Features:**
  - Set monthly/quarterly/yearly goals
  - Track progress
  - Alerts when off-track
  - Historical goal performance

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 General UI Requirements

**UI-001: Responsive Design**
- **Description:** All interfaces must adapt to different screen sizes
- **Breakpoints:**
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px - 1919px
  - Large Desktop: 1920px+
- **Requirements:**
  - Touch-friendly on mobile (minimum 44x44px tap targets)
  - Adaptive navigation (hamburger menu on mobile)
  - Scalable typography
  - Flexible grid layouts

**UI-002: RTL Support**
- **Description:** Full support for Arabic (Right-to-Left) language
- **Requirements:**
  - Mirror layout for RTL
  - Proper text alignment
  - Icon positioning
  - Form field layouts
  - Table and grid layouts
  - Charts and visualizations

**UI-003: Accessibility**
- **Description:** Comply with accessibility standards
- **Requirements:**
  - Keyboard navigation support
  - Proper heading hierarchy
  - Alt text for images
  - ARIA labels where needed
  - Sufficient color contrast (WCAG AA minimum)
  - Focus indicators

**UI-004: Branding and Theming**
- **Description:** Consistent visual identity
- **Elements:**
  - Primary color: #0066CC (blue)
  - Success color: #10B981 (green)
  - Warning color: #F59E0B (amber)
  - Danger color: #EF4444 (red)
  - Typography: System fonts, Arabic-friendly
  - Consistent spacing and sizing
  - Shadow and elevation system

#### 4.1.2 Key Interface Components

**UI-005: Dashboard Interface**
- **Components:**
  - Header with user menu and notifications
  - Sidebar navigation (collapsible)
  - KPI cards with statistics
  - Charts and graphs
  - Recent activity feed
  - Quick action buttons
- **Features:**
  - Real-time data updates
  - Customizable widgets
  - Dark mode support (optional)

**UI-006: Data Tables**
- **Features:**
  - Sortable columns
  - Filterable data
  - Pagination controls
  - Row selection (single/multiple)
  - Bulk actions
  - Column visibility toggle
  - Export buttons
  - Responsive (card view on mobile)

**UI-007: Forms**
- **Components:**
  - Text inputs
  - Number inputs
  - Date pickers (with Arabic calendar)
  - Time pickers
  - Dropdowns/selects
  - Multi-select
  - Checkboxes and radio buttons
  - File upload (drag-and-drop)
  - Rich text editor (optional)
- **Features:**
  - Real-time validation
  - Error messages in Arabic
  - Required field indicators
  - Help text/tooltips
  - Auto-save (optional)

**UI-008: Modals and Dialogs**
- **Types:**
  - Confirmation dialogs
  - Form modals
  - Detail view modals
  - Image galleries
  - Delete confirmations
- **Features:**
  - Keyboard shortcuts (ESC to close)
  - Click outside to close (optional)
  - Loading states
  - Error handling

**UI-009: Notifications and Alerts**
- **Types:**
  - Success messages (toast)
  - Error messages (toast)
  - Warning alerts
  - Info notifications
  - In-app notification panel
- **Features:**
  - Auto-dismiss (configurable)
  - Action buttons
  - Stacking
  - Position (top-right, top-center, etc.)

### 4.2 Software Interfaces

#### 4.2.1 Frontend to Backend Communication

**INT-001: REST API**
- **Protocol:** HTTPS
- **Format:** JSON
- **Authentication:** Bearer token (JWT)
- **Base URL:** `https://api.example.com/v1`
- **Request Headers:**
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  Accept: application/json
  ```
- **Response Structure:**
  ```json
  {
    "success": true,
    "data": {...},
    "message": "Operation successful",
    "timestamp": "2025-11-08T10:30:00Z"
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Error message in Arabic",
    "error": "Bad Request",
    "timestamp": "2025-11-08T10:30:00Z"
  }
  ```

**INT-002: API Endpoints Structure**
- **Properties:** `/properties/*`
- **Customers:** `/customers/*`
- **Appointments:** `/appointments/*`
- **Contracts:** `/contracts/*`
- **Payments:** `/payments/*`
- **Maintenance:** `/maintenance/*`
- **Analytics:** `/analytics/*`
- **Auth:** `/auth/*`

#### 4.2.2 Database Interface

**INT-003: Database Connection**
- **Database:** PostgreSQL 14+
- **ORM:** TypeORM
- **Connection:** Supabase client library
- **Features:**
  - Connection pooling
  - Row-Level Security (RLS)
  - Prepared statements
  - Transaction support
  - Automatic migrations

#### 4.2.3 External Service Interfaces

**INT-004: Supabase Storage**
- **Purpose:** File storage for images and documents
- **Operations:**
  - Upload files
  - Download files
  - Delete files
  - Generate signed URLs
- **Buckets:**
  - `property-images`
  - `documents`
  - `maintenance-photos`
  - `avatars`

**INT-005: WhatsApp Business API**
- **Provider:** Meta (Facebook)
- **Purpose:** Send WhatsApp messages
- **Operations:**
  - Send template messages
  - Send media messages
  - Check message status
  - Receive webhooks

**INT-006: Excel Processing**
- **Library:** xlsx (SheetJS)
- **Operations:**
  - Parse Excel files
  - Generate Excel files
  - Read CSV files
  - Write CSV files

**INT-007: PDF Generation**
- **Library:** jsPDF with jsPDF-AutoTable
- **Purpose:** Generate invoices, receipts, reports
- **Features:**
  - Arabic font support (Amiri, Cairo)
  - Tables and grids
  - Images and logos
  - Custom styling

### 4.3 Communication Interfaces

**COMM-001: Email Notifications**
- **Protocol:** SMTP
- **Use Cases:**
  - Password reset
  - Appointment reminders
  - Payment receipts
  - System notifications
- **Requirements:**
  - HTML email templates
  - Responsive design
  - Unsubscribe links
  - Tracking (optional)

**COMM-002: SMS Notifications**
- **Provider:** Third-party SMS gateway
- **Use Cases:**
  - OTP for login (optional)
  - Urgent reminders
  - Payment confirmations
- **Requirements:**
  - Unicode support (Arabic)
  - Delivery status tracking

---

## 5. Non-functional Requirements

### 5.1 Performance Requirements

**PERF-001: API Response Time**
- **Requirement:** 95% of API requests must complete within 2 seconds
- **Measurement:** Median response time under 500ms
- **Conditions:** Under normal load (100 concurrent users)

**PERF-002: Page Load Time**
- **Requirement:** Initial page load under 3 seconds (3G connection)
- **Measurement:** First Contentful Paint (FCP) under 2 seconds
- **Optimization:**
  - Code splitting
  - Lazy loading
  - Image optimization
  - CDN usage
  - Caching strategies

**PERF-003: Database Queries**
- **Requirement:** All queries must have proper indexes
- **Optimization:**
  - Query execution time under 100ms
  - Use of prepared statements
  - Connection pooling
  - Query result caching

**PERF-004: File Upload/Download**
- **Requirement:** Support files up to 10MB
- **Upload Speed:** Depends on user connection
- **Optimization:**
  - Chunked uploads for large files
  - Progress indicators
  - Resume capability (optional)

**PERF-005: Concurrent Users**
- **Requirement:** Support 100+ concurrent users
- **Scaling:** Horizontal scaling capability
- **Load Balancing:** Support for multiple backend instances

**PERF-006: Data Processing**
- **Requirement:** Excel import processing
- **Performance:**
  - Process 1000 rows within 10 seconds
  - Batch processing (100 rows per batch)
  - Progress tracking
  - Background processing for large files

### 5.2 Security Requirements

**SEC-001: Authentication**
- **Requirement:** Secure user authentication
- **Implementation:**
  - JWT tokens with expiration
  - Secure password hashing (bcrypt, 10+ rounds)
  - Token refresh mechanism
  - Session timeout (configurable)
  - Logout on all devices option

**SEC-002: Authorization**
- **Requirement:** Role-based access control (RBAC)
- **Implementation:**
  - Enforce permissions on all endpoints
  - Validate user role from JWT
  - Deny by default principle
  - Audit log for sensitive operations

**SEC-003: Data Encryption**
- **Requirements:**
  - HTTPS for all communications (TLS 1.2+)
  - Encrypted database connections
  - Encrypted file storage
  - Hashed passwords (never plain text)
  - Encrypted backup files

**SEC-004: Input Validation**
- **Requirements:**
  - Server-side validation for all inputs
  - SQL injection prevention (ORM/prepared statements)
  - XSS prevention (sanitize output)
  - CSRF protection
  - File upload validation (type, size)

**SEC-005: API Security**
- **Requirements:**
  - Rate limiting (prevent DDoS)
  - CORS configuration (whitelist origins)
  - API versioning
  - Request/response logging
  - Security headers (Helmet.js)

**SEC-006: Data Privacy**
- **Requirements:**
  - Row-Level Security (RLS) in database
  - Multi-tenant data isolation
  - Personal data encryption
  - Right to be forgotten (data deletion)
  - Consent management

**SEC-007: Audit Trail**
- **Requirements:**
  - Log all critical operations
  - Track who, what, when, where
  - Immutable audit logs
  - Log retention policy (1 year minimum)
  - Regular security audits

### 5.3 Reliability Requirements

**REL-001: System Availability**
- **Requirement:** 99.5% uptime (monthly)
- **Downtime:** Maximum 3.6 hours per month
- **Maintenance Windows:** Scheduled outside business hours

**REL-002: Data Backup**
- **Requirements:**
  - Automated daily backups
  - Point-in-time recovery (7 days)
  - Offsite backup storage
  - Backup testing (monthly)
  - Recovery Time Objective (RTO): 4 hours
  - Recovery Point Objective (RPO): 24 hours

**REL-003: Error Handling**
- **Requirements:**
  - Graceful error handling
  - User-friendly error messages (Arabic)
  - Detailed error logging
  - Automatic error reporting (Sentry)
  - Retry mechanisms for transient failures

**REL-004: Data Integrity**
- **Requirements:**
  - ACID compliance for transactions
  - Foreign key constraints
  - Data validation at multiple layers
  - Referential integrity enforcement
  - Soft delete for audit trail

**REL-005: Monitoring and Alerting**
- **Requirements:**
  - Real-time system monitoring
  - Performance metrics tracking
  - Error rate monitoring
  - Disk space alerts
  - Database connection alerts
  - API endpoint health checks

### 5.4 Maintainability Requirements

**MAINT-001: Code Quality**
- **Requirements:**
  - TypeScript for type safety
  - ESLint and Prettier for code formatting
  - Code comments in Arabic/English
  - Clear naming conventions
  - Modular architecture
  - DRY principle (Don't Repeat Yourself)

**MAINT-002: Documentation**
- **Requirements:**
  - API documentation (Swagger/OpenAPI)
  - Code documentation (JSDoc/TSDoc)
  - User manuals
  - System architecture diagrams
  - Database schema documentation
  - Deployment guides

**MAINT-003: Version Control**
- **Requirements:**
  - Git for source control
  - Branching strategy (GitFlow)
  - Meaningful commit messages
  - Pull request reviews
  - Version tagging

**MAINT-004: Testing**
- **Requirements:**
  - Unit tests (minimum 60% coverage)
  - Integration tests for critical paths
  - E2E tests for main workflows
  - API endpoint tests
  - Load testing

**MAINT-005: Logging**
- **Requirements:**
  - Structured logging
  - Log levels (ERROR, WARN, INFO, DEBUG)
  - Contextual information in logs
  - Log aggregation
  - Log search and filtering

**MAINT-006: Configuration Management**
- **Requirements:**
  - Environment-based configuration
  - Secrets management (not in code)
  - Feature flags (optional)
  - Easy configuration updates
  - Configuration validation

### 5.5 Usability Requirements

**USE-001: User Interface**
- **Requirements:**
  - Intuitive navigation
  - Consistent design patterns
  - Clear visual hierarchy
  - Helpful tooltips and hints
  - Progress indicators
  - Confirmation dialogs for destructive actions

**USE-002: Language Support**
- **Requirements:**
  - Primary language: Arabic
  - Full RTL support
  - Proper Arabic typography
  - Date formatting (Hijri/Gregorian)
  - Number formatting (Arabic numerals)
  - English fallback for technical terms

**USE-003: User Feedback**
- **Requirements:**
  - Immediate feedback for actions
  - Loading states for async operations
  - Success/error notifications
  - Validation messages
  - Helpful error messages
  - Empty states with guidance

**USE-004: Help and Support**
- **Requirements:**
  - Contextual help (tooltips)
  - User guide/documentation
  - FAQ section
  - Support contact information
  - In-app chat support (optional)

**USE-005: Onboarding**
- **Requirements:**
  - Welcome wizard for new users
  - Guided tours for key features
  - Sample data for exploration
  - Video tutorials (optional)
  - Quick start guide

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **عقار (Property)** | Real estate asset including apartments, villas, land, and commercial spaces |
| **عميل (Customer)** | Person or entity interested in buying, selling, renting property |
| **موعد (Appointment)** | Scheduled meeting for property viewing or consultation |
| **عقد (Contract)** | Rental or sale agreement between parties |
| **دفعة (Payment)** | Financial transaction related to contract |
| **صيانة (Maintenance)** | Repair or upkeep request for property |
| **مكتب عقاري (Real Estate Office)** | Organization using the system |
| **مدير (Manager)** | User with full system access and permissions |
| **موظف (Staff)** | User with limited permissions (agents, assistants) |
| **محاسب (Accountant)** | User focused on financial operations |
| **فني (Technician)** | User handling maintenance requests |

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | Senior Software Analyst Team | Initial SRS document creation |

---

**End of Software Requirements Specification**
