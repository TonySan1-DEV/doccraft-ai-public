import React from 'react';

export class MonitoringBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    /* optional: report to console or a logger */
  }
  render() {
    return this.state.hasError ? null : (this.props.children as any);
  }
}
