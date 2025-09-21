-- Run all database setup scripts in order

-- 1. Create user tables
\i scripts/create-user-tables.sql

-- 2. Create existing tables
\i scripts/create-tables.sql

-- 3. Set up storage
\i scripts/setup-storage.sql

-- 4. Create policies
\i scripts/create-policies.sql

-- 5. Create functions
\i scripts/create-functions.sql

-- 6. Set up realtime triggers
\i scripts/setup-realtime-triggers.sql

-- 7. Update payment system
\i scripts/update-payment-system.sql

-- 8. Seed sample data
\i scripts/seed-sample-data.sql

-- Create admin user for testing
INSERT INTO users (email, name, phone, password_hash, user_type) 
VALUES (
  'admin@keyra.com', 
  'Admin User', 
  '+91 9999999999', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdj6NA5pF6inu', -- password: admin123
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create admin profile
INSERT INTO user_profiles (user_id, plan_type, employee_code)
SELECT id, 'office', 'ADMIN001'
FROM users 
WHERE email = 'admin@keyra.com'
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
