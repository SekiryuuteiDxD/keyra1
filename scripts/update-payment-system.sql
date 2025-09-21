-- Create payment receipts table
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    receipt_image_url TEXT NOT NULL,
    payment_method TEXT DEFAULT 'UPI',
    transaction_id TEXT,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment QR codes table
CREATE TABLE IF NOT EXISTS payment_qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    qr_code_url TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add receipt_status to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS receipt_status TEXT DEFAULT 'pending' 
CHECK (receipt_status IN ('pending', 'approved', 'rejected'));

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM subscriptions s
        LEFT JOIN payment_receipts pr ON s.id = pr.subscription_id
        WHERE s.user_id = user_uuid 
        AND s.status = 'active'
        AND (pr.status = 'approved' OR pr.status IS NULL)
        AND s.end_date > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment ad views
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE advertisements 
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE advertisements 
    SET clicks_count = clicks_count + 1,
        updated_at = NOW()
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_receipts
CREATE POLICY "Users can view their own payment receipts" ON payment_receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment receipts" ON payment_receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment receipts" ON payment_receipts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Create RLS policies for payment_qr_codes
CREATE POLICY "Users can view their own payment QR codes" ON payment_qr_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment QR codes" ON payment_qr_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment QR codes" ON payment_qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for payment receipts
CREATE POLICY "Users can upload their payment receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-receipts' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their payment receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-receipts' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all payment receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-receipts' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );
