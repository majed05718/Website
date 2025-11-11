-- =====================================================
-- Add Indexes (Run AFTER tables are created)
-- =====================================================

-- First, verify tables exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'offices') THEN
        RAISE EXCEPTION 'Table offices does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
        RAISE EXCEPTION 'Table user_permissions does not exist';
    END IF;
END $$;

-- Add indexes for offices
CREATE INDEX IF NOT EXISTS idx_offices_office_code ON offices(office_code);
CREATE INDEX IF NOT EXISTS idx_offices_is_active ON offices(is_active);

-- Add indexes for user_permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_office_id ON user_permissions(office_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_email ON user_permissions(email);
CREATE INDEX IF NOT EXISTS idx_user_permissions_phone ON user_permissions(phone);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role ON user_permissions(role);

-- Add indexes for properties (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'properties') THEN
        CREATE INDEX IF NOT EXISTS idx_properties_office_id ON properties(office_id);
        CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
        CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
    END IF;
END $$;

-- Add indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

SELECT 'Indexes created successfully!' as status;
