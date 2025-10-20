-- =====================================================
-- Supabase Schema for Customers & Appointments System
-- =====================================================

-- ============================================
-- CUSTOMERS MODULE TABLES
-- ============================================

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  national_id VARCHAR,
  type VARCHAR NOT NULL CHECK (type IN ('buyer', 'seller', 'renter', 'landlord', 'both')),
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  address TEXT,
  city TEXT,
  preferred_contact_method VARCHAR CHECK (preferred_contact_method IN ('phone', 'email', 'whatsapp')),
  notes TEXT,
  tags JSONB,
  source VARCHAR,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  total_spent DECIMAL DEFAULT 0,
  total_earned DECIMAL DEFAULT 0,
  outstanding_balance DECIMAL DEFAULT 0,
  assigned_staff_id UUID,
  last_contact_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT customers_phone_office_unique UNIQUE (phone, office_id)
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_office_id ON customers(office_id);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_staff ON customers(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- 2. Customer Notes Table
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  tags JSONB,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for customer_notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notes_is_important ON customer_notes(is_important);

-- 3. Customer Interactions Table
CREATE TABLE IF NOT EXISTS customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'whatsapp', 'visit')),
  description TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  property_id UUID,
  contract_id UUID,
  outcome TEXT,
  next_follow_up TIMESTAMP,
  staff_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for customer_interactions
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_date ON customer_interactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(type);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_staff_id ON customer_interactions(staff_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_next_follow_up ON customer_interactions(next_follow_up);

-- 4. Customer Properties Relationship Table
CREATE TABLE IF NOT EXISTS customer_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  relationship VARCHAR NOT NULL CHECK (relationship IN ('owner', 'interested', 'viewed', 'negotiating', 'contracted')),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  viewed_at TIMESTAMP,
  interested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique relationship per customer-property pair
  CONSTRAINT customer_properties_unique UNIQUE (customer_id, property_id)
);

-- Indexes for customer_properties
CREATE INDEX IF NOT EXISTS idx_customer_properties_customer_id ON customer_properties(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_properties_property_id ON customer_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_customer_properties_relationship ON customer_properties(relationship);

-- ============================================
-- APPOINTMENTS MODULE TABLES
-- ============================================

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL CHECK (type IN ('viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other')),
  status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER, -- in minutes
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  assigned_staff_id UUID NOT NULL,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  cancelled_at TIMESTAMP,
  cancelled_by UUID,
  cancellation_reason TEXT
);

-- Indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_office_id ON appointments(office_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_staff ON appointments(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_property_id ON appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, start_time);

-- Composite index for conflict checking
CREATE INDEX IF NOT EXISTS idx_appointments_conflict_check 
ON appointments(office_id, assigned_staff_id, date, start_time, end_time) 
WHERE status IN ('scheduled', 'confirmed', 'in_progress');

-- 6. Appointment Reminders Table (Optional - for future use)
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'notification')),
  minutes_before INTEGER NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Indexes for appointment_reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON appointment_reminders(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Customers Policies
CREATE POLICY "Users can view customers from their office" 
ON customers FOR SELECT 
USING (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can insert customers to their office" 
ON customers FOR INSERT 
WITH CHECK (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can update customers in their office" 
ON customers FOR UPDATE 
USING (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can delete customers in their office" 
ON customers FOR DELETE 
USING (office_id = auth.jwt() ->> 'office_id');

-- Customer Notes Policies
CREATE POLICY "Users can view notes for customers in their office" 
ON customer_notes FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM customers 
  WHERE customers.id = customer_notes.customer_id 
  AND customers.office_id = auth.jwt() ->> 'office_id'
));

CREATE POLICY "Users can insert notes for customers in their office" 
ON customer_notes FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM customers 
  WHERE customers.id = customer_notes.customer_id 
  AND customers.office_id = auth.jwt() ->> 'office_id'
));

-- Customer Interactions Policies
CREATE POLICY "Users can view interactions for customers in their office" 
ON customer_interactions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM customers 
  WHERE customers.id = customer_interactions.customer_id 
  AND customers.office_id = auth.jwt() ->> 'office_id'
));

-- Customer Properties Policies
CREATE POLICY "Users can view customer-property relationships in their office" 
ON customer_properties FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM customers 
  WHERE customers.id = customer_properties.customer_id 
  AND customers.office_id = auth.jwt() ->> 'office_id'
));

-- Appointments Policies
CREATE POLICY "Users can view appointments from their office" 
ON appointments FOR SELECT 
USING (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can insert appointments to their office" 
ON appointments FOR INSERT 
WITH CHECK (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can update appointments in their office" 
ON appointments FOR UPDATE 
USING (office_id = auth.jwt() ->> 'office_id');

CREATE POLICY "Users can delete appointments in their office" 
ON appointments FOR DELETE 
USING (office_id = auth.jwt() ->> 'office_id');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Customer Stats View
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
  office_id,
  COUNT(*) as total_customers,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
  COUNT(CASE WHEN type = 'buyer' THEN 1 END) as buyers,
  COUNT(CASE WHEN type = 'seller' THEN 1 END) as sellers,
  SUM(total_spent) as total_revenue,
  SUM(outstanding_balance) as total_outstanding,
  AVG(rating) as avg_rating
FROM customers
GROUP BY office_id;

-- Appointment Stats View
CREATE OR REPLACE VIEW appointment_stats AS
SELECT 
  office_id,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  COUNT(CASE WHEN date = CURRENT_DATE THEN 1 END) as today_appointments,
  COUNT(CASE WHEN date > CURRENT_DATE AND status IN ('scheduled', 'confirmed') THEN 1 END) as upcoming_appointments
FROM appointments
GROUP BY office_id;

-- ============================================
-- SAMPLE DATA (FOR TESTING - OPTIONAL)
-- ============================================

-- Uncomment to insert sample data
/*
-- Sample Customer
INSERT INTO customers (office_id, name, phone, email, type, status, city, source, rating)
VALUES (
  'your-office-uuid',
  'محمد أحمد',
  '+966501234567',
  'mohamed@example.com',
  'buyer',
  'active',
  'الرياض',
  'website',
  5
);

-- Sample Appointment
INSERT INTO appointments (
  office_id, 
  title, 
  type, 
  status, 
  date, 
  start_time, 
  end_time, 
  duration,
  assigned_staff_id,
  created_by
)
VALUES (
  'your-office-uuid',
  'معاينة عقار',
  'viewing',
  'scheduled',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  '11:00:00',
  60,
  'your-staff-uuid',
  'your-user-uuid'
);
*/

-- ============================================
-- GRANTS (OPTIONAL - Adjust based on your setup)
-- ============================================

-- Grant necessary permissions to authenticated users
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- To execute this schema:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire file
-- 4. Click "Run"

-- Notes:
-- - Make sure the 'properties' table exists before running this
-- - Update office_id, staff_id, user_id UUIDs in sample data
-- - Adjust RLS policies based on your authentication setup
-- - Review and customize indexes based on your query patterns
