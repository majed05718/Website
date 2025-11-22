# Software Requirements Specification (SRS) v3.0
## The System Constitution - Master Table of Contents

**Document Control**
- Version: 3.0
- Status: Constitutional Blueprint
- Classification: Strategic Architecture Document
- Compliance Scope: ISO 27001, ISO 9001, Saudi Real Estate Regulations
- Target Audience: CIO, CTO, Investors, Compliance Officers, Development Teams

---

## **PART I: EXECUTIVE & INVESTOR VIEW**

### 1. Executive Summary & Strategic Vision
#### 1.1 Business Case & Value Proposition
##### 1.1.1 Market Opportunity in Saudi Real Estate Tech
##### 1.1.2 Competitive Differentiation Strategy
##### 1.1.3 Total Addressable Market (TAM) Analysis
##### 1.1.4 Revenue Streams & Monetization Model
###### 1.1.4.1 Subscription Tiers (Office-Based)
###### 1.1.4.2 Transaction Fees & Commission Model
###### 1.1.4.3 Premium Analytics & BI Services
###### 1.1.4.4 White-Label Solutions for Enterprises

#### 1.2 Return on Investment (ROI) Framework
##### 1.2.1 Financial Projections (3-Year Horizon)
##### 1.2.2 Cost-Benefit Analysis
##### 1.2.3 Break-Even Timeline
##### 1.2.4 Key Performance Indicators (KPIs)
###### 1.2.4.1 Customer Acquisition Cost (CAC)
###### 1.2.4.2 Lifetime Value (LTV)
###### 1.2.4.3 Monthly Recurring Revenue (MRR)
###### 1.2.4.4 Churn Rate Targets

#### 1.3 Strategic Roadmap & Phasing
##### 1.3.1 Phase 1: Foundation & Core Systems (Q1-Q2)
###### 1.3.1.1 Authentication & RBAC Infrastructure
###### 1.3.1.2 Multi-Tenancy Architecture
###### 1.3.1.3 Real-Time Analytics Engine
###### 1.3.1.4 Core Property Management Module
##### 1.3.2 Phase 2: Advanced Features & Integration (Q3-Q4)
###### 1.3.2.1 Advanced Business Intelligence & Predictive Analytics
###### 1.3.2.2 WhatsApp Integration (2FA & Notifications)
###### 1.3.2.3 Client Self-Service Portal
###### 1.3.2.4 Financial Management & Automated Invoicing
##### 1.3.3 Phase 3: Market Expansion & AI (Year 2)
###### 1.3.3.1 AI-Powered Property Valuation
###### 1.3.3.2 Market Sentiment Analysis (Social Media)
###### 1.3.3.3 Multi-Language Support Expansion
###### 1.3.3.4 Mobile Applications (iOS/Android)
##### 1.3.4 Phase 4: Enterprise & Ecosystem (Year 3)
###### 1.3.4.1 API Marketplace for Third-Party Integrations
###### 1.3.4.2 Blockchain for Property Verification
###### 1.3.4.3 IoT Integration (Smart Home Data)
###### 1.3.4.4 Regional Expansion (GCC Markets)

#### 1.4 Risk Management & Mitigation Strategy
##### 1.4.1 Market Risks
##### 1.4.2 Technical Risks
##### 1.4.3 Regulatory & Compliance Risks
##### 1.4.4 Operational Risks
##### 1.4.5 Contingency Planning

---

## **PART II: COMPLIANCE & LEGAL VIEW**

### 2. Regulatory Compliance Framework
#### 2.1 ISO 27001: Information Security Management System (ISMS)
##### 2.1.1 Scope Definition & Asset Inventory
##### 2.1.2 Risk Assessment Methodology
###### 2.1.2.1 Threat Modeling for Real Estate SaaS
###### 2.1.2.2 Vulnerability Assessment Protocols
###### 2.1.2.3 Impact Analysis Matrix
##### 2.1.3 Security Controls Catalog
###### 2.1.3.1 Access Control (A.9)
###### 2.1.3.2 Cryptography (A.10)
###### 2.1.3.3 Physical & Environmental Security (A.11)
###### 2.1.3.4 Operations Security (A.12)
###### 2.1.3.5 Communications Security (A.13)
###### 2.1.3.6 System Acquisition & Development (A.14)
##### 2.1.4 Incident Management & Business Continuity
###### 2.1.4.1 Security Event Monitoring
###### 2.1.4.2 Incident Response Procedures
###### 2.1.4.3 Disaster Recovery Plan (DRP)
###### 2.1.4.4 Business Continuity Plan (BCP)
##### 2.1.5 Audit & Certification Roadmap

#### 2.2 ISO 9001: Quality Management System (QMS)
##### 2.2.1 Quality Policy & Objectives
##### 2.2.2 Process Documentation Standards
##### 2.2.3 Customer Satisfaction Metrics
##### 2.2.4 Continuous Improvement (PDCA Cycle)
##### 2.2.5 Internal Audit Schedule

#### 2.3 Saudi Local Regulations & Data Sovereignty
##### 2.3.1 Personal Data Protection Law (PDPL)
###### 2.3.1.1 Data Subject Rights (Access, Rectification, Erasure)
###### 2.3.1.2 Consent Management Framework
###### 2.3.1.3 Data Processing Agreements (DPA)
###### 2.3.1.4 Cross-Border Data Transfer Restrictions
##### 2.3.2 Saudi Real Estate Authority (RERA) Compliance
###### 2.3.2.1 "Ejar" Platform Integration Requirements
###### 2.3.2.2 Contract Registration Standards
###### 2.3.2.3 Property Listing Regulations
##### 2.3.3 Saudi Arabian Monetary Authority (SAMA) - Financial Regulations
###### 2.3.3.1 Payment Gateway Compliance
###### 2.3.3.2 Anti-Money Laundering (AML) Controls
###### 2.3.3.3 Financial Audit Trail Requirements
##### 2.3.4 Cloud & Data Center Localization
###### 2.3.4.1 National Data Storage Requirements
###### 2.3.4.2 Approved Cloud Service Providers (CSP)
###### 2.3.4.3 Data Residency Validation

#### 2.4 Legal Framework for Platform Operations
##### 2.4.1 Terms of Service (ToS) for Office Subscriptions
##### 2.4.2 Privacy Policy & Cookie Consent
##### 2.4.3 Service Level Agreements (SLAs)
###### 2.4.3.1 Uptime Guarantees (99.9%)
###### 2.4.3.2 Support Response Times
###### 2.4.3.3 Data Backup & Recovery Commitments
##### 2.4.4 Intellectual Property Rights
##### 2.4.5 Dispute Resolution Mechanisms

---

## **PART III: OPERATIONAL VIEW**

### 3. Business Operations & Process Architecture
#### 3.1 Multi-Tenancy Architecture & Office Management
##### 3.1.1 Tenant Isolation Strategy
###### 3.1.1.1 Database-Level Isolation (`officeId` Scoping)
###### 3.1.1.2 Application-Level Data Segregation
###### 3.1.1.3 File Storage Isolation (S3 Bucket Policies)
###### 3.1.1.4 Audit Logging per Tenant
##### 3.1.2 Office Onboarding Workflow
###### 3.1.2.1 Self-Service Registration Process
###### 3.1.2.2 Account Verification & Approval
###### 3.1.2.3 Initial Configuration Wizard
###### 3.1.2.4 Sample Data Provisioning
##### 3.1.3 Subscription Management
###### 3.1.3.1 Plan Selection & Feature Gating
###### 3.1.3.2 User Limit Enforcement (Per Office)
####### 3.1.3.2.1 Automatic User Count Validation
####### 3.1.3.2.2 Admin Override Mechanism
####### 3.1.3.2.3 Upgrade Prompts & Notifications
###### 3.1.3.3 Billing Cycle Management
###### 3.1.3.4 Trial Period & Grace Period Handling
##### 3.1.4 Office Deactivation & Data Retention
###### 3.1.4.1 Soft Delete vs. Hard Delete Policies
###### 3.1.4.2 Data Export Options for Terminated Accounts
###### 3.1.4.3 Legal Hold Procedures

#### 3.2 User Management & Role-Based Access Control (RBAC)
##### 3.2.1 Role Hierarchy & Permission Model
###### 3.2.1.1 System Administrator (Super Admin)
####### 3.2.1.1.1 Full System Access (All Tenants)
####### 3.2.1.1.2 Office Management Capabilities
####### 3.2.1.1.3 System Configuration & Monitoring
####### 3.2.1.1.4 Impersonation Rights (Audit Mode)
###### 3.2.1.2 Office Owner (Tenant Admin)
####### 3.2.1.2.1 Full Access Within Office Scope
####### 3.2.1.2.2 Employee Management (Add/Edit/Deactivate)
####### 3.2.1.2.3 Permission Matrix Configuration
####### 3.2.1.2.4 Financial & Analytics Access
###### 3.2.1.3 Office Manager
####### 3.2.1.3.1 Property & Customer Management
####### 3.2.1.3.2 Appointment Scheduling
####### 3.2.1.3.3 Limited Financial View (No Edit)
###### 3.2.1.4 Sales Agent
####### 3.2.1.4.1 Property Listing & Updates
####### 3.2.1.4.2 Customer Interactions
####### 3.2.1.4.3 Appointment Booking
####### 3.2.1.4.4 Commission Tracking (Own Records)
###### 3.2.1.5 Accountant
####### 3.2.1.5.1 Full Financial Module Access
####### 3.2.1.5.2 Invoice Generation & Payment Tracking
####### 3.2.1.5.3 Expense Management
####### 3.2.1.5.4 Financial Reports & Auditing
###### 3.2.1.6 Viewer (Read-Only)
####### 3.2.1.6.1 Dashboard & Reports Access
####### 3.2.1.6.2 No Edit/Delete Permissions
###### 3.2.1.7 Custom Roles (Configurable by Office Owner)
####### 3.2.1.7.1 Granular Permission Matrix (Row/Column Level)
####### 3.2.1.7.2 Module-Level Access Control
####### 3.2.1.7.3 Feature-Level Toggles
##### 3.2.2 Permission Matrix Design
###### 3.2.2.1 Resource-Based Permissions (Properties, Customers, Contracts)
###### 3.2.2.2 Action-Based Permissions (Create, Read, Update, Delete, Export)
###### 3.2.2.3 Field-Level Permissions (Hide Sensitive Data)
###### 3.2.2.4 Time-Based Access (Temporary Permissions)
##### 3.2.3 Employee Lifecycle Management
###### 3.2.3.1 Employee Invitation & Activation
####### 3.2.3.1.1 Email/Phone Verification
####### 3.2.3.1.2 Password Setup
####### 3.2.3.1.3 Initial Training Module Access
###### 3.2.3.2 Employee Profile Management
####### 3.2.3.2.1 Personal Information
####### 3.2.3.2.2 Job Title & Department
####### 3.2.3.2.3 Commission Structure
###### 3.2.3.3 Permission Assignment & Modification
###### 3.2.3.4 Employee Deactivation & Offboarding
####### 3.2.3.4.1 Access Revocation Procedures
####### 3.2.3.4.2 Data Handover Protocols
####### 3.2.3.4.3 Exit Audit Logs

#### 3.3 Property Management Workflows
##### 3.3.1 Property Listing Lifecycle
###### 3.3.1.1 Property Creation & Metadata Capture
###### 3.3.1.2 Image Upload & Management
####### 3.3.1.2.1 **ROOT CAUSE FIX (Note 4):** File Upload Architecture
####### 3.3.1.2.2 Upload Endpoint Implementation (`/api/properties/upload`)
####### 3.3.1.2.3 Image Optimization & CDN Integration
####### 3.3.1.2.4 Storage Quotas per Subscription Tier
###### 3.3.1.3 Property Status Management (Available, Rented, Sold)
###### 3.3.1.4 Property Archival & Reactivation
##### 3.3.2 Property Search & Filtering
##### 3.3.3 Property Import/Export
###### 3.3.3.1 **ROOT CAUSE FIX (Note 5 & 6):** Secure Export with Refresh Token Integration
####### 3.3.3.1.1 Token Validation in Export Endpoints
####### 3.3.3.1.2 Field-Level Export Permissions
###### 3.3.3.2 **ROOT CAUSE FIX (Note 6):** Import Validation & Column Matching
####### 3.3.3.2.1 Excel/CSV Parser Configuration
####### 3.3.3.2.2 Dynamic Column Mapping (Levenshtein Algorithm)
####### 3.3.3.2.3 Empty Value Handling in Select Components
####### 3.3.3.2.4 Bulk Import Error Reporting

#### 3.4 Customer Relationship Management (CRM)
##### 3.4.1 Customer Profile Management
##### 3.4.2 Lead Tracking & Conversion Funnel
##### 3.4.3 **ROOT CAUSE FIX (Note 9):** Customer API Query Parameter Validation
###### 3.4.3.1 DTO Validation Rules (Remove Invalid Parameters)
###### 3.4.3.2 Frontend-Backend Contract Alignment
##### 3.4.4 Customer Segmentation & Tagging

#### 3.5 Appointment & Scheduling System
##### 3.5.1 **ROOT CAUSE FIX (Note 10 & 11):** Appointment Permission & Authentication Fix
###### 3.5.1.1 Role-Based Permission Assignment for Appointments
###### 3.5.1.2 JWT Validation in Appointment Endpoints
###### 3.5.1.3 Guard Implementation Review (`@Roles()`, `@UseGuards(JwtAuthGuard)`)
##### 3.5.2 Calendar Integration (Google Calendar, Outlook)
##### 3.5.3 Appointment Reminders (Email, WhatsApp)
##### 3.5.4 No-Show Tracking & Follow-Up

#### 3.6 Contract Management System
##### 3.6.1 Contract Template Library
##### 3.6.2 Digital Signature Integration
##### 3.6.3 Contract Lifecycle (Draft → Signed → Active → Expired)
##### 3.6.4 Ejar Platform Integration
###### 3.6.4.1 Automated Contract Registration
###### 3.6.4.2 Compliance Validation
###### 3.6.4.3 Renewal Notifications

#### 3.7 Financial Management & Accounting
##### 3.7.1 Revenue Tracking (Rent Collection, Sales)
##### 3.7.2 Expense Management
##### 3.7.3 Invoice Generation & PDF Export
##### 3.7.4 Commission Calculation & Disbursement
##### 3.7.5 Financial Reporting
###### 3.7.5.1 Profit & Loss Statements
###### 3.7.5.2 Cash Flow Analysis
###### 3.7.5.3 Tax Compliance Reports (VAT, Zakat)
##### 3.7.6 Audit Trail for Financial Transactions

#### 3.8 Notification & Alert System
##### 3.8.1 **ROOT CAUSE FIX (Note 12):** Notification Dismissal & Persistence
###### 3.8.1.1 Manual Dismiss Button Implementation
###### 3.8.1.2 User Preferences for Auto-Dismiss Duration
###### 3.8.1.3 Notification History & Archive
##### 3.8.2 **ROOT CAUSE FIX (Note 16):** Notification Center Implementation
###### 3.8.2.1 Top Bar Notification Icon Integration
###### 3.8.2.2 Real-Time Notification Delivery (WebSocket/SSE)
###### 3.8.2.3 Notification Preferences Panel
####### 3.8.2.3.1 In-App Notifications Toggle
####### 3.8.2.3.2 Email Notifications Toggle
####### 3.8.2.3.3 WhatsApp Notifications Toggle
####### 3.8.2.3.4 SMS Notifications (Future)
##### 3.8.3 WhatsApp Integration Architecture
###### 3.8.3.1 **ROOT CAUSE FIX (Note 16 & 19):** WhatsApp Business API Setup Guide
####### 3.8.3.1.1 Account Registration & Verification
####### 3.8.3.1.2 Message Template Approval Process
####### 3.8.3.1.3 Webhook Configuration for Inbound Messages
####### 3.8.3.1.4 Rate Limiting & Quota Management
###### 3.8.3.2 Use Cases
####### 3.8.3.2.1 Two-Factor Authentication (2FA)
####### 3.8.3.2.2 Appointment Reminders
####### 3.8.3.2.3 Payment Due Notifications
####### 3.8.3.2.4 Property Alert Subscriptions

---

## **PART IV: TECHNICAL VIEW**

### 4. System Architecture & Design
#### 4.1 High-Level Architecture
##### 4.1.1 Architecture Style: Modular Monolith (Transition to Microservices Ready)
##### 4.1.2 Technology Stack
###### 4.1.2.1 Backend: NestJS (Node.js/TypeScript)
###### 4.1.2.2 Frontend: Next.js 14 (React, TypeScript)
###### 4.1.2.3 Database: PostgreSQL (Supabase)
###### 4.1.2.4 ORM: TypeORM
###### 4.1.2.5 API Documentation: Swagger/OpenAPI
###### 4.1.2.6 State Management: Zustand
###### 4.1.2.7 UI Components: Tailwind CSS, shadcn/ui
##### 4.1.3 Deployment Architecture
###### 4.1.3.1 Infrastructure: AWS (Primary), DigitalOcean (Dev/Staging)
###### 4.1.3.2 Containerization: Docker
###### 4.1.3.3 Orchestration: Docker Compose (Development), ECS (Production)
###### 4.1.3.4 CI/CD Pipeline: GitHub Actions
##### 4.1.4 Network Architecture
###### 4.1.4.1 API Gateway (Kong/AWS API Gateway)
###### 4.1.4.2 Load Balancing (Application Load Balancer)
###### 4.1.4.3 CDN (CloudFront/Cloudflare)
###### 4.1.4.4 VPC & Security Groups

#### 4.2 Authentication & Authorization Architecture
##### 4.2.1 **ROOT CAUSE FIX (Note 3):** JWT & Refresh Token Implementation
###### 4.2.1.1 Authentication Flow
####### 4.2.1.1.1 Login: Username/Phone + Password → Access Token (15min) + Refresh Token (7 days, HttpOnly Cookie)
####### 4.2.1.1.2 Token Refresh: Automatic refresh before access token expiry
####### 4.2.1.1.3 Silent Refresh Strategy (Frontend)
######## 4.2.1.1.3.1 Axios Interceptors for 401 Responses
######## 4.2.1.1.3.2 Token Refresh API Call (`POST /api/auth/refresh`)
######## 4.2.1.1.3.3 Retry Original Request with New Token
######## 4.2.1.1.3.4 Logout on Refresh Failure
####### 4.2.1.1.4 Logout: Invalidate refresh token, clear cookies
###### 4.2.1.2 Token Storage Security
####### 4.2.1.2.1 Access Token: Memory-only (Zustand store, not localStorage)
####### 4.2.1.2.2 Refresh Token: HttpOnly, Secure, SameSite=Strict Cookie
####### 4.2.1.2.3 Token Rotation on Refresh
####### 4.2.1.2.4 Blacklist/Revocation Mechanism (Redis)
###### 4.2.1.3 Session Management
####### 4.2.1.3.1 Concurrent Session Handling (Max 3 devices)
####### 4.2.1.3.2 Device Tracking & Management
####### 4.2.1.3.3 Forced Logout (Admin Override)
##### 4.2.2 **ROOT CAUSE FIX (Note 19):** Two-Factor Authentication (2FA) with WhatsApp
###### 4.2.2.1 Opt-In/Opt-Out Mechanism
###### 4.2.2.2 OTP Generation & Delivery via WhatsApp
###### 4.2.2.3 OTP Validation & Expiry (5 minutes)
###### 4.2.2.4 Backup Codes for Account Recovery
###### 4.2.2.5 Setup Guide for WhatsApp Business API Integration
##### 4.2.3 Password Management
###### 4.2.3.1 Hashing: Bcrypt (Cost Factor: 12)
###### 4.2.3.2 Password Policy (Minimum 8 chars, Complexity Requirements)
###### 4.2.3.3 Password Reset Flow (Email/SMS OTP)
###### 4.2.3.4 Password History (Prevent Reuse)
##### 4.2.4 Role-Based Access Control (RBAC) Implementation
###### 4.2.4.1 Backend Enforcement
####### 4.2.4.1.1 `@Roles()` Decorator
####### 4.2.4.1.2 `RolesGuard` Implementation
####### 4.2.4.1.3 Permission Validation in Service Layer
###### 4.2.4.2 Frontend Enforcement
####### 4.2.4.2.1 Route Protection (Next.js Middleware)
####### 4.2.4.2.2 Conditional UI Rendering (usePermissions Hook)
####### 4.2.4.2.3 API Call Gating

#### 4.3 Database Architecture & Design
##### 4.3.1 Schema Design Principles
###### 4.3.1.1 Multi-Tenancy via `officeId` Foreign Key
###### 4.3.1.2 Soft Deletes (`deletedAt` Timestamp)
###### 4.3.1.3 Audit Fields (createdAt, updatedAt, createdBy, updatedBy)
##### 4.3.2 Core Entities & Relationships
###### 4.3.2.1 User Permissions (`user_permissions`)
###### 4.3.2.2 Offices (`offices`)
###### 4.3.2.3 Properties (`properties`)
###### 4.3.2.4 Customers (`customers`)
###### 4.3.2.5 Contracts (`contracts`)
###### 4.3.2.6 Appointments (`appointments`)
###### 4.3.2.7 Financial Transactions (`transactions`)
###### 4.3.2.8 Audit Logs (`audit_logs`)
##### 4.3.3 Indexing Strategy
###### 4.3.3.1 Primary Indexes (ID columns)
###### 4.3.3.2 Foreign Key Indexes (officeId, userId)
###### 4.3.3.3 Composite Indexes (officeId + status, officeId + createdAt)
###### 4.3.3.4 Full-Text Search Indexes (Property descriptions, Customer notes)
##### 4.3.4 Database Security
###### 4.3.4.1 Row-Level Security (RLS) Policies in Supabase
###### 4.3.4.2 Parameterized Queries (SQL Injection Prevention)
###### 4.3.4.3 Encryption at Rest (AWS RDS/Supabase Default)
###### 4.3.4.4 Encryption in Transit (TLS 1.3)
##### 4.3.5 Backup & Recovery
###### 4.3.5.1 Automated Daily Backups (Supabase/RDS)
###### 4.3.5.2 Point-in-Time Recovery (PITR)
###### 4.3.5.3 Backup Retention Policy (30 days)
###### 4.3.5.4 Disaster Recovery Testing Schedule

#### 4.4 API Design & Standards
##### 4.4.1 RESTful API Principles
###### 4.4.1.1 Resource Naming Conventions
###### 4.4.1.2 HTTP Method Semantics (GET, POST, PUT, PATCH, DELETE)
###### 4.4.1.3 Status Code Standards (200, 201, 400, 401, 403, 404, 500)
###### 4.4.1.4 Pagination, Sorting, Filtering Standards
##### 4.4.2 API Versioning Strategy
###### 4.4.2.1 URI Versioning (`/api/v1/`, `/api/v2/`)
###### 4.4.2.2 Backward Compatibility Policy
###### 4.4.2.3 Deprecation Timeline (6 months notice)
##### 4.4.3 Request/Response Standards
###### 4.4.3.1 JSON Schema Validation
###### 4.4.3.2 Error Response Format
####### 4.4.3.2.1 Standardized Error Codes
####### 4.4.3.2.2 Arabic & English Error Messages
####### 4.4.3.2.3 Detailed Validation Errors
###### 4.4.3.3 Response Envelope Structure
##### 4.4.4 API Documentation
###### 4.4.4.1 Swagger UI Auto-Generation
###### 4.4.4.2 Endpoint Descriptions & Examples
###### 4.4.4.3 Authentication Instructions
###### 4.4.4.4 Postman Collection Export

#### 4.5 Real-Time Analytics & Business Intelligence Engine
##### 4.5.1 **ROOT CAUSE FIX (Note 1):** Real Data Integration in Dashboard
###### 4.5.1.1 Replace Mock Data with Live API Calls
####### 4.5.1.1.1 `analyticsApi.getDashboard()` Implementation
####### 4.5.1.1.2 Database Aggregation Queries (PostgreSQL)
####### 4.5.1.1.3 Caching Strategy for Dashboard Metrics (Redis, 5-minute TTL)
###### 4.5.1.2 Chart Data Transformation Layer
####### 4.5.1.2.1 Backend Data Aggregation Services
####### 4.5.1.2.2 Frontend Data Mapping for Recharts
##### 4.5.2 **ROOT CAUSE FIX (Note 2 & 7):** Advanced Analytics & Dynamic Filters
###### 4.5.2.1 Multi-Dimensional Analysis Framework
####### 4.5.2.1.1 Property Analytics (By Type, Location, Price Range, Status)
####### 4.5.2.1.2 Financial Analytics (Revenue, Expenses, Profit Margins, ROI)
####### 4.5.2.1.3 Customer Analytics (Lead Sources, Conversion Rates, Retention)
####### 4.5.2.1.4 Agent Performance Analytics (Deal Volume, Commission, Response Time)
###### 4.5.2.2 Dynamic Filtering & Grouping
####### 4.5.2.2.1 Frontend Filter Builder UI
####### 4.5.2.2.2 Backend Query Builder (TypeORM QueryBuilder)
####### 4.5.2.2.3 Custom Field Support (Extensible Metadata)
###### 4.5.2.3 Market Intelligence Analytics (Note 7 - Comprehensive Data Points)
####### 4.5.2.3.1 Historical Rental Trends & Vacancy Rates
####### 4.5.2.3.2 Maintenance Cost Analysis
####### 4.5.2.3.3 Tenant Retention Metrics
####### 4.5.2.3.4 Competitive Market Analysis (Average Prices, Amenities)
####### 4.5.2.3.5 Neighborhood Scoring (Walkability, Safety, Services)
####### 4.5.2.3.6 Demographic & Population Growth Trends
####### 4.5.2.3.7 Future Development Impact Analysis
####### 4.5.2.3.8 Sentiment Analysis (Social Media, Reviews)
####### 4.5.2.3.9 Predictive ROI Modeling (AI/ML Integration)
##### 4.5.3 **ROOT CAUSE FIX (Note 14):** Reports Module Implementation
###### 4.5.3.1 Report Types Catalog
####### 4.5.3.1.1 Property Performance Reports
####### 4.5.3.1.2 Financial Audit Reports
####### 4.5.3.1.3 Sales Pipeline Reports
####### 4.5.3.1.4 Custom Report Builder
###### 4.5.3.2 Report Generation Engine
####### 4.5.3.2.1 Scheduled Reports (Daily, Weekly, Monthly)
####### 4.5.3.2.2 On-Demand Report Generation
####### 4.5.3.2.3 PDF Export with Branding
####### 4.5.3.2.4 Excel Export with Formulas
###### 4.5.3.3 Report Distribution
####### 4.5.3.3.1 Email Delivery
####### 4.5.3.3.2 In-App Report Archive
####### 4.5.3.3.3 WhatsApp Report Summaries
##### 4.5.4 Data Warehouse & ETL Pipeline (Phase 2)
###### 4.5.4.1 OLTP vs. OLAP Separation
###### 4.5.4.2 Data Lake for Historical Analysis
###### 4.5.4.3 ETL Jobs (Apache Airflow/AWS Glue)
###### 4.5.4.4 Data Quality Monitoring

#### 4.6 Performance Optimization Architecture
##### 4.6.1 Frontend Performance
###### 4.6.1.1 Next.js Optimization Techniques
####### 4.6.1.1.1 Server-Side Rendering (SSR) for SEO-Critical Pages
####### 4.6.1.1.2 Static Site Generation (SSG) for Content Pages
####### 4.6.1.1.3 Incremental Static Regeneration (ISR)
####### 4.6.1.1.4 Image Optimization (next/image)
###### 4.6.1.2 Code Splitting & Lazy Loading
###### 4.6.1.3 Bundle Size Optimization (Webpack Analysis)
###### 4.6.1.4 Browser Caching Strategy
##### 4.6.2 Backend Performance
###### 4.6.2.1 Database Query Optimization
####### 4.6.2.1.1 Query Plan Analysis (EXPLAIN)
####### 4.6.2.1.2 N+1 Query Prevention (Eager Loading)
####### 4.6.2.1.3 Index Coverage Analysis
###### 4.6.2.2 Caching Strategy
####### 4.6.2.2.1 In-Memory Caching (Redis)
######## 4.6.2.2.1.1 Cache Key Design (Tenant-Scoped)
######## 4.6.2.2.1.2 TTL Configuration by Data Type
######## 4.6.2.2.1.3 Cache Invalidation Strategies
####### 4.6.2.2.2 HTTP Caching Headers (ETag, Cache-Control)
####### 4.6.2.2.3 CDN Caching for Static Assets
###### 4.6.2.3 Connection Pooling (Database, Redis)
###### 4.6.2.4 Asynchronous Processing (Message Queues)
####### 4.6.2.4.1 BullMQ for Background Jobs
####### 4.6.2.4.2 Use Cases: Email Sending, Report Generation, Data Import
##### 4.6.3 API Rate Limiting & Throttling
###### 4.6.3.1 Per-User Rate Limits
###### 4.6.3.2 Per-Office Rate Limits
###### 4.6.3.3 Global Rate Limits (DDoS Protection)
###### 4.6.3.4 Rate Limit Headers (X-RateLimit-*)
##### 4.6.4 Monitoring & Performance Metrics
###### 4.6.4.1 Application Performance Monitoring (APM): New Relic/DataDog
###### 4.6.4.2 Real User Monitoring (RUM)
###### 4.6.4.3 Synthetic Monitoring (Uptime Checks)
###### 4.6.4.4 Performance Budgets & Alerts

#### 4.7 Security Architecture
##### 4.7.1 Application Security (OWASP Top 10 Mitigation)
###### 4.7.1.1 SQL Injection Prevention (Parameterized Queries)
###### 4.7.1.2 Cross-Site Scripting (XSS) Prevention
####### 4.7.1.2.1 Input Sanitization (DOMPurify)
####### 4.7.1.2.2 Output Encoding
####### 4.7.1.2.3 Content Security Policy (CSP) Headers
###### 4.7.1.3 Cross-Site Request Forgery (CSRF) Protection
####### 4.7.1.3.1 CSRF Tokens for State-Changing Operations
####### 4.7.1.3.2 SameSite Cookie Attribute
###### 4.7.1.4 Server-Side Request Forgery (SSRF) Prevention
###### 4.7.1.5 Insecure Deserialization Prevention
###### 4.7.1.6 Security Misconfiguration Hardening
####### 4.7.1.6.1 Disable Directory Listing
####### 4.7.1.6.2 Remove Default Accounts
####### 4.7.1.6.3 Error Message Sanitization (No Stack Traces in Production)
##### 4.7.2 Network Security
###### 4.7.2.1 TLS/SSL Configuration (TLS 1.3, Strong Cipher Suites)
###### 4.7.2.2 HTTP Security Headers
####### 4.7.2.2.1 Strict-Transport-Security (HSTS)
####### 4.7.2.2.2 X-Content-Type-Options
####### 4.7.2.2.3 X-Frame-Options (Clickjacking Prevention)
####### 4.7.2.2.4 Referrer-Policy
###### 4.7.2.3 DDoS Protection (Cloudflare/AWS Shield)
###### 4.7.2.4 Web Application Firewall (WAF)
##### 4.7.3 Data Security
###### 4.7.3.1 Encryption at Rest (Database, File Storage)
###### 4.7.3.2 Encryption in Transit (TLS)
###### 4.7.3.3 Sensitive Data Masking (Logs, UI)
###### 4.7.3.4 Secure Key Management (AWS KMS, Vault)
##### 4.7.4 API Security
###### 4.7.4.1 JWT Validation & Signature Verification
###### 4.7.4.2 Input Validation (DTO Validation Pipes)
###### 4.7.4.3 Output Sanitization
###### 4.7.4.4 API Gateway Security Policies
##### 4.7.5 Security Monitoring & Incident Response
###### 4.7.5.1 Security Information and Event Management (SIEM)
###### 4.7.5.2 Intrusion Detection System (IDS)
###### 4.7.5.3 Vulnerability Scanning (Automated, Quarterly)
###### 4.7.5.4 Penetration Testing Schedule (Annual)
###### 4.7.5.5 Incident Response Plan & Runbook

#### 4.8 File Storage & Media Management
##### 4.8.1 Storage Backend (AWS S3 / DigitalOcean Spaces)
##### 4.8.2 Upload Architecture
###### 4.8.2.1 Direct Upload to S3 (Presigned URLs)
###### 4.8.2.2 Server-Side Upload via API
###### 4.8.2.3 Chunked Upload for Large Files
##### 4.8.3 Image Processing Pipeline
###### 4.8.3.1 Automatic Resizing & Thumbnail Generation
###### 4.8.3.2 Format Conversion (WebP)
###### 4.8.3.3 Watermarking (Optional)
###### 4.8.3.4 EXIF Data Stripping (Privacy)
##### 4.8.4 CDN Integration
###### 4.8.4.1 CloudFront/Cloudflare for Global Delivery
###### 4.8.4.2 Cache Control & Invalidation
##### 4.8.5 File Security
###### 4.8.5.1 Access Control (Signed URLs, Time-Limited)
###### 4.8.5.2 Virus Scanning (ClamAV Integration)
###### 4.8.5.3 File Type Validation
###### 4.8.5.4 Storage Quotas & Enforcement

#### 4.9 Frontend Architecture
##### 4.9.1 Project Structure & Conventions
###### 4.9.1.1 Folder Structure (App Router)
###### 4.9.1.2 Component Naming Conventions
###### 4.9.1.3 State Management Patterns (Zustand)
##### 4.9.2 UI/UX Standards
###### 4.9.2.1 Design System (Tailwind CSS, shadcn/ui)
###### 4.9.2.2 **ROOT CAUSE FIX (Note 15 & 20):** Theme & Appearance Settings
####### 4.9.2.2.1 System-Wide Theme Implementation
######## 4.9.2.2.1.1 Light/Dark Mode Toggle
######## 4.9.2.2.1.2 Color Palette Customization
######## 4.9.2.2.1.3 Font Family & Size Selection
######## 4.9.2.2.1.4 Theme Persistence (localStorage)
####### 4.9.2.2.2 **ROOT CAUSE FIX (Note 20):** Responsive Settings Navigation
######## 4.9.2.2.2.1 Mobile-First Tab Design
######## 4.9.2.2.2.2 Horizontal Scrollable Tabs
######## 4.9.2.2.2.3 Dropdown Menu for Small Screens
###### 4.9.2.3 Accessibility (WCAG 2.1 Level AA)
####### 4.9.2.3.1 Keyboard Navigation
####### 4.9.2.3.2 Screen Reader Compatibility (ARIA Labels)
####### 4.9.2.3.3 Color Contrast Ratios
####### 4.9.2.3.4 Focus Indicators
###### 4.9.2.4 RTL (Right-to-Left) Support for Arabic
####### 4.9.2.4.1 Layout Mirroring
####### 4.9.2.4.2 Text Direction Handling
####### 4.9.2.4.3 Icon Directionality
###### 4.9.2.5 Responsive Design (Mobile, Tablet, Desktop)
####### 4.9.2.5.1 Breakpoint Strategy (Tailwind Defaults)
####### 4.9.2.5.2 Progressive Enhancement
##### 4.9.3 Form Management
###### 4.9.3.1 React Hook Form Integration
###### 4.9.3.2 Zod Schema Validation
###### 4.9.3.3 Error Display Patterns
###### 4.9.3.4 Multi-Step Form Handling
##### 4.9.4 Data Visualization
###### 4.9.4.1 Recharts Configuration & Best Practices
###### 4.9.4.2 Chart Types & Use Cases (Line, Bar, Pie, Area)
###### 4.9.4.3 Interactive Legends & Tooltips
###### 4.9.4.4 Responsive Chart Sizing
##### 4.9.5 **ROOT CAUSE FIX (Note 13 & 18):** Missing Pages Implementation
###### 4.9.5.1 Favorites Module (`/dashboard/favorites`)
####### 4.9.5.1.1 User-Specific Property Bookmarks
####### 4.9.5.1.2 Quick Access Widget
###### 4.9.5.2 User Profile Page (`/dashboard/profile`)
####### 4.9.5.2.1 Personal Information Editing
####### 4.9.5.2.2 Password Change
####### 4.9.5.2.3 2FA Setup
####### 4.9.5.2.4 Session Management (Active Devices)

#### 4.10 Client Self-Service Portal Architecture
##### 4.10.1 **ROOT CAUSE FIX (Note 22):** Client Portal Design & Isolation
###### 4.10.1.1 Separate Domain/Subdomain (client.domain.com)
###### 4.10.1.2 Dedicated Authentication Flow (Client Credentials)
###### 4.10.1.3 Read-Only Access to Assigned Properties & Contracts
###### 4.10.1.4 Custom Branding per Office (White-Label)
##### 4.10.2 Client Portal Features
###### 4.10.2.1 Rent Payment Portal (Integration with Payment Gateways)
###### 4.10.2.2 Maintenance Request Submission
###### 4.10.2.3 Contract Documents Access
###### 4.10.2.4 Property Search (Public Listings)
###### 4.10.2.5 Appointment Booking
###### 4.10.2.6 Communication Center (Messaging with Office)
##### 4.10.3 Client Notification Preferences
##### 4.10.4 Multi-Language Support (Arabic, English)

#### 4.11 Integration Architecture
##### 4.11.1 **ROOT CAUSE FIX (Note 21):** Settings Visibility & Access Control
###### 4.11.1.1 Role-Based Settings Menu Rendering
####### 4.11.1.1.1 System Admin: Full Access (Integrations, Security, Office Management)
####### 4.11.1.1.2 Office Owner: Limited Access (Appearance, Notifications, Employees)
####### 4.11.1.1.3 Employees: Minimal Access (Personal Settings Only)
###### 4.11.1.2 System Admin Control Panel
####### 4.11.1.2.1 Office Management Dashboard
####### 4.11.1.2.2 Subscription & User Limit Management
####### 4.11.1.2.3 System-Wide Configuration (Email Templates, Feature Flags)
####### 4.11.1.2.4 Impersonation Mode (Audit & Support)
##### 4.11.2 Third-Party API Integrations
###### 4.11.2.1 Payment Gateways (HyperPay, Moyasar, Tap Payments)
###### 4.11.2.2 SMS Gateways (Twilio, local providers)
###### 4.11.2.3 Email Service (SendGrid, AWS SES)
###### 4.11.2.4 WhatsApp Business API
###### 4.11.2.5 Google Maps API (Property Location)
###### 4.11.2.6 Ejar Platform API
##### 4.11.3 Webhook System
###### 4.11.3.1 Outbound Webhooks (Event Notifications)
###### 4.11.3.2 Inbound Webhooks (Payment Confirmations, External Events)
###### 4.11.3.3 Webhook Security (Signature Verification)
###### 4.11.3.4 Retry Mechanism & Dead Letter Queue
##### 4.11.4 API Marketplace (Phase 3)
###### 4.11.4.1 Developer Portal
###### 4.11.4.2 API Key Management
###### 4.11.4.3 Rate Limiting per API Consumer
###### 4.11.4.4 Revenue Sharing Model

---

## **PART V: PROJECT MANAGEMENT VIEW**

### 5. Implementation Roadmap & Governance
#### 5.1 Project Charter & Objectives
##### 5.1.1 Project Vision & Mission Statement
##### 5.1.2 Success Criteria & KPIs
##### 5.1.3 Stakeholder Analysis
##### 5.1.4 Project Governance Structure

#### 5.2 Phase 1: Foundation Sprint (Weeks 1-8)
##### 5.2.1 Sprint 1: Critical Fixes & Stabilization (Weeks 1-2)
###### 5.2.1.1 **Priority 1 - Authentication & Token Management**
####### 5.2.1.1.1 Implement Silent Token Refresh (Note 3)
####### 5.2.1.1.2 Fix Export Endpoint Authentication (Note 5)
####### 5.2.1.1.3 Fix Appointment Endpoint Permissions (Note 10, 11)
###### 5.2.1.2 **Priority 2 - API Endpoint Fixes**
####### 5.2.1.2.1 Implement File Upload Endpoint (Note 4)
####### 5.2.1.2.2 Fix Customer API Query Validation (Note 9)
####### 5.2.1.2.3 Fix Import Empty Value Handling (Note 6)
###### 5.2.1.3 **Priority 3 - UI/UX Quick Fixes**
####### 5.2.1.3.1 Add Notification Dismiss Button (Note 12)
####### 5.2.1.3.2 Implement Missing Pages (Favorites, Profile) (Note 13, 18)
##### 5.2.2 Sprint 2: RBAC & Multi-Tenancy Enhancement (Weeks 3-4)
###### 5.2.2.1 Refine Role Hierarchy & Permission Matrix (Note 8)
###### 5.2.2.2 Implement Granular Column/Row-Level Permissions
###### 5.2.2.3 System Admin Control Panel Development
###### 5.2.2.4 Office Subscription Management System
##### 5.2.3 Sprint 3: Real Analytics Integration (Weeks 5-6)
###### 5.2.3.1 Replace Mock Data with Real API Calls (Note 1)
###### 5.2.3.2 Implement Advanced Filtering & Grouping (Note 2)
###### 5.2.3.3 Backend Aggregation Services Development
###### 5.2.3.4 Dashboard Performance Optimization (Caching)
##### 5.2.4 Sprint 4: Settings & Configuration UI (Weeks 7-8)
###### 5.2.4.1 Theme & Appearance System Implementation (Note 15)
###### 5.2.4.2 Notification Preferences Panel (Note 16)
###### 5.2.4.3 Employee Management UI (Note 17)
###### 5.2.4.4 Role-Based Settings Visibility (Note 21)
###### 5.2.4.5 Responsive Settings Navigation (Note 20)

#### 5.3 Phase 2: Advanced Features (Weeks 9-16)
##### 5.3.1 Sprint 5: Reports Module (Weeks 9-10)
###### 5.3.1.1 Report Builder UI Development (Note 14)
###### 5.3.1.2 Report Generation Engine (PDF/Excel)
###### 5.3.1.3 Scheduled Reports System
##### 5.3.2 Sprint 6: WhatsApp Integration (Weeks 11-12)
###### 5.3.2.1 WhatsApp Business API Setup (Note 16, 19)
###### 5.3.2.2 2FA Implementation (Note 19)
###### 5.3.2.3 Notification Delivery via WhatsApp
###### 5.3.2.4 Infrastructure Setup Guide Documentation
##### 5.3.3 Sprint 7: Client Portal (Weeks 13-14)
###### 5.3.3.1 Client Portal Frontend Development (Note 22)
###### 5.3.3.2 Client Authentication System
###### 5.3.3.3 White-Label Customization
###### 5.3.3.4 Payment Integration
##### 5.3.4 Sprint 8: Market Intelligence Analytics (Weeks 15-16)
###### 5.3.4.1 Implement Comprehensive Data Points (Note 7)
###### 5.3.4.2 External Data Source Integration (Market Trends)
###### 5.3.4.3 Predictive Analytics Foundation (ML Models)

#### 5.4 Quality Assurance & Testing Strategy
##### 5.4.1 Testing Pyramid
###### 5.4.1.1 Unit Testing (Jest, 80% Coverage Target)
###### 5.4.1.2 Integration Testing (API Endpoints)
###### 5.4.1.3 End-to-End Testing (Playwright/Cypress)
###### 5.4.1.4 Performance Testing (k6/JMeter)
###### 5.4.1.5 Security Testing (OWASP ZAP, Burp Suite)
##### 5.4.2 Test Environments
###### 5.4.2.1 Development (Local)
###### 5.4.2.2 Staging (Pre-Production Mirror)
###### 5.4.2.3 UAT (User Acceptance Testing)
###### 5.4.2.4 Production
##### 5.4.3 Continuous Testing Integration
###### 5.4.3.1 Automated Tests in CI/CD Pipeline
###### 5.4.3.2 Pre-Commit Hooks (Linting, Type Checking)
###### 5.4.3.3 Pull Request Validation
##### 5.4.4 Manual Testing Protocols
###### 5.4.4.1 Test Case Documentation
###### 5.4.4.2 Regression Testing Checklist
###### 5.4.4.3 Exploratory Testing Sessions
##### 5.4.5 Bug Tracking & Resolution Workflow
###### 5.4.5.1 Bug Severity Classification (Critical, High, Medium, Low)
###### 5.4.5.2 SLA for Bug Fixes (Critical: 24h, High: 3 days)
###### 5.4.5.3 Root Cause Analysis for Critical Bugs

#### 5.5 Deployment & Release Management
##### 5.5.1 Release Strategy
###### 5.5.1.1 Semantic Versioning (MAJOR.MINOR.PATCH)
###### 5.5.1.2 Release Cadence (Bi-Weekly for Minor, Monthly for Major)
###### 5.5.1.3 Hotfix Process for Critical Issues
##### 5.5.2 CI/CD Pipeline
###### 5.5.2.1 Build Automation (GitHub Actions)
###### 5.5.2.2 Automated Testing Gates
###### 5.5.2.3 Docker Image Building & Registry Push
###### 5.5.2.4 Deployment Automation (Staging → Production)
##### 5.5.3 Deployment Strategies
###### 5.5.3.1 Blue-Green Deployment
###### 5.5.3.2 Canary Releases (10% → 50% → 100%)
###### 5.5.3.3 Feature Flags for Progressive Rollout
###### 5.5.3.4 Rollback Procedures
##### 5.5.4 Database Migration Strategy
###### 5.5.4.1 Backward Compatible Migrations
###### 5.5.4.2 Migration Testing in Staging
###### 5.5.4.3 Zero-Downtime Migration Techniques
###### 5.5.4.4 Migration Rollback Plans
##### 5.5.5 Post-Deployment Validation
###### 5.5.5.1 Smoke Testing Checklist
###### 5.5.5.2 Monitoring Alerts Review
###### 5.5.5.3 Performance Metrics Comparison (Before/After)

#### 5.6 Risk Management & Mitigation
##### 5.6.1 Technical Risks
###### 5.6.1.1 Risk: Scalability Bottlenecks
####### 5.6.1.1.1 Mitigation: Horizontal Scaling Architecture, Load Testing
###### 5.6.1.2 Risk: Data Loss During Migration
####### 5.6.1.2.1 Mitigation: Comprehensive Backup Strategy, Migration Testing
###### 5.6.1.3 Risk: Third-Party API Downtime
####### 5.6.1.3.1 Mitigation: Circuit Breakers, Fallback Mechanisms, SLA Monitoring
###### 5.6.1.4 Risk: Security Breach
####### 5.6.1.4.1 Mitigation: Regular Security Audits, Penetration Testing, Incident Response Plan
##### 5.6.2 Operational Risks
###### 5.6.2.1 Risk: Key Personnel Turnover
####### 5.6.2.1.1 Mitigation: Documentation, Knowledge Transfer, Code Reviews
###### 5.6.2.2 Risk: Scope Creep
####### 5.6.2.2.1 Mitigation: Strict Change Control, Prioritization Framework
##### 5.6.3 Compliance Risks
###### 5.6.3.1 Risk: Non-Compliance with PDPL
####### 5.6.3.1.1 Mitigation: Legal Review, Compliance Audits, Data Protection Officer (DPO)
###### 5.6.3.2 Risk: ISO Certification Failure
####### 5.6.3.2.1 Mitigation: Pre-Assessment Audits, Gap Analysis, Remediation Plan
##### 5.6.4 Market Risks
###### 5.6.4.1 Risk: Competitive Pressure
####### 5.6.4.1.1 Mitigation: Continuous Innovation, Customer Feedback Loop
###### 5.6.4.2 Risk: Economic Downturn
####### 5.6.4.2.1 Mitigation: Diversified Revenue Streams, Cost Optimization

#### 5.7 Documentation Strategy
##### 5.7.1 Technical Documentation
###### 5.7.1.1 Architecture Decision Records (ADRs)
###### 5.7.1.2 API Documentation (Swagger/OpenAPI)
###### 5.7.1.3 Database Schema Documentation
###### 5.7.1.4 Deployment Runbooks
###### 5.7.1.5 Security Procedures & Incident Response Plans
##### 5.7.2 User Documentation
###### 5.7.2.1 User Manuals (Office Owners, Employees)
###### 5.7.2.2 Quick Start Guides
###### 5.7.2.3 Video Tutorials (Loom/YouTube)
###### 5.7.2.4 FAQ & Troubleshooting
##### 5.7.3 Operational Documentation
###### 5.7.3.1 System Administration Guide
###### 5.7.3.2 Monitoring & Alerting Setup
###### 5.7.3.3 Backup & Recovery Procedures
###### 5.7.3.4 Incident Response Playbooks
##### 5.7.4 Compliance Documentation
###### 5.7.4.1 ISO 27001 Policy Manual
###### 5.7.4.2 ISO 9001 Quality Manual
###### 5.7.4.3 Data Protection Impact Assessment (DPIA)
###### 5.7.4.4 Audit Reports & Certifications

#### 5.8 Change Management & Training
##### 5.8.1 Stakeholder Communication Plan
###### 5.8.1.1 Regular Status Updates (Weekly)
###### 5.8.1.2 Release Notes & Changelogs
###### 5.8.1.3 User Feedback Collection
##### 5.8.2 Training Program
###### 5.8.2.1 System Admin Training (2 days)
###### 5.8.2.2 Office Owner Training (1 day)
###### 5.8.2.3 Employee Onboarding (Self-Paced + Live Sessions)
###### 5.8.2.4 Client Portal User Guide
##### 5.8.3 Support Model
###### 5.8.3.1 Tiered Support (L1: Help Desk, L2: Engineering)
###### 5.8.3.2 Support Channels (In-App Chat, Email, Phone)
###### 5.8.3.3 SLA for Support Tickets (Response Times by Priority)
###### 5.8.3.4 Knowledge Base (Self-Service Articles)

#### 5.9 Metrics & Success Measurement
##### 5.9.1 Development Metrics
###### 5.9.1.1 Velocity (Story Points per Sprint)
###### 5.9.1.2 Code Quality (SonarQube Scores, Test Coverage)
###### 5.9.1.3 Deployment Frequency
###### 5.9.1.4 Mean Time to Recovery (MTTR)
##### 5.9.2 Business Metrics
###### 5.9.2.1 User Adoption Rate
###### 5.9.2.2 Customer Satisfaction (CSAT, NPS)
###### 5.9.2.3 Monthly Recurring Revenue (MRR) Growth
###### 5.9.2.4 Churn Rate
##### 5.9.3 Technical Metrics
###### 5.9.3.1 API Response Times (p50, p95, p99)
###### 5.9.3.2 Error Rates
###### 5.9.3.3 System Uptime (99.9% Target)
###### 5.9.3.4 Database Query Performance
##### 5.9.4 Security Metrics
###### 5.9.4.1 Security Incidents (Count, Severity)
###### 5.9.4.2 Vulnerability Patching Time
###### 5.9.4.3 Failed Login Attempts (Anomaly Detection)

---

## **APPENDICES**

### Appendix A: Glossary of Terms
### Appendix B: Technology Stack Justification
### Appendix C: Third-Party Service Evaluation Matrix
### Appendix D: ISO 27001 Controls Mapping
### Appendix E: ISO 9001 Process Map
### Appendix F: Saudi Regulatory Compliance Checklist
### Appendix G: Database Schema Diagrams (ERD)
### Appendix H: API Endpoint Catalog
### Appendix I: UI/UX Design Guidelines
### Appendix J: Security Hardening Checklist
### Appendix K: Performance Benchmarking Results
### Appendix L: Disaster Recovery Test Reports
### Appendix M: Training Materials & Resources
### Appendix N: Vendor Contracts & SLAs
### Appendix O: Change Request Log Template

---

**Document Revision History**
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 3.0 | 2025-11-19 | CIO/Architect | Initial Constitutional Blueprint - Master TOC |

---

**Approval Signatures**
- Chief Information Officer (CIO): _____________________ Date: _______
- Chief Technology Officer (CTO): _____________________ Date: _______
- Compliance Officer: _____________________ Date: _______
- Project Sponsor: _____________________ Date: _______

---

**End of Table of Contents**
