import React from 'react';
import { Link } from 'react-router-dom';

const Help: React.FC = () => {
  const faqs = [
    {
      question: 'How do I get started with DocCraft-AI?',
      answer:
        'Getting started is easy! Simply create an account, log in, and explore our dashboard. You can start with document processing, book outlining, or any of our other AI-powered tools.',
    },
    {
      question: 'What file formats does DocCraft-AI support?',
      answer:
        'We support a wide range of file formats including PDF, DOCX, TXT, and more. Our document processor can handle most common text formats used by writers and content creators.',
    },
    {
      question: 'How accurate is the AI analysis?',
      answer:
        'Our AI models are trained on extensive literary datasets and provide highly accurate analysis. However, we always recommend reviewing AI-generated content to ensure it meets your specific needs.',
    },
    {
      question: 'Can I export my work from DocCraft-AI?',
      answer:
        'Yes! You can export your work in various formats including PDF, DOCX, and plain text. All your work is saved securely and can be accessed from any device.',
    },
    {
      question: 'Is my content secure and private?',
      answer:
        'Absolutely. We take data security seriously and implement industry-standard encryption and security measures. Your content is private and we never share it with third parties.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Help Center
      </h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Getting Started
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Welcome to DocCraft-AI! This help center will guide you through using
          our platform effectively.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dashboard Guide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn how to navigate and use the main dashboard
            </p>
          </Link>
          <Link
            to="/processor"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Document Processing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How to process and analyze documents
            </p>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Need More Help?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Support Center
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
