-- Payment System Database Schema
-- This schema supports multiple payment gateways including Stripe, PayPal, Google Pay, Apple Pay, and Bank Transfer

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'googlepay', 'applepay', 'bank_transfer')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Gateway Configurations
CREATE TABLE IF NOT EXISTS payment_gateway_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  test_mode BOOLEAN DEFAULT true,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Intents Table
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),
  payment_method TEXT NOT NULL,
  gateway_payment_id TEXT, -- External payment gateway ID
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('Free', 'Pro', 'Enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT NOT NULL,
  gateway_subscription_id TEXT, -- External subscription ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Information Table
CREATE TABLE IF NOT EXISTS billing_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  address JSONB NOT NULL DEFAULT '{}',
  phone TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment History Table (for detailed transaction logs)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES payment_intents(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  gateway_transaction_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_number TEXT UNIQUE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  gateway_invoice_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view payment methods" ON payment_methods
  FOR SELECT USING (true);

CREATE POLICY "Users can view gateway configs" ON payment_gateway_configs
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own payment intents" ON payment_intents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own billing info" ON billing_info
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);

CREATE INDEX IF NOT EXISTS idx_billing_info_user_id ON billing_info(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Insert default payment methods
INSERT INTO payment_methods (gateway, name, description, icon, display_order) VALUES
  ('stripe', 'Credit/Debit Card', 'Pay with Visa, Mastercard, American Express, and more', '💳', 1),
  ('paypal', 'PayPal', 'Pay with your PayPal account or credit card', '🅿️', 2),
  ('googlepay', 'Google Pay', 'Fast and secure payments with Google Pay', '📱', 3),
  ('applepay', 'Apple Pay', 'Simple and secure payments with Apple Pay', '🍎', 4),
  ('bank_transfer', 'Bank Transfer', 'Direct bank transfer (3-5 business days)', '🏦', 5)
ON CONFLICT (gateway) DO NOTHING;

-- Insert default gateway configurations
INSERT INTO payment_gateway_configs (gateway, config, test_mode) VALUES
  ('stripe', '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}', true),
  ('paypal', '{"client_id": "", "client_secret": "", "mode": "sandbox"}', true),
  ('googlepay', '{"merchant_id": "", "merchant_name": "DocCraft AI"}', true),
  ('applepay', '{"merchant_id": "", "merchant_name": "DocCraft AI"}', true),
  ('bank_transfer', '{"account_number": "", "routing_number": "", "bank_name": ""}', true)
ON CONFLICT (gateway) DO NOTHING;

-- Create functions for payment processing
CREATE OR REPLACE FUNCTION process_payment_intent(
  p_payment_intent_id UUID,
  p_status TEXT,
  p_gateway_payment_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS payment_intents AS $$
DECLARE
  updated_payment_intent payment_intents;
BEGIN
  UPDATE payment_intents 
  SET 
    status = p_status,
    gateway_payment_id = COALESCE(p_gateway_payment_id, gateway_payment_id),
    error_message = COALESCE(p_error_message, error_message),
    updated_at = NOW()
  WHERE id = p_payment_intent_id
  RETURNING * INTO updated_payment_intent;
  
  RETURN updated_payment_intent;
END;
$$ LANGUAGE plpgsql;

-- Function to create subscription
CREATE OR REPLACE FUNCTION create_user_subscription(
  p_user_id UUID,
  p_tier TEXT,
  p_payment_method TEXT,
  p_gateway_subscription_id TEXT DEFAULT NULL
) RETURNS subscriptions AS $$
DECLARE
  new_subscription subscriptions;
  current_date TIMESTAMP WITH TIME ZONE := NOW();
  period_end TIMESTAMP WITH TIME ZONE := current_date + INTERVAL '1 month';
BEGIN
  -- Cancel any existing active subscriptions
  UPDATE subscriptions 
  SET 
    status = 'canceled',
    cancel_at_period_end = true,
    updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';
  
  -- Create new subscription
  INSERT INTO subscriptions (
    user_id, tier, status, current_period_start, current_period_end,
    payment_method, gateway_subscription_id
  ) VALUES (
    p_user_id, p_tier, 'active', current_date, period_end,
    p_payment_method, p_gateway_subscription_id
  ) RETURNING * INTO new_subscription;
  
  -- Update user profile tier
  UPDATE writer_profiles 
  SET tier = p_tier, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN new_subscription;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription summary
CREATE OR REPLACE FUNCTION get_subscription_summary()
RETURNS TABLE (
  tier TEXT,
  active_count BIGINT,
  total_revenue BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.tier,
    COUNT(*) as active_count,
    SUM(CASE WHEN s.tier = 'Pro' THEN 2900 WHEN s.tier = 'Enterprise' THEN 9900 ELSE 0 END) as total_revenue
  FROM subscriptions s
  WHERE s.status = 'active'
  GROUP BY s.tier;
END;
$$ LANGUAGE plpgsql;

-- Create views for easy querying
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.*,
  u.email,
  wp.full_name
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN writer_profiles wp ON s.user_id = wp.user_id
WHERE s.status = 'active';

CREATE OR REPLACE VIEW payment_summary AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_payments,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount
FROM payment_intents
WHERE status = 'succeeded'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Add comments for documentation
COMMENT ON TABLE payment_methods IS 'Available payment methods and their configurations';
COMMENT ON TABLE payment_gateway_configs IS 'Configuration for different payment gateways';
COMMENT ON TABLE payment_intents IS 'Payment intent records for processing payments';
COMMENT ON TABLE subscriptions IS 'User subscription records with billing periods';
COMMENT ON TABLE billing_info IS 'User billing information for payments';
COMMENT ON TABLE payment_history IS 'Detailed payment transaction history';
COMMENT ON TABLE invoices IS 'Invoice records for billing';

-- Grant necessary permissions
GRANT SELECT ON payment_methods TO authenticated;
GRANT SELECT ON payment_gateway_configs TO authenticated;
GRANT ALL ON payment_intents TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON billing_info TO authenticated;
GRANT SELECT ON payment_history TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT SELECT ON active_subscriptions TO authenticated;
GRANT SELECT ON payment_summary TO authenticated; 