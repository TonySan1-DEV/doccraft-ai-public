// MCP Context Block
/*
{
  file: "ProUpsell.tsx",
  role: "ui-component",
  allowedActions: ["display", "interact", "suggest"],
  tier: "Free",
  contentSensitivity: "low",
  theme: "upsell"
}
*/

import * as React from 'react';

/**
 * Props for the ProUpsell component
 */
interface ProUpsellProps {
  /** Custom message to display */
  message?: string;
  /** Callback when upgrade button is clicked */
  onUpgrade?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Whether the upgrade process is in progress */
  loading?: boolean;
  /** Variant of the upsell component */
  variant?: 'banner' | 'card' | 'inline';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Minimal, accessible Pro upsell banner.
 *
 * @remarks
 * - Use `onUpgrade` to open billing/upgrade flow
 * - Keep UI lightweight; do not block core flows
 * - Supports keyboard navigation and screen readers
 * - Responsive design with dark mode support
 *
 * @example
 * ```tsx
 * <ProUpsell
 *   message="Unlock advanced features"
 *   onUpgrade={() => openBilling()}
 * />
 * ```
 */
export const ProUpsell: React.FC<ProUpsellProps> = ({
  message = 'This is a Pro feature. Upgrade to unlock.',
  onUpgrade,
  className = '',
  loading = false,
  variant = 'banner',
  size = 'md',
}) => {
  const variantClasses = {
    banner:
      'rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
    card: 'rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800 shadow-md',
    inline:
      'rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
  };

  return (
    <div
      role="alert"
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={sizeClasses[size]}>{message}</p>
        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            disabled={loading}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onUpgrade?.();
              }
            }}
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium border border-amber-300 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-transparent dark:hover:bg-amber-900/30 dark:focus:ring-amber-400"
          >
            {loading ? 'Upgrading...' : 'Upgrade to Pro'}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * TODO: Replace with your app's design system component when available.
 * TODO: Add analytics event on Upgrade click.
 */
