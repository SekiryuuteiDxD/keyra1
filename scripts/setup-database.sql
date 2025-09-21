-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS payment_receipts CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    job_title VARCHAR(255),
    company VARCHAR(255),
    department VARCHAR(255),
    employee_id VARCHAR(100),
    work_location VARCHAR(255),
    education TEXT,
    skills TEXT[],
    languages TEXT[],
    interests TEXT[],
    social_media JSONB DEFAULT '{}',
    is_private BOOLEAN DEFAULT false,
    show_email BOOLEAN DEFAULT true,
    show_phone BOOLEAN DEFAULT true,
    show_address BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1,
    badge VARCHAR(100) DEFAULT 'bronze',
    posts_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    plan VARCHAR(50) DEFAULT 'free',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    employee_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code_url TEXT,
    permission VARCHAR(50) DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
    created_by VARCHAR(255) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advertisements table
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    button_text VARCHAR(100) DEFAULT 'Learn More',
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('single', 'franchise', 'office')),
    plan_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_id VARCHAR(255),
    payment_gateway VARCHAR(100),
    billing_info JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_codes table
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    quote TEXT,
    employee_code VARCHAR(100),
    qr_data TEXT NOT NULL,
    qr_image_url TEXT,
    plan_type VARCHAR(50),
    location VARCHAR(255),
    category VARCHAR(100),
    mood VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_receipts table
CREATE TABLE payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    receipt_image_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    caption TEXT,
    image_url TEXT,
    is_video BOOLEAN DEFAULT false,
    location VARCHAR(255),
    category VARCHAR(100),
    mood VARCHAR(100),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    video_url TEXT,
    text_content TEXT,
    duration INTEGER DEFAULT 24,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_payment_receipts_status ON payment_receipts(status);
CREATE INDEX idx_payment_receipts_user_id ON payment_receipts(user_id);
CREATE INDEX idx_advertisements_active ON advertisements(is_active);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_receipts_updated_at BEFORE UPDATE ON payment_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin user
INSERT INTO users (id, email, name, phone, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@keyra.com', 'Admin User', '+918839073733', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert admin profile
INSERT INTO profiles (user_id, name, full_name, username, status, plan, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'Admin User', 'admin', 'active', 'premium', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data for testing
INSERT INTO employees (name, phone, address, employee_code, permission) VALUES
('John Doe', '+919876543210', '123 Main Street, Mumbai, Maharashtra 400001', 'EMP001', 'read'),
('Jane Smith', '+919876543211', '456 Oak Avenue, Delhi, Delhi 110001', 'EMP002', 'write'),
('Mike Johnson', '+919876543212', '789 Pine Road, Bangalore, Karnataka 560001', 'EMP003', 'admin')
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO advertisements (title, description, category, image_url, link_url, button_text, is_active) VALUES
('Welcome to Keyra', 'Discover the power of QR codes with our amazing platform', 'Technology', '/placeholder.svg?height=200&width=400&text=Welcome+to+Keyra', 'https://keyra.app', 'Get Started', true),
('Premium Features', 'Unlock advanced QR code features with our premium plans', 'Business', '/placeholder.svg?height=200&width=400&text=Premium+Features', '/plan', 'Upgrade Now', true),
('Customer Support', 'Need help? Our support team is here 24/7 to assist you', 'Support', '/placeholder.svg?height=200&width=400&text=Customer+Support', '/customer-care', 'Contact Us', true);

-- Create RLS policies for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON employees FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON advertisements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON advertisements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON advertisements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON advertisements FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON subscriptions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON qr_codes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON qr_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON qr_codes FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON payment_receipts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON payment_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON payment_receipts FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON posts FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON stories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON stories FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON comments FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON post_likes FOR DELETE USING (true);
