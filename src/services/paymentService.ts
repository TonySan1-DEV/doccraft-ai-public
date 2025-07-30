import { supabase } from '../lib/supabase'

export interface PaymentMethod {
  id: string
  type: 'stripe' | 'paypal' | 'googlepay' | 'applepay' | 'bank_transfer'
  name: string
  description: string
  icon: string
  enabled: boolean
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  payment_method: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'Free' | 'Pro' | 'Enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  payment_method: string
  created_at: string
  updated_at: string
}

export interface BillingInfo {
  id: string
  user_id: string
  email: string
  name: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  phone?: string
  tax_id?: string
  created_at: string
  updated_at: string
}

// Payment Gateway Configuration
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    type: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa, Mastercard, American Express, and more',
    icon: '💳',
    enabled: true
  },
  {
    id: 'paypal',
    type: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account or credit card',
    icon: '🅿️',
    enabled: true
  },
  {
    id: 'googlepay',
    type: 'googlepay',
    name: 'Google Pay',
    description: 'Fast and secure payments with Google Pay',
    icon: '📱',
    enabled: true
  },
  {
    id: 'applepay',
    type: 'applepay',
    name: 'Apple Pay',
    description: 'Simple and secure payments with Apple Pay',
    icon: '🍎',
    enabled: true
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer (3-5 business days)',
    icon: '🏦',
    enabled: true
  }
]

// Pricing Tiers Configuration
export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 document analyses per month',
      'Basic outline generation',
      'Standard AI suggestions',
      'Community support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited document analyses',
      'Advanced AI outline generation',
      'Personalized suggestions',
      'Priority support',
      'Premium templates',
      'Advanced analytics',
      'Custom branding',
      'Export to multiple formats',
      'Collaboration tools',
      'API access'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced security',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Advanced analytics',
      'Custom AI training',
      'SLA guarantees',
      'On-premise deployment'
    ]
  }
}

export class PaymentService {
  private static instance: PaymentService

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('enabled', true)
        .order('display_order')

      if (error) throw error
      return data || PAYMENT_METHODS.filter(method => method.enabled)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return PAYMENT_METHODS.filter(method => method.enabled)
    }
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency: string = 'USD',
    paymentMethod: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentIntent> {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .insert({
          amount,
          currency,
          payment_method: paymentMethod,
          status: 'pending',
          metadata
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  // Process payment with Stripe
  async processStripePayment(
    paymentIntentId: string,
    paymentMethodId: string,
    billingInfo: Partial<BillingInfo>
  ): Promise<PaymentIntent> {
    try {
      // This would integrate with Stripe API
      const response = await fetch('/api/payments/stripe/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
          billingInfo
        })
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()
      
      // Update payment intent status
      const { data, error } = await supabase
        .from('payment_intents')
        .update({
          status: result.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error processing Stripe payment:', error)
      throw error
    }
  }

  // Process payment with PayPal
  async processPayPalPayment(
    paymentIntentId: string,
    paypalOrderId: string,
    billingInfo: Partial<BillingInfo>
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paypalOrderId,
          billingInfo
        })
      })

      if (!response.ok) {
        throw new Error('PayPal payment processing failed')
      }

      const result = await response.json()
      
      // Update payment intent status
      const { data, error } = await supabase
        .from('payment_intents')
        .update({
          status: result.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error processing PayPal payment:', error)
      throw error
    }
  }

  // Create subscription
  async createSubscription(
    userId: string,
    tier: string,
    paymentMethod: string
  ): Promise<Subscription> {
    try {
      const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS]
      if (!tierConfig) {
        throw new Error('Invalid tier')
      }

      const currentDate = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (error) throw error

      // Update user profile with new tier
      await supabase
        .from('writer_profiles')
        .update({
          tier,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return data
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  // Get user subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Update billing information
  async updateBillingInfo(
    userId: string,
    billingInfo: Partial<BillingInfo>
  ): Promise<BillingInfo> {
    try {
      const { data, error } = await supabase
        .from('billing_info')
        .upsert({
          user_id: userId,
          ...billingInfo,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating billing info:', error)
      throw error
    }
  }

  // Get billing information
  async getBillingInfo(userId: string): Promise<BillingInfo | null> {
    try {
      const { data, error } = await supabase
        .from('billing_info')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching billing info:', error)
      return null
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string): Promise<PaymentIntent[]> {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  // Validate payment method
  async validatePaymentMethod(paymentMethod: string): Promise<boolean> {
    const validMethods = PAYMENT_METHODS.map(method => method.id)
    return validMethods.includes(paymentMethod)
  }

  // Get payment gateway configuration
  async getPaymentGatewayConfig(gateway: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payment_gateway_configs')
        .select('*')
        .eq('gateway', gateway)
        .eq('enabled', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching payment gateway config:', error)
      return null
    }
  }
}

export default PaymentService 