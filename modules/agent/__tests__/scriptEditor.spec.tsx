/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/scriptEditor.spec.tsx",
allowedActions: ["test", "validate"],
theme: "script_editing_tests"
*/

/* MCP: script_editing_tests */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScriptEditor from '../components/ScriptEditor';
import { scriptEditingGuards } from '../mcpRegistry';

// Mock Supabase
jest.mock('../services/supabaseStorage', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('ScriptEditor Component', () => {
  const defaultProps = {
    pipelineId: 'test-pipeline-123',
    initialScript: 'This is a test script for video narration.',
    onApprove: jest.fn(),
    onEditAgain: jest.fn(),
    onCancel: jest.fn(),
    tier: 'Pro',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render script editor with initial script', () => {
      render(<ScriptEditor {...defaultProps} />);

      expect(screen.getByText('Review & Edit Script')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(defaultProps.initialScript)
      ).toBeInTheDocument();
    });

    it('should display word count and duration statistics', () => {
      render(<ScriptEditor {...defaultProps} />);

      expect(screen.getByText('8 words')).toBeInTheDocument();
      expect(screen.getByText('~1s')).toBeInTheDocument();
    });

    it('should show tier-based editing restrictions', () => {
      render(<ScriptEditor {...defaultProps} tier="Basic" />);

      expect(
        screen.getByText(
          'Script editing requires Pro tier. Upgrade to edit scripts.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Script Editing', () => {
    it('should allow editing for Pro tier users', () => {
      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      expect(textarea).not.toBeDisabled();
    });

    it('should disable editing for Basic tier users', () => {
      render(<ScriptEditor {...defaultProps} tier="Basic" />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      expect(textarea).toBeDisabled();
    });

    it('should update word count and duration when script changes', async () => {
      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      fireEvent.change(textarea, {
        target: {
          value:
            'This is a much longer test script with more words for testing purposes.',
        },
      });

      await waitFor(() => {
        expect(screen.getByText('12 words')).toBeInTheDocument();
        expect(screen.getByText('~1s')).toBeInTheDocument();
      });
    });

    it('should show changes indicator when script is modified', async () => {
      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      fireEvent.change(textarea, {
        target: { value: 'Modified script content.' },
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            '✏️ Script has been modified. Your changes will be used for narration.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should call onApprove when Approve & Narrate is clicked', () => {
      render(<ScriptEditor {...defaultProps} />);

      const approveButton = screen.getByText('Approve & Narrate');
      fireEvent.click(approveButton);

      expect(defaultProps.onApprove).toHaveBeenCalledWith(
        defaultProps.initialScript
      );
    });

    it('should call onEditAgain when Generate New Script is clicked', () => {
      render(<ScriptEditor {...defaultProps} />);

      const editAgainButton = screen.getByText('Generate New Script');
      fireEvent.click(editAgainButton);

      expect(defaultProps.onEditAgain).toHaveBeenCalled();
    });

    it('should call onCancel when Cancel is clicked', () => {
      render(<ScriptEditor {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should show Reset button when script has changes', async () => {
      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      fireEvent.change(textarea, { target: { value: 'Modified content.' } });

      await waitFor(() => {
        expect(screen.getByText('Reset to Original')).toBeInTheDocument();
      });
    });

    it('should reset script to original when Reset is clicked', async () => {
      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      fireEvent.change(textarea, { target: { value: 'Modified content.' } });

      await waitFor(() => {
        const resetButton = screen.getByText('Reset to Original');
        fireEvent.click(resetButton);
      });

      expect(
        screen.getByDisplayValue(defaultProps.initialScript)
      ).toBeInTheDocument();
    });
  });

  describe('Database Integration', () => {
    it('should store edited script in database when approved', async () => {
      const { supabase } = require('../services/supabaseStorage');

      render(<ScriptEditor {...defaultProps} />);

      const textarea = screen.getByDisplayValue(defaultProps.initialScript);
      fireEvent.change(textarea, {
        target: { value: 'Edited script content.' },
      });

      const approveButton = screen.getByText('Approve & Narrate');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('narrated_decks');
      });
    });
  });
});

describe('Script Editing Guards', () => {
  describe('canEditScript', () => {
    it('should allow Pro tier users to edit scripts', () => {
      expect(scriptEditingGuards.canEditScript('Pro')).toBe(true);
    });

    it('should allow Premium tier users to edit scripts', () => {
      expect(scriptEditingGuards.canEditScript('Premium')).toBe(true);
    });

    it('should deny Basic tier users from editing scripts', () => {
      expect(scriptEditingGuards.canEditScript('Basic')).toBe(false);
    });
  });

  describe('canResumePipeline', () => {
    it('should allow Pro tier users to resume hybrid pipelines', () => {
      expect(scriptEditingGuards.canResumePipeline('Pro', 'hybrid')).toBe(true);
    });

    it('should allow Pro tier users to resume manual pipelines', () => {
      expect(scriptEditingGuards.canResumePipeline('Pro', 'manual')).toBe(true);
    });

    it('should deny Basic tier users from resuming pipelines', () => {
      expect(scriptEditingGuards.canResumePipeline('Basic', 'hybrid')).toBe(
        false
      );
    });

    it('should deny auto mode pipeline resumption', () => {
      expect(scriptEditingGuards.canResumePipeline('Pro', 'auto')).toBe(false);
    });
  });

  describe('canPausePipeline', () => {
    it('should allow Pro tier users to pause hybrid pipelines', () => {
      expect(scriptEditingGuards.canPausePipeline('Pro', 'hybrid')).toBe(true);
    });

    it('should allow Pro tier users to pause manual pipelines', () => {
      expect(scriptEditingGuards.canPausePipeline('Pro', 'manual')).toBe(true);
    });

    it('should deny Basic tier users from pausing pipelines', () => {
      expect(scriptEditingGuards.canPausePipeline('Basic', 'hybrid')).toBe(
        false
      );
    });

    it('should deny auto mode pipeline pausing', () => {
      expect(scriptEditingGuards.canPausePipeline('Pro', 'auto')).toBe(false);
    });
  });
});

// TODO: Add comprehensive test coverage for the following scenarios:
//
// 1. Pipeline Pause/Resume Integration Tests:
//    - Test pipeline pausing after script generation in hybrid mode
//    - Test pipeline resuming with edited script
//    - Test pipeline resuming with original script
//    - Test error handling during pause/resume operations
//    - Test database state consistency during pause/resume
//
// 2. Real-time Subscription Tests:
//    - Test real-time updates when pipeline status changes to 'paused'
//    - Test script editor auto-opening when pipeline is paused
//    - Test subscription cleanup when pipeline completes
//    - Test error handling in real-time subscriptions
//
// 3. MCP Integration Tests:
//    - Test MCP role validation for script editing
//    - Test tier-based access control for pipeline operations
//    - Test MCP theme consistency across components
//    - Test allowed actions validation
//
// 4. Database Schema Tests:
//    - Test edited_script column storage and retrieval
//    - Test script_edited_at timestamp updates
//    - Test pipeline_id foreign key relationships
//    - Test script editing history view queries
//
// 5. User Experience Tests:
//    - Test script editor modal accessibility
//    - Test keyboard navigation in script editor
//    - Test responsive design on different screen sizes
//    - Test dark mode support
//    - Test loading states during pipeline operations
//
// 6. Error Handling Tests:
//    - Test network failures during script storage
//    - Test database connection failures
//    - Test invalid script content handling
//    - Test pipeline timeout scenarios
//    - Test rollback functionality on failures
//
// 7. Performance Tests:
//    - Test large script handling (10k+ words)
//    - Test concurrent pipeline operations
//    - Test memory usage during script editing
//    - Test real-time subscription performance
//
// 8. Security Tests:
//    - Test script content sanitization
//    - Test user permission validation
//    - Test SQL injection prevention
//    - Test XSS prevention in script content
//
// 9. Integration Tests:
//    - Test end-to-end pipeline with script editing
//    - Test TTS generation with edited scripts
//    - Test slide deck generation with script modifications
//    - Test complete workflow from document to final video
//
// 10. Edge Case Tests:
//     - Test empty script handling
//     - Test very long script handling
//     - Test special characters in scripts
//     - Test unicode character support
//     - Test script with multiple languages
