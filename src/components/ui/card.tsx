// MCP Context Block
/*
{
  file: "ui/card.tsx",
  role: "ui-component",
  allowedActions: ["display", "style", "compose"],
  tier: "Free",
  contentSensitivity: "low",
  theme: "design_system"
}
*/

import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card component for displaying content in a bordered container.
 * Supports all standard div attributes and forwards refs.
 */
export const Card = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800 transition-shadow hover:shadow-md focus-within:shadow-lg ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

/**
 * CardContent component for the main content area of a card.
 * Provides consistent padding and supports all standard div attributes.
 */
export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`p-4 md:p-6 ${className}`} {...props} />;
  }
);
CardContent.displayName = 'CardContent';

/**
 * CardHeader component for the header area of a card.
 * Provides consistent padding and supports all standard div attributes.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 md:p-6 pb-0 ${className}`} {...props} />
    );
  }
);
CardHeader.displayName = 'CardHeader';

/**
 * CardFooter component for the footer area of a card.
 * Provides consistent padding and supports all standard div attributes.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 md:p-6 pt-0 ${className}`} {...props} />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// TODO: Add Jest tests for keyboard focus ring visibility and className passthrough.
