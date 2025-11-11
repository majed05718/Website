-- =====================================================
-- Simplified Database Schema (No Indexes)
-- First create tables, then we'll add indexes manually
-- =====================================================

-- Drop existing tables if needed (CAREFUL!)
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP TABLE IF EXISTS user_permissions CASCADE;
-- DROP TABLE IF EXISTS properties CASCADE;
-- DROP TABLE IF EXISTS offices CASCADE;

-- 1. OFFICES TABLE
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code VARCHAR(255) UNIQUE NOT NULL,
  office_name VARCHAR(255) NOT NULL,
  max_properties INTEGER DEFAULT 1000,
  max_users INTEGER DEFAULT 50,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_start DATE,
  subscription_end DATE,
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp_phone_number VARCHAR(50),
  whatsapp_phone_number_id VARCHAR(255),
  whatsapp_api_url TEXT,
  whatsapp_api_token TEXT,
  n8n_webhook_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER_PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROPERTIES TABLE (Basic version)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'available',
  price DECIMAL(15,2),
  area DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  address TEXT,
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REFRESH_TOKENS TABLE
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Tables created successfully!' as status;
