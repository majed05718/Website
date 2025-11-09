# Change Implementation Plan (CIP)

- **Generated**: 2025-11-09 19:56 UTC
- **Purpose**: Provide actionable, traceable steps for modifying or extending modules while preserving system integrity.

## Analytics

### Plan for `AnalyticsController.dashboard` (Get /analytics/dashboard)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/analytics/analytics.controller.ts` lines 16-19.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AnalyticsController.properties` (Get /analytics/properties)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/analytics/analytics.controller.ts` lines 22-25.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AnalyticsController.financials` (Get /analytics/financials)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/analytics/analytics.controller.ts` lines 29-32.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AnalyticsController.kpis` (Get /analytics/kpis)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/analytics/analytics.controller.ts` lines 36-39.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AnalyticsController.staffPerf` (Get /analytics/staff-performance)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/analytics/analytics.controller.ts` lines 43-46.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## App

---

## Appointments

### Plan for `AppointmentsController.findAll` (Get /appointments)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 23-27.
   - Identify DTOs involved: FilterAppointmentsDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.getStats` (Get /appointments/stats)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 31-35.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.getToday` (Get /appointments/today)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 53-57.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.getUpcoming` (Get /appointments/upcoming)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 62-66.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.findOne` (Get /appointments/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 70-74.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.create` (Post /appointments)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 79-85.
   - Identify DTOs involved: CreateAppointmentDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.update` (Patch /appointments/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 90-95.
   - Identify DTOs involved: UpdateAppointmentDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.remove` (Delete /appointments/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 100-104.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.updateStatus` (Patch /appointments/:id/status)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 109-115.
   - Identify DTOs involved: UpdateStatusDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.cancel` (Patch /appointments/:id/cancel)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 120-126.
   - Identify DTOs involved: CancelAppointmentDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.complete` (Patch /appointments/:id/complete)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 131-136.
   - Identify DTOs involved: CompleteAppointmentDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.sendReminder` (Post /appointments/:id/remind)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 141-145.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `AppointmentsController.checkAvailability` (Post /appointments/check-availability)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/appointments/appointments.controller.ts` lines 150-154.
   - Identify DTOs involved: CheckAvailabilityDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Components

---

## Customers

### Plan for `CustomersController.findAll` (Get /customers)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 25-29.
   - Identify DTOs involved: FilterCustomersDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.getStats` (Get /customers/stats)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 33-37.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.search` (Get /customers/search)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 42-46.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.exportExcel` (Get /customers/export)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 51-83.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.findOne` (Get /customers/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 87-91.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.create` (Post /customers)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 96-102.
   - Identify DTOs involved: CreateCustomerDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.update` (Patch /customers/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 107-112.
   - Identify DTOs involved: UpdateCustomerDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.remove` (Delete /customers/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 117-121.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.getNotes` (Get /customers/:id/notes)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 126-130.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.createNote` (Post /customers/:id/notes)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 135-141.
   - Identify DTOs involved: CreateCustomerNoteDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.removeNote` (Delete /customers/:id/notes/:noteId)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 161-165.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.getInteractions` (Get /customers/:id/interactions)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 170-174.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `CustomersController.linkProperty` (Post /customers/:id/properties)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/customers.controller.ts` lines 195-200.
   - Identify DTOs involved: LinkPropertyDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `ExcelController.getTemplates` (Get /customers/excel/templates)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/excel.controller.ts` lines 216-231.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `ExcelController.validateFile` (Post /customers/excel/validate-file)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/excel.controller.ts` lines 329-363.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `ExcelController.getImportStats` (Get /customers/excel/import-stats)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/customers/excel.controller.ts` lines 374-390.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Health

---

## Integrations

---

## Maintenance

### Plan for `MaintenanceController.list` (Get /maintenance)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 21-24.
   - Identify DTOs involved: FilterMaintenanceDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MaintenanceController.getOne` (Get /maintenance/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 27-30.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MaintenanceController.create` (Post /maintenance)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 34-40.
   - Identify DTOs involved: CreateMaintenanceDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MaintenanceController.createPublic` (Post /public/maintenance)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 43-48.
   - Identify DTOs involved: PublicCreateMaintenanceDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MaintenanceController.update` (Patch /maintenance/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 52-56.
   - Identify DTOs involved: UpdateMaintenanceDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MaintenanceController.complete` (Post /maintenance/:id/complete)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/maintenance/maintenance.controller.ts` lines 60-64.
   - Identify DTOs involved: CompleteMaintenanceDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Onboarding

### Plan for `OnboardingController.createOffice` (Post /onboarding/office)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/onboarding/onboarding.controller.ts` lines 11-13.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `OnboardingController.verify` (Get /onboarding/verify-code)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/onboarding/onboarding.controller.ts` lines 16-20.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `OnboardingController.complete` (Post /onboarding/complete)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/onboarding/onboarding.controller.ts` lines 23-25.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Payments

### Plan for `PaymentsController.list` (Get /payments)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/payments/payments.controller.ts` lines 18-21.
   - Identify DTOs involved: FilterPaymentsDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PaymentsController.byContract` (Get /contracts/:contractId/payments)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/payments/payments.controller.ts` lines 24-27.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PaymentsController.markPaid` (Patch /payments/:id/mark-paid)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/payments/payments.controller.ts` lines 31-35.
   - Identify DTOs involved: MarkPaidDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PaymentsController.overdue` (Get /payments/overdue)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/payments/payments.controller.ts` lines 38-41.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PaymentsController.sendReminder` (Post /payments/:id/send-reminder)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/payments/payments.controller.ts` lines 45-49.
   - Identify DTOs involved: SendReminderDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Properties

### Plan for `ExcelController.importExcel` (Post /properties/import)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/excel.controller.ts` lines 23-51.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `ExcelController.importConfirm` (Post /properties/import/confirm)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/excel.controller.ts` lines 55-69.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `ExcelController.exportExcel` (Get /properties/export)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/excel.controller.ts` lines 73-104.
   - Identify DTOs involved: FilterPropertiesDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MediaController.signedUrl` (Post /media/signed-url)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/media.controller.ts` lines 14-36.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MediaController.addImage` (Post /properties/:id/images)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/media.controller.ts` lines 39-45.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MediaController.setFeatured` (Patch /properties/:propertyId/images/:imageId)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/media.controller.ts` lines 48-51.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `MediaController.removeImage` (Delete /properties/:propertyId/images/:imageId)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/media.controller.ts` lines 54-57.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PropertiesController.list` (Get /properties)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/properties.controller.ts` lines 18-22.
   - Identify DTOs involved: FilterPropertiesDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PropertiesController.getOne` (Get /properties/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/properties.controller.ts` lines 25-29.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PropertiesController.create` (Post /properties)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/properties.controller.ts` lines 33-38.
   - Identify DTOs involved: CreatePropertyDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PropertiesController.update` (Patch /properties/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/properties.controller.ts` lines 42-46.
   - Identify DTOs involved: UpdatePropertyDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PropertiesController.softDelete` (Delete /properties/:id)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/properties.controller.ts` lines 50-54.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PublicController.listings` (Get /public/offices/:officeCode/listings)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/public.controller.ts` lines 12-15.
   - Identify DTOs involved: FilterPropertiesDto
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `PublicController.bySlug` (Get /public/offices/:officeCode/properties/:slug)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/properties/public.controller.ts` lines 18-21.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---

## Supabase Access

---

## WhatsApp

### Plan for `WhatsAppController.verify` (Get /whatsapp/webhook)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/whatsapp/whatsapp.controller.ts` lines 19-27.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `WhatsAppController.webhook` (Post /whatsapp/webhook)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/whatsapp/whatsapp.controller.ts` lines 30-71.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `WhatsAppController.connect` (Post /whatsapp/connect)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/whatsapp/whatsapp.controller.ts` lines 75-111.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `WhatsAppController.sendTemplate` (Post /whatsapp/send-template)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/whatsapp/whatsapp.controller.ts` lines 115-134.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

### Plan for `WhatsAppController.templates` (Get /whatsapp/templates)

1. **Impact Analysis**
   - Review controller logic in `/workspace/api/src/whatsapp/whatsapp.controller.ts` lines 137-142.
   - Identify DTOs involved: 
   - Map downstream service dependencies via DI graph.
2. **Design Update**
   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`.
   - Extend DTO validation with class-validator decorators as needed.
3. **Implementation Steps**
   - Update controller logic ensuring guards/roles remain enforced.
   - Modify service(s) and adjust Supabase queries ensuring indices exist.
   - Update frontend components to consume new schema.
4. **Testing & Verification**
   - Write unit tests for controller and service.
   - Record e2e regression via Postman or Pact tests.
   - Update CI workflows if contracts change.
5. **Deployment Checklist**
   - Apply migrations or Supabase SQL changes.
   - Monitor logs and analytics for anomalies.

---
