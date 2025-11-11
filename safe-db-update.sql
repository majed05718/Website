-- =====================================================
-- Safe Database Update - NO DATA DELETION
-- يضيف الأعمدة المفقودة فقط، بدون حذف أي شيء
-- =====================================================

-- 1. تحديث جدول OFFICES (إضافة أعمدة مفقودة فقط)
DO $$ 
BEGIN
    -- إضافة whatsapp_phone_number إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='whatsapp_phone_number') THEN
        ALTER TABLE offices ADD COLUMN whatsapp_phone_number VARCHAR(50);
        RAISE NOTICE 'Added whatsapp_phone_number to offices';
    END IF;

    -- إضافة max_properties إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='max_properties') THEN
        ALTER TABLE offices ADD COLUMN max_properties INTEGER DEFAULT 1000;
        RAISE NOTICE 'Added max_properties to offices';
    END IF;

    -- إضافة max_users إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='max_users') THEN
        ALTER TABLE offices ADD COLUMN max_users INTEGER DEFAULT 50;
        RAISE NOTICE 'Added max_users to offices';
    END IF;

    -- إضافة subscription_plan إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='subscription_plan') THEN
        ALTER TABLE offices ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
        RAISE NOTICE 'Added subscription_plan to offices';
    END IF;

    -- إضافة onboarding_completed إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='onboarding_completed') THEN
        ALTER TABLE offices ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added onboarding_completed to offices';
    END IF;

    -- إضافة created_at إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='created_at') THEN
        ALTER TABLE offices ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at to offices';
    END IF;

    -- إضافة updated_at إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='offices' AND column_name='updated_at') THEN
        ALTER TABLE offices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at to offices';
    END IF;
END $$;

-- 2. إنشاء جدول USER_PERMISSIONS (إذا لم يكن موجوداً)
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

-- 3. إنشاء جدول REFRESH_TOKENS (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. عرض النتيجة
SELECT 'Database updated successfully! No data was deleted.' as status;

-- 5. عرض الجداول الموجودة
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
