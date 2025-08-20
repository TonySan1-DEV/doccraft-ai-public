import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-400">
        About DocCraft-AI
      </h1>

      <div className="prose prose-gray max-w-none dark:prose-invert">
        <p className="text-lg text-black mb-8">
          DocCraft-AI is a cutting-edge AI-powered writing assistant designed to
          transform how creative professionals approach document creation and
          content development.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          Our Mission
        </h2>
        <p className="text-black mb-6">
          We believe that every writer deserves access to powerful AI tools that
          enhance creativity rather than replace it. Our mission is to
          democratize AI-powered writing assistance, making it accessible to
          authors, content creators, and professionals worldwide.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          What We Do
        </h2>
        <p className="text-black mb-6">
          DocCraft-AI provides a comprehensive suite of AI-powered tools
          including document processing, book outlining, character development,
          and analytics. Our platform helps writers overcome creative blocks,
          organize their thoughts, and produce high-quality content more
          efficiently.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          Our Technology
        </h2>
        <p className="text-black mb-6">
          Built on state-of-the-art natural language processing and machine
          learning technologies, DocCraft-AI continuously learns and adapts to
          provide personalized writing assistance. Our AI models are trained on
          diverse literary works and writing styles to ensure versatility and
          accuracy.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          Our Team
        </h2>
        <p className="text-black mb-6">
          We're a passionate team of AI researchers, software engineers, and
          writing enthusiasts dedicated to revolutionizing the writing process.
          Our diverse backgrounds in technology, literature, and user experience
          design drive our innovative approach to AI-powered writing tools.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
          Contact Information
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-black mb-2">
            <strong>Email:</strong> info@doccraft-ai.com
          </p>
          <p className="text-black mb-2">
            <strong>Support:</strong> support@doccraft-ai.com
          </p>
          <p className="text-black mb-2">
            <strong>Location:</strong> San Francisco, CA
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
