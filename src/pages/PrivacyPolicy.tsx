import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Privacy Policy
      </h1>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          1. Information We Collect
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We collect information you provide directly to us, such as when you
          create an account, use our services, or contact us.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          2. How We Use Your Information
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We use the information we collect to provide, maintain, and improve
          our services.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          3. Information Sharing
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We do not sell, trade, or otherwise transfer your personal information
          to third parties.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          4. Data Security
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We implement appropriate security measures to protect your personal
          information.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          5. Contact Us
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          If you have questions about this Privacy Policy, please contact us at
          privacy@doccraft-ai.com.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
