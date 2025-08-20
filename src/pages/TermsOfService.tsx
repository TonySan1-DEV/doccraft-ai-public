import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-400">
        Terms of Service
      </h1>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <p className="text-black mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          1. Acceptance of Terms
        </h2>
        <p className="text-black mb-6">
          By accessing and using DocCraft-AI, you accept and agree to be bound
          by the terms and provision of this agreement.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          2. Use License
        </h2>
        <p className="text-black mb-6">
          Permission is granted to temporarily use DocCraft-AI for personal,
          non-commercial transitory viewing only.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          3. Privacy Policy
        </h2>
        <p className="text-black mb-6">
          Your privacy is important to us. Please review our Privacy Policy,
          which also governs your use of the service.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          4. Service Modifications
        </h2>
        <p className="text-black mb-6">
          DocCraft-AI may revise these terms of service at any time without
          notice.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          5. Contact Information
        </h2>
        <p className="text-black mb-6">
          Questions about the Terms of Service should be sent to us at
          support@doccraft-ai.com.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
