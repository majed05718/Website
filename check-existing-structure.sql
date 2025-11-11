-- =====================================================
-- فحص بنية الجداول الموجودة
-- =====================================================

-- 1. عرض أعمدة جدول offices
SELECT 
    'OFFICES TABLE' as table_info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'offices'
ORDER BY ordinal_position;

-- 2. عرض أعمدة جدول properties  
SELECT 
    'PROPERTIES TABLE' as table_info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'properties'
ORDER BY ordinal_position;

-- 3. فحص وجود جدول user_permissions
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_schema = 'public' AND table_name = 'user_permissions')
        THEN '✅ user_permissions table EXISTS'
        ELSE '❌ user_permissions table NOT FOUND'
    END as user_permissions_status;

-- 4. عد السجلات في كل جدول
SELECT 
    'offices' as table_name,
    COUNT(*) as record_count
FROM offices
UNION ALL
SELECT 
    'properties' as table_name,
    COUNT(*) as record_count
FROM properties;
