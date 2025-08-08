/**
 * @fileoverview Tests for ConfirmNarrationDialog component
 * @module src/components/__tests__/ConfirmNarrationDialog.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmNarrationDialog } from '../ConfirmNarrationDialog';

// Mock the component to avoid import issues
jest.mock('../ConfirmNarrationDialog', () => ({
  ConfirmNarrationDialog: jest.fn(),
}));

describe('ConfirmNarrationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultSummary = {
    genre: 'Science Fiction',
    voice: 'Emma',
    preview: 'This is a sample script preview...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Open/Close Functionality', () => {
    it('should not render when open is false', () => {
      render(
        <ConfirmNarrationDialog
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText('Confirm Narration Settings')
      ).toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Confirm Functionality', () => {
    it('should call onConfirm when Confirm button is clicked', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Summary Display', () => {
    it('should display genre and voice from summary', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      expect(screen.getByText('Genre:')).toBeInTheDocument();
      expect(screen.getByText('Science Fiction')).toBeInTheDocument();
      expect(screen.getByText('Voice:')).toBeInTheDocument();
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    it('should display preview when provided', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      expect(screen.getByText('Script Preview')).toBeInTheDocument();
      expect(
        screen.getByText(/This is a sample script preview/)
      ).toBeInTheDocument();
    });

    it('should not display preview section when preview is not provided', () => {
      const summaryWithoutPreview = {
        genre: 'Science Fiction',
        voice: 'Emma',
      };

      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={summaryWithoutPreview}
        />
      );

      expect(screen.queryByText('Script Preview')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        'narration-dialog-title'
      );
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'narration-dialog-description'
      );
    });

    it('should have proper button types', () => {
      render(
        <ConfirmNarrationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          summary={defaultSummary}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Confirm');

      expect(cancelButton).toHaveAttribute('type', 'button');
      expect(confirmButton).toHaveAttribute('type', 'button');
    });
  });
});
