// examples/ContextAwareButton.tsx
import React from 'react';
import { useMCP } from '../src/useMCP';

export default function ContextAwareButton() {
  const ctx = useMCP('components/DocumentEditor.tsx');

  if (!ctx.allowedActions.includes('enhance')) return null;

  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Enhance Text (Context: {ctx.role})
    </button>
  );
}
