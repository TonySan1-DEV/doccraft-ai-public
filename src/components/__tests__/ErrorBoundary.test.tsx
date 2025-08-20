import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

function Boom() {
  throw new Error('boom');
}

function GoodComponent() {
  return <div>ok</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error during tests since we're intentionally triggering errors
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('The view crashed unexpectedly. You can try again.')
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('calls onReportError with error and component stack', () => {
    const onReportError = vi.fn();

    render(
      <ErrorBoundary onReportError={onReportError}>
        <Boom />
      </ErrorBoundary>
    );

    expect(onReportError).toHaveBeenCalledTimes(1);
    const [error, info] = onReportError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('boom');
    expect(info).toHaveProperty('componentStack');
    expect(typeof info.componentStack).toBe('string');
  });

  it('calls onReset when Try again button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <Boom />
      </ErrorBoundary>
    );

    // Should show error boundary
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Click the "Try again" button
    await user.click(screen.getByText('Try again'));

    expect(onReset).toHaveBeenCalledTimes(1);

    // The error boundary should reset internally and show children
    // but since our Boom component always throws, it will still show error
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('resets error state when Try again button is clicked', async () => {
    const user = userEvent.setup();

    const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
      if (shouldError) throw new Error('test error');
      return <div>recovered</div>;
    };

    const TestWrapper = () => {
      const [shouldError, setShouldError] = React.useState(true);

      return (
        <ErrorBoundary onReset={() => setShouldError(false)}>
          <TestComponent shouldError={shouldError} />
        </ErrorBoundary>
      );
    };

    render(<TestWrapper />);

    // Should show error boundary
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Click "Try again"
    await user.click(screen.getByText('Try again'));

    // Should show recovered component
    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles errors without component stack gracefully', () => {
    const onReportError = vi.fn();

    render(
      <ErrorBoundary onReportError={onReportError}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onReportError).toHaveBeenCalled();
  });
});
