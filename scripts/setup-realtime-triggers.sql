-- Enable the realtime extension if not already enabled

-- Create the realtime publication if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to the realtime publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS employees;
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS payment_receipts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS advertisements;

-- Enable realtime for specific tables
ALTER TABLE IF EXISTS employees REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS payment_receipts REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS advertisements REPLICA IDENTITY FULL;

-- Create or replace function to notify on payment status changes
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify when payment status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        PERFORM pg_notify(
            'payment_status_changed',
            json_build_object(
                'id', NEW.id,
                'user_id', NEW.user_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'admin_notes', NEW.admin_notes,
                'updated_at', NEW.updated_at
            )::text
        );
    END IF;
    
    -- Notify when new payment is submitted
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify(
            'payment_submitted',
            json_build_object(
                'id', NEW.id,
                'user_id', NEW.user_id,
                'plan_type', NEW.plan_type,
                'amount', NEW.amount,
                'status', NEW.status,
                'created_at', NEW.created_at
            )::text
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to notify on employee changes
CREATE OR REPLACE FUNCTION notify_employee_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify(
            'employee_registered',
            json_build_object(
                'id', NEW.id,
                'name', NEW.name,
                'employee_code', NEW.employee_code,
                'permission', NEW.permission,
                'created_at', NEW.created_at
            )::text
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify(
            'employee_updated',
            json_build_object(
                'id', NEW.id,
                'name', NEW.name,
                'employee_code', NEW.employee_code,
                'permission', NEW.permission,
                'updated_at', NEW.updated_at
            )::text
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify(
            'employee_deleted',
            json_build_object(
                'id', OLD.id,
                'name', OLD.name,
                'employee_code', OLD.employee_code
            )::text
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS payment_status_change_trigger ON payment_receipts;
DROP TRIGGER IF EXISTS employee_change_trigger ON employees;

-- Create triggers for payment_receipts table (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_receipts') THEN
        CREATE TRIGGER payment_status_change_trigger
            AFTER INSERT OR UPDATE ON payment_receipts
            FOR EACH ROW
            EXECUTE FUNCTION notify_payment_status_change();
    END IF;
END $$;

-- Create triggers for employees table (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        CREATE TRIGGER employee_change_trigger
            AFTER INSERT OR UPDATE OR DELETE ON employees
            FOR EACH ROW
            EXECUTE FUNCTION notify_employee_change();
    END IF;
END $$;

-- Grant necessary permissions for realtime
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Enable row level security (RLS) for tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_receipts') THEN
        ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies for realtime access (if tables exist)
DO $$
BEGIN
    -- Payment receipts policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_receipts') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable realtime for payment_receipts" ON payment_receipts;
        
        -- Create new policy
        CREATE POLICY "Enable realtime for payment_receipts" ON payment_receipts
            FOR ALL USING (true);
    END IF;
    
    -- Employees policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable realtime for employees" ON employees;
        
        -- Create new policy
        CREATE POLICY "Enable realtime for employees" ON employees
            FOR ALL USING (true);
    END IF;
END $$;

-- Log successful setup
DO $$
BEGIN
    RAISE NOTICE 'Realtime triggers and publication setup completed successfully';
    RAISE NOTICE 'Tables added to realtime publication: employees, payment_receipts, advertisements';
    RAISE NOTICE 'Triggers created for real-time notifications';
END $$;
