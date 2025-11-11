-- فحص بنية جدول user_permissions
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_permissions'
ORDER BY ordinal_position;
