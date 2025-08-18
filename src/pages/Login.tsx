import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMCP } from '../useMCP';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Footer } from '../components/Footer';

type AuthMode = 'login' | 'signup' | 'forgot';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Enhanced password strength interface (additive feature)
interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export const Login: React.FC = () => {
  const mcpContext = useMCP('Login.tsx');
  const { signIn, signUp, redirectToAppropriatePage } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced password strength state (additive feature)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400',
  });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation for signup
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode !== 'forgot' && !validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        // Redirect after successful login
        setTimeout(async () => {
          await redirectToAppropriatePage();
        }, 1500);
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password);
        // Redirect after successful signup
        setTimeout(async () => {
          await redirectToAppropriatePage();
        }, 1500);
      } else if (mode === 'forgot') {
        await handleForgotPassword();
      }

      // Reset form on success
      setFormData({ email: '', password: '', confirmPassword: '' });
      setErrors({});
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setMode('login');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email';
      throw new Error(errorMessage);
    }
  };

  // Enhanced password strength checking (additive feature)
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], color: 'text-gray-400' };
    }

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include a number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special character');
    }

    // Determine color based on score
    let color = 'text-red-500';
    if (score >= 4) color = 'text-green-500';
    else if (score >= 3) color = 'text-yellow-500';
    else if (score >= 2) color = 'text-orange-500';

    return { score, feedback, color };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Enhanced password strength checking (additive feature)
    if (field === 'password' && mode === 'signup') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
      setShowPasswordStrength(value.length > 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* MCP Role Badge */}
      {mcpContext.role !== 'viewer' && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full border border-white/20 dark:border-slate-700/20 shadow-lg">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">
            Role: {mcpContext.role}
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Back to Home */}
          <div className="text-center mb-8">
            <a
              href="/"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </a>
          </div>

          {/* Auth Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {mode === 'login' && 'Sign in to your DocCraft AI account'}
                {mode === 'signup' &&
                  'Join thousands of creators using DocCraft AI'}
                {mode === 'forgot' &&
                  'Enter your email to receive a password reset link'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e =>
                        handleInputChange('password', e.target.value)
                      }
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}

                  {/* Enhanced Password Strength Indicator (additive feature) */}
                  {mode === 'signup' && showPasswordStrength && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password Strength
                        </span>
                        <span
                          className={`text-sm font-semibold ${passwordStrength.color}`}
                        >
                          {passwordStrength.score}/5
                        </span>
                      </div>

                      {/* Strength Bar */}
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 4
                              ? 'bg-green-500'
                              : passwordStrength.score >= 3
                                ? 'bg-yellow-500'
                                : passwordStrength.score >= 2
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Feedback */}
                      {passwordStrength.feedback.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            To improve your password:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {passwordStrength.score >= 4 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                          ✓ Strong password!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Field (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : mode === 'login' ? (
                  <LogIn className="w-5 h-5 mr-2" />
                ) : mode === 'signup' ? (
                  <UserPlus className="w-5 h-5 mr-2" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                {isLoading
                  ? 'Processing...'
                  : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Email'}
              </button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'login' && (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    Don&apos;t have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <button
                      onClick={() => {
                        setMode('forgot');
                        setErrors({});
                        setFormData({
                          email: '',
                          password: '',
                          confirmPassword: '',
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              )}

              {mode === 'forgot' && (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    Remember your password?{' '}
                    <button
                      onClick={() => {
                        setMode('login');
                        setErrors({});
                        setFormData({
                          email: '',
                          password: '',
                          confirmPassword: '',
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    We&apos;ll send you a link to reset your password
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
