import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Check,
  Star,
  Zap,
  Crown,
  Shield,
  FileText,
  Brain,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import PaymentForm from '../components/PaymentForm';
import { Footer } from '../components/Footer';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'month' | 'year';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    billingPeriod: 'month',
    features: [
      '5 document analyses per month',
      'Basic outline generation',
      'Standard AI suggestions',
      'Community support',
      'Basic templates',
      'Email notifications',
    ],
    icon: <FileText className="w-6 h-6" />,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious content creators',
    price: 29,
    billingPeriod: 'month',
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
      'API access',
    ],
    popular: true,
    icon: <Zap className="w-6 h-6" />,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and organizations',
    price: 99,
    billingPeriod: 'month',
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
      'On-premise deployment',
    ],
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-600',
  },
];

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const selectedTierData = pricingTiers.find(tier => tier.id === selectedTier)!;

  const getDiscountedPrice = (price: number) => {
    if (billingPeriod === 'year') {
      return Math.round(price * 10); // 2 months free
    }
    return price;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // If it's a paid tier, show payment form
    if (selectedTier !== 'free') {
      setShowPaymentForm(true);
      return;
    }

    // For free tier, create account directly
    await createAccount();
  };

  const createAccount = async () => {
    setIsLoading(true);

    try {
      // Create user account
      await signUp(formData.email, formData.password);

      // Update user profile with tier and billing info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from('writer_profiles').upsert({
          user_id: user.id,
          full_name: formData.fullName,
          company: formData.company,
          tier: selectedTier,
          billing_period: billingPeriod,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(`Welcome to DocCraft-AI ${selectedTierData.name}!`);
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    createAccount();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start your journey with DocCraft-AI. Choose the perfect plan for
            your content creation needs.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg">
            <div className="flex">
              <button
                onClick={() => setBillingPeriod('month')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  billingPeriod === 'month'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('year')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  billingPeriod === 'year'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {pricingTiers.map(tier => (
            <div
              key={tier.id}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                selectedTier === tier.id
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                >
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {tier.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${getDiscountedPrice(tier.price)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{billingPeriod}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  selectedTier === tier.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Sign Up Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {errors.general}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={formData.fullName}
                    onChange={e =>
                      handleInputChange('fullName', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.fullName
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Company (Optional)
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={e => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address *
                </label>
                <input
                  id="email-address"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Plan Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Selected Plan: {selectedTierData.name}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      ${getDiscountedPrice(selectedTierData.price)}/
                      {billingPeriod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {billingPeriod === 'year'
                        ? 'Save 20% with yearly billing'
                        : 'Monthly billing'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  `Create ${selectedTierData.name} Account`
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Choose DocCraft-AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced AI
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                State-of-the-art AI models for intelligent content analysis and
                generation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Features
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intelligent suggestions, auto-completion, and personalized
                recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Enterprise Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bank-level security with encryption and compliance standards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4">
            <PaymentForm
              selectedTier={selectedTier}
              billingPeriod={billingPeriod}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignUp;
