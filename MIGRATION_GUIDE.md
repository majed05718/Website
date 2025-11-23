# 📋 Migration Guide - Email to Phone Authentication

**Target Audience:** Database Administrators, DevOps Engineers  
**Risk Level:** 🟡 Medium - Requires Database Updates

---

## ⚠️ Important Notice

This architectural change modifies the **primary authentication method** from email to phone number. Existing users in the database must have valid phone numbers to continue accessing the system.

---

## 📊 Pre-Migration Assessment

### **Step 1: Check Current User Data**

```sql
-- Connect to your Supabase database
-- Check total users
SELECT COUNT(*) as total_users FROM users;

-- Check users with phone numbers
SELECT COUNT(*) as users_with_phone FROM users WHERE phone IS NOT NULL AND phone != '';

-- Check users WITHOUT phone numbers
SELECT COUNT(*) as users_without_phone FROM users WHERE phone IS NULL OR phone = '';

-- List users without phone numbers
SELECT id, email, name, role 
FROM users 
WHERE phone IS NULL OR phone = ''
ORDER BY created_at DESC;
```

### **Step 2: Identify Duplicates**

```sql
-- Check for duplicate phone numbers
SELECT phone, COUNT(*) as count
FROM users
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;
```

---

## 🔧 Migration Scenarios

### **Scenario A: All Users Have Phone Numbers**
If all users already have unique phone numbers, **no migration needed!** The system will work immediately.

### **Scenario B: Some Users Missing Phone Numbers**
You need to populate phone numbers for these users.

#### **Option 1: Manual Update (Recommended)**
```sql
-- Update individual users
UPDATE users 
SET phone = '501234567' 
WHERE email = 'user@example.com';

-- Verify update
SELECT email, phone FROM users WHERE email = 'user@example.com';
```

#### **Option 2: Bulk Update with Placeholder**
```sql
-- Add temporary phone numbers (for testing only)
UPDATE users 
SET phone = '5' || LPAD(CAST(RANDOM() * 100000000 AS TEXT), 8, '0')
WHERE phone IS NULL OR phone = '';

-- ⚠️ WARNING: These are random numbers for testing only!
-- Real users need real phone numbers.
```

#### **Option 3: Contact Users**
1. Export users without phone numbers
2. Send them a notification to update their profile
3. Provide a temporary access method

### **Scenario C: Duplicate Phone Numbers Exist**
You must resolve duplicates before deployment.

```sql
-- Strategy 1: Keep most recent user
WITH duplicates AS (
  SELECT phone, MAX(created_at) as latest
  FROM users
  WHERE phone IN (
    SELECT phone FROM users 
    GROUP BY phone 
    HAVING COUNT(*) > 1
  )
  GROUP BY phone
)
UPDATE users u
SET phone = phone || '_' || u.id
WHERE phone IN (SELECT phone FROM duplicates)
  AND created_at < (SELECT latest FROM duplicates d WHERE d.phone = u.phone);

-- Strategy 2: Manual resolution
-- Contact affected users to verify correct phone number
```

---

## 🔄 Migration Steps

### **Phase 1: Pre-Deployment (Current System Running)**

#### **1. Backup Database**
```bash
# Create full database backup
pg_dump -h <supabase-host> -U <user> -d <database> > backup_before_migration.sql

# Or use Supabase dashboard to create a backup
```

#### **2. Add Phone Numbers to Users**
```sql
-- Run your chosen migration strategy from Scenario B or C
-- Verify all users have unique phone numbers
SELECT COUNT(*) FROM users WHERE phone IS NULL;
-- Expected result: 0

-- Check uniqueness
SELECT phone, COUNT(*) FROM users GROUP BY phone HAVING COUNT(*) > 1;
-- Expected result: 0 rows
```

#### **3. Test on Staging**
```bash
# Deploy to staging first
cd /workspace
pm2 start ecosystem.config.js --only staging-api,staging-frontend

# Test login with phone number
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "501234567", "password": "test-password"}'
```

### **Phase 2: Deployment**

#### **1. Build Applications**
```bash
# Build backend
cd /workspace/api
npm run build

# Build frontend
cd /workspace/Web
npm run build
```

#### **2. Deploy to Production**
```bash
# Stop current production
pm2 stop prod-api prod-frontend

# Start new version
pm2 start ecosystem.config.js --only prod-api,prod-frontend

# Monitor logs
pm2 logs prod-api --lines 50
```

#### **3. Verify Production**
```bash
# Health check
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "501234567", "password": "production-password"}'
```

### **Phase 3: Post-Deployment**

#### **1. Monitor Error Logs**
```bash
pm2 logs prod-api --err

# Check for authentication failures
# Common issues:
# - Users trying to login with email
# - Invalid phone number format
# - Missing phone numbers
```

#### **2. Update User Documentation**
- Send notification about phone-based login
- Update login page instructions
- Provide help desk support for confused users

#### **3. Monitor Metrics**
```sql
-- Track login attempts
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as login_attempts
FROM auth_logs
WHERE action = 'login'
GROUP BY date
ORDER BY date DESC;

-- Track failed logins
SELECT 
  phone,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM auth_logs
WHERE action = 'login' AND success = false
GROUP BY phone
HAVING COUNT(*) > 5;
```

---

## 🔙 Rollback Plan

If critical issues occur, you can rollback:

### **Option 1: Revert Code (Fastest)**
```bash
# Stop new version
pm2 stop all

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
cd /workspace/api && npm run build
cd /workspace/Web && npm run build

# Start old version
pm2 start ecosystem.config.js
```

### **Option 2: Hybrid Approach**
Temporarily support both email and phone:

```typescript
// In login.dto.ts
export class LoginDto {
  @IsOptional()
  email?: string;
  
  @IsOptional()
  phone?: string;
  
  @IsNotEmpty()
  password: string;
}

// In auth.service.ts
async validateUser(identifier: string, password: string) {
  // Try phone first
  let user = await this.findByPhone(identifier);
  
  // Fallback to email
  if (!user && identifier.includes('@')) {
    user = await this.findByEmail(identifier);
  }
  
  return user;
}
```

---

## 📈 Success Metrics

Monitor these metrics to ensure successful migration:

### **Week 1**
- [ ] 95%+ of users successfully login with phone
- [ ] < 5% support tickets about login issues
- [ ] No database errors related to phone uniqueness
- [ ] All active users have valid phone numbers

### **Week 2**
- [ ] 99%+ login success rate
- [ ] < 1% support tickets
- [ ] Users comfortable with new system

### **Week 4**
- [ ] 100% adoption
- [ ] Old email-based login code can be safely removed

---

## 🛠️ Troubleshooting Common Issues

### **Issue 1: User Can't Login**
**Symptoms:** "رقم الجوال أو كلمة المرور غير صحيحة"

**Solutions:**
```sql
-- Verify user exists
SELECT id, phone, email, name, status 
FROM users 
WHERE phone = '501234567';

-- Check if account is active
SELECT status FROM users WHERE phone = '501234567';
-- Should be 'active'

-- Verify phone format
SELECT phone FROM users WHERE id = 'user-id';
-- Should be exactly 9 digits starting with 5
```

### **Issue 2: Duplicate Phone Number**
**Symptoms:** Database constraint violation

**Solutions:**
```sql
-- Find the duplicate
SELECT phone, email, name, created_at
FROM users
WHERE phone = '501234567'
ORDER BY created_at;

-- Resolve by updating older account
UPDATE users
SET phone = '501234568'  -- or another unique number
WHERE id = '<older-user-id>';
```

### **Issue 3: Invalid Phone Format**
**Symptoms:** Validation error on frontend

**Solutions:**
```sql
-- Find invalid phone numbers
SELECT id, phone, email
FROM users
WHERE phone !~ '^5[0-9]{8}$';

-- Fix format (remove spaces, dashes, etc.)
UPDATE users
SET phone = REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
WHERE phone ~ '[^0-9]';

-- Remove Saudi country code prefix if present
UPDATE users
SET phone = SUBSTRING(phone FROM 4)
WHERE phone LIKE '9665%' AND LENGTH(phone) = 12;
```

---

## 📞 Support Contacts

- **Technical Issues:** Check `/workspace/CORE_ARCHITECTURE_OVERHAUL_COMPLETE.md`
- **Quick Start:** Check `/workspace/QUICK_START_OVERHAUL.md`
- **Database Issues:** Review this migration guide

---

## ✅ Post-Migration Checklist

- [ ] Database backup created
- [ ] All users have unique phone numbers
- [ ] Phone format validated (5XXXXXXXX)
- [ ] No duplicate phone numbers
- [ ] Staging environment tested
- [ ] Production deployed successfully
- [ ] Monitoring in place
- [ ] User documentation updated
- [ ] Support team trained
- [ ] Rollback plan documented
- [ ] Success metrics tracked

---

**Migration Complete! 🎉**

Remember: Users now login with **phone numbers** instead of emails.
