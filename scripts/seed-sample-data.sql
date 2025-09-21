-- Insert sample users
INSERT INTO users (id, email, name, phone, password_hash, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@keyra.com', 'Admin User', '+1234567890', '$2a$10$N9qo8uLOickgx2ZMRZo5i.ezN.9GjEAQy2q6bY6ZpZ3Omefx5GfS6', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'John Doe', '+1234567891', '$2a$10$N9qo8uLOickgx2ZMRZo5i.ezN.9GjEAQy2q6bY6ZpZ3Omefx5GfS6', 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'Jane Smith', '+1234567892', '$2a$10$N9qo8uLOickgx2ZMRZo5i.ezN.9GjEAQy2q6bY6ZpZ3Omefx5GfS6', 'user')
ON CONFLICT (email) DO NOTHING;
-- the password for the users above is Password123!

-- Insert sample profiles
INSERT INTO profiles (user_id, name, full_name, username, status, plan, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'Admin User', 'admin', 'active', 'premium', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'John Doe', 'johndoe', 'active', 'single', 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'Jane Smith', 'janesmith', 'active', 'franchise', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (name, phone, address, employee_code, permission) VALUES
('Alice Johnson', '+1234567893', '123 Main St, Anytown, ST 12345', 'EMP001', 'read'),
('Bob Wilson', '+1234567894', '456 Oak Ave, Somewhere, ST 67890', 'EMP002', 'write'),
('Carol Brown', '+1234567895', '789 Pine Rd, Elsewhere, ST 54321', 'EMP003', 'admin')
ON CONFLICT (employee_code) DO NOTHING;

-- Insert sample advertisements
INSERT INTO advertisements (title, description, category, image_url, link_url, button_text, is_active) VALUES
('Summer Sale', 'Get 50% off on all QR code plans this summer!', 'Promotion', '/placeholder.svg?height=200&width=300&text=Summer+Sale', 'https://example.com/summer-sale', 'Shop Now', true),
('New Features', 'Check out our latest QR code customization features', 'Feature', '/placeholder.svg?height=200&width=300&text=New+Features', 'https://example.com/features', 'Learn More', true),
('Business Plans', 'Upgrade to our business plan for advanced analytics', 'Business', '/placeholder.svg?height=200&width=300&text=Business+Plans', 'https://example.com/business', 'Upgrade Now', false);

-- Insert sample payment receipts
INSERT INTO payment_receipts (user_id, plan_type, amount, receipt_image_url, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'single', 299.00, '/placeholder.svg?height=400&width=300&text=Receipt+1', 'pending'),
('550e8400-e29b-41d4-a716-446655440002', 'franchise', 599.00, '/placeholder.svg?height=400&width=300&text=Receipt+2', 'approved');

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, plan_type, plan_name, amount, status, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'single', 'Single Plan', 299.00, 'active', NOW() + INTERVAL '1 year'),
('550e8400-e29b-41d4-a716-446655440002', 'franchise', 'Franchise Plan', 599.00, 'active', NOW() + INTERVAL '1 year');

-- Insert sample QR codes
INSERT INTO qr_codes (user_id, name, phone, address, qr_data, plan_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', '+1234567891', '123 Business St', 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567891\nEND:VCARD', 'single'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', '+1234567892', '456 Corporate Ave', 'BEGIN:VCARD\nVERSION:3.0\nFN:Jane Smith\nTEL:+1234567892\nEND:VCARD', 'franchise');
