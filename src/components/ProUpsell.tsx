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

interface ProUpsellProps {
  message?: string;
  onUpgrade?: () => void;
  className?: string;
  loading?: boolean;
}

/**
 * Minimal, accessible Pro upsell banner.
 * - Use `onUpgrade` to open billing/upgrade flow.
 * - Keep UI lightweight; do not block core flows.
 *
 * TODO:
 * - Replace with your app's design system component when available.
 * - Add analytics event on Upgrade click.
 */
export const ProUpsell: React.FC<ProUpsellProps> = ({
  message = 'This is a Pro feature. Upgrade to unlock.',
  onUpgrade,
  className = '',
  loading = false,
}) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm md:text-base">{message}</p>
        <button
          type="button"
          onClick={onUpgrade}
          disabled={loading}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onUpgrade?.();
            }
          }}
          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium border border-amber-300 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-transparent dark:hover:bg-amber-900/30 dark:focus:ring-amber-400"
        >
          {loading ? 'Upgrading...' : 'Upgrade to Pro'}
        </button>
      </div>
    </div>
  );
};
