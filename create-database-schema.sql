-- =====================================================
-- Complete Database Schema for Property Management System
-- =====================================================

-- ============================================
-- 1. OFFICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code VARCHAR UNIQUE NOT NULL,
  office_name VARCHAR NOT NULL,
  max_properties INT DEFAULT 1000,
  max_users INT DEFAULT 50,
  subscription_plan VARCHAR DEFAULT 'free',
  subscription_start DATE,
  subscription_end DATE,
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  phone VARCHAR,
  email VARCHAR,
  whatsapp_phone_number VARCHAR,
  whatsapp_phone_number_id VARCHAR,
  whatsapp_api_url TEXT,
  whatsapp_api_token TEXT,
  n8n_webhook_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offices_office_code ON offices(office_code);
CREATE INDEX IF NOT EXISTS idx_offices_is_active ON offices(is_active);

-- ============================================
-- 2. USERS TABLE (user_permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  user_id UUID,
  name VARCHAR NOT NULL,
  phone VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR DEFAULT 'staff',
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_office_id ON user_permissions(office_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_phone ON user_permissions(phone);
CREATE INDEX IF NOT EXISTS idx_user_permissions_email ON user_permissions(email);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role ON user_permissions(role);

-- ============================================
-- 3. PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  property_type VARCHAR,
  status VARCHAR DEFAULT 'available',
  price DECIMAL,
  area DECIMAL,
  bedrooms INT,
  bathrooms INT,
  address TEXT,
  city VARCHAR,
  neighborhood VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_office_id ON properties(office_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);

-- ============================================
-- 4. REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

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

-- Triggers
DROP TRIGGER IF EXISTS update_offices_updated_at ON offices;
CREATE TRIGGER update_offices_updated_at
    BEFORE UPDATE ON offices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - Enable if needed)
-- ============================================

-- ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE offices IS 'Stores information about property management offices';
COMMENT ON TABLE user_permissions IS 'Stores user accounts and their permissions';
COMMENT ON TABLE properties IS 'Stores property listings';
COMMENT ON TABLE refresh_tokens IS 'Stores JWT refresh tokens for authentication';
