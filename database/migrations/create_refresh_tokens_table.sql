-- =====================================================
-- Refresh Tokens Table Migration
-- =====================================================
-- Purpose: Store JWT refresh tokens for token rotation strategy
-- Created: 2025-11-10
-- Related Epic: SEC-01, SEC-02, SEC-03 from Audit Report
-- =====================================================

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
  ON refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at 
  ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expires 
  ON refresh_tokens(user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_revoked 
  ON refresh_tokens(user_id, is_revoked);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash 
  ON refresh_tokens(token_hash);

-- Enable Row Level Security
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own refresh tokens
CREATE POLICY "Users can view their own refresh tokens" 
  ON refresh_tokens FOR SELECT 
  USING (user_id = (auth.jwt() ->> 'sub')::UUID);

CREATE POLICY "Users can insert their own refresh tokens" 
  ON refresh_tokens FOR INSERT 
  WITH CHECK (user_id = (auth.jwt() ->> 'sub')::UUID);

CREATE POLICY "Users can update their own refresh tokens" 
  ON refresh_tokens FOR UPDATE 
  USING (user_id = (auth.jwt() ->> 'sub')::UUID);

CREATE POLICY "Users can delete their own refresh tokens" 
  ON refresh_tokens FOR DELETE 
  USING (user_id = (auth.jwt() ->> 'sub')::UUID);

-- Create function to automatically clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens 
  WHERE expires_at < NOW() OR (is_revoked = TRUE AND revoked_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean expired tokens (optional - requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('clean-expired-tokens', '0 3 * * *', 'SELECT clean_expired_refresh_tokens()');

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP FUNCTION IF EXISTS clean_expired_refresh_tokens() CASCADE;
-- =====================================================

-- To execute this migration:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. Verify table creation: SELECT * FROM refresh_tokens LIMIT 1;
