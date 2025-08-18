import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, Users, Shield, Clock } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out DocCraft-AI',
      features: [
        '1 document per month',
        'Access to all 6 AI agents',
        'Basic collaboration features',
        'Community support',
        'Standard export formats',
      ],
      cta: 'Start Free Trial',
      popular: false,
      href: '/signup',
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious writers and small teams',
      features: [
        'Unlimited documents',
        'Priority AI agent processing',
        'Advanced collaboration tools',
        'Priority support',
        'All export formats',
        'Custom AI training',
        'Analytics dashboard',
      ],
      cta: 'Start Pro Trial',
      popular: true,
      href: '/signup',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        'Advanced security',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'On-premise options',
      ],
      cta: 'Contact Sales',
      popular: false,
      href: '/contact',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your writing needs. All plans include our
            powerful AI agents and collaboration features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            All Plans Include Our Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: '6 AI Agents',
                description:
                  'Research, Structure, Writing, Character, Emotion, and Style agents working together',
              },
              {
                icon: Users,
                title: 'Real-time Collaboration',
                description:
                  'Multiple writers can work simultaneously with intelligent conflict resolution',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description:
                  'Bank-level encryption, audit logging, and compliance with industry standards',
              },
              {
                icon: Clock,
                title: '24/7 Support',
                description:
                  'Round-the-clock assistance for all users, with priority support for Pro plans',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Writing?
          </h2>
          <p className="text-xl opacity-90 mb-6">
            Join thousands of writers using AI-powered collaboration to create
            better stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try Demo First
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I change plans anytime?',
                answer:
                  'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                question: 'Is there a free trial?',
                answer:
                  "Absolutely! Start with our free tier and upgrade when you're ready for unlimited documents.",
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise plans.',
              },
              {
                question: 'Can I cancel my subscription?',
                answer:
                  'Yes, you can cancel anytime with no cancellation fees. Your access continues until the end of your billing period.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
