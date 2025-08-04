import React from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Heart,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  showContactButton?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  showContactButton = true,
  className = "",
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DC</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  DocCraft-AI
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Empowering writers with AI-driven document processing and
                writing assistance. Transform your content creation workflow
                with our state-of-the-art platform.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Made with love</span>
                </div>
                <span>•</span>
                <span>© {currentYear} DocCraft-AI</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/processor"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Document Processor
                  </Link>
                </li>
                <li>
                  <Link
                    to="/book-outliner"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Book Outliner
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Contact & Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/support"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Support Center</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@doccraft-ai.com"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Support</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+1-555-0123"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Us</span>
                  </a>
                </li>
                <li>
                  <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Us Button */}
          {showContactButton && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
                  Need help? We're here to assist you with any questions or
                  issues.
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/support"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                  <a
                    href="mailto:support@doccraft-ai.com"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
