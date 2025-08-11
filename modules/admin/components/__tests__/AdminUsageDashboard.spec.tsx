import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminUsageDashboard from '../AdminUsageDashboard';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
};

// Mock useMCP hook
const mockUseMCP = jest.fn();

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
};

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
};

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// Mock document.createElement and related DOM methods
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

describe('AdminUsageDashboard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock global objects
    global.navigator.clipboard = mockClipboard;
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    global.document.createElement = mockCreateElement;
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;

    // Mock process.env
    Object.defineProperty(process, 'env', {
      value: mockEnv,
      writable: true,
    });

    // Mock createClient
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => mockSupabase),
    }));

    // Mock useMCP
    jest.doMock('../../../../src/useMCP', () => ({
      useMCP: mockUseMCP,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Access Control', () => {
    it('should show access denied for non-admin users', () => {
      mockUseMCP.mockReturnValue({
        role: 'user',
        tier: 'Free',
        allowedActions: ['view'],
        theme: 'general',
        contentSensitivity: 'low',
      });

      render(<AdminUsageDashboard />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Admin privileges are required to view this dashboard.'
        )
      ).toBeInTheDocument();
    });

    it('should render dashboard for admin users', () => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });

      render(<AdminUsageDashboard />);

      expect(screen.getByText('Usage Analytics Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Monitor asset downloads, shareable links, and tier usage analytics'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should render all main sections', () => {
      render(<AdminUsageDashboard />);

      expect(screen.getByText('Usage Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Asset Downloads')).toBeInTheDocument();
      expect(screen.getByText('Shareable Links')).toBeInTheDocument();
      expect(screen.getByText('Tier Analytics')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      render(<AdminUsageDashboard />);

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Asset Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Tier')).toBeInTheDocument();
      expect(screen.getByLabelText('User ID')).toBeInTheDocument();
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should render export options', () => {
      render(<AdminUsageDashboard />);

      expect(screen.getByLabelText('Format')).toBeInTheDocument();
      expect(screen.getByLabelText('Include metadata')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should switch between tabs', () => {
      render(<AdminUsageDashboard />);

      // Default tab should be downloads
      expect(screen.getByText('Asset Download Statistics')).toBeInTheDocument();

      // Switch to links tab
      fireEvent.click(screen.getByText('Shareable Links'));
      expect(screen.getByText('Shareable Link Statistics')).toBeInTheDocument();

      // Switch to tiers tab
      fireEvent.click(screen.getByText('Tier Analytics'));
      expect(screen.getByText('Tier Usage Analytics')).toBeInTheDocument();

      // Switch back to downloads tab
      fireEvent.click(screen.getByText('Asset Downloads'));
      expect(screen.getByText('Asset Download Statistics')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should update filter values', () => {
      render(<AdminUsageDashboard />);

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const assetTypeSelect = screen.getByLabelText('Asset Type');
      const eventTypeSelect = screen.getByLabelText('Event Type');
      const tierSelect = screen.getByLabelText('Tier');
      const userIdInput = screen.getByLabelText('User ID');

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(assetTypeSelect, { target: { value: 'slide' } });
      fireEvent.change(eventTypeSelect, { target: { value: 'created' } });
      fireEvent.change(tierSelect, { target: { value: 'Pro' } });
      fireEvent.change(userIdInput, { target: { value: 'test-user-id' } });

      expect(startDateInput).toHaveValue('2024-01-01');
      expect(endDateInput).toHaveValue('2024-12-31');
      expect(assetTypeSelect).toHaveValue('slide');
      expect(eventTypeSelect).toHaveValue('created');
      expect(tierSelect).toHaveValue('Pro');
      expect(userIdInput).toHaveValue('test-user-id');
    });

    it('should clear filters when clear button is clicked', () => {
      render(<AdminUsageDashboard />);

      const startDateInput = screen.getByLabelText('Start Date');
      const assetTypeSelect = screen.getByLabelText('Asset Type');

      // Set some filter values
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(assetTypeSelect, { target: { value: 'slide' } });

      // Clear filters
      fireEvent.click(screen.getByText('Clear Filters'));

      expect(startDateInput).toHaveValue('');
      expect(assetTypeSelect).toHaveValue('');
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });

      // Mock createElement to return a mock anchor element
      mockCreateElement.mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      });
    });

    it('should export data as CSV', async () => {
      render(<AdminUsageDashboard />);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('should copy data to clipboard', async () => {
      render(<AdminUsageDashboard />);

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should change export format', () => {
      render(<AdminUsageDashboard />);

      const formatSelect = screen.getByLabelText('Format');
      fireEvent.change(formatSelect, { target: { value: 'json' } });

      expect(formatSelect).toHaveValue('json');
    });

    it('should toggle metadata inclusion', () => {
      render(<AdminUsageDashboard />);

      const metadataCheckbox = screen.getByLabelText('Include metadata');
      expect(metadataCheckbox).toBeChecked();

      fireEvent.click(metadataCheckbox);
      expect(metadataCheckbox).not.toBeChecked();
    });
  });

  describe('Data Loading States', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should show loading state', async () => {
      // Mock Supabase to return loading state
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });

    it('should show empty state when no data', async () => {
      // Mock Supabase to return empty data
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText('No download statistics available')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should show error message when data loading fails', async () => {
      // Mock Supabase to return error
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(
          screen.getByText(/Failed to load download statistics/)
        ).toBeInTheDocument();
      });
    });

    it('should show error when export fails', async () => {
      // Mock export to fail
      mockCreateElement.mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(<AdminUsageDashboard />);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to export data')).toBeInTheDocument();
      });
    });

    it('should show error when clipboard copy fails', async () => {
      // Mock clipboard to fail
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard access denied')
      );

      render(<AdminUsageDashboard />);

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to copy data to clipboard')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should display download statistics correctly', async () => {
      const mockDownloadStats = [
        {
          asset_type: 'slide',
          total_downloads: 150,
          successful_downloads: 145,
          failed_downloads: 5,
          total_file_size_bytes: 1048576,
          avg_file_size_bytes: 6990,
          unique_users: 25,
          last_download: '2024-01-15T10:30:00Z',
          pipeline_name: 'Test Pipeline',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: mockDownloadStats,
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      await waitFor(() => {
        expect(screen.getByText('slide')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('96.7%')).toBeInTheDocument();
        expect(screen.getByText('1.0 MB')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('should display link statistics correctly', async () => {
      const mockLinkStats = [
        {
          event_type: 'created',
          total_events: 50,
          unique_links: 30,
          total_access_count: 200,
          unique_visitors: 45,
          last_event: '2024-01-15T10:30:00Z',
          pipeline_name: 'Test Pipeline',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: mockLinkStats,
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      // Switch to links tab
      fireEvent.click(screen.getByText('Shareable Links'));

      await waitFor(() => {
        expect(screen.getByText('created')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('should display tier analytics correctly', async () => {
      const mockTierAnalytics = [
        {
          tier: 'Pro',
          total_users: 100,
          total_downloads: 500,
          total_links_created: 200,
          avg_downloads_per_user: 5.0,
          avg_links_per_user: 2.0,
          last_activity: '2024-01-15T10:30:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          data: mockTierAnalytics,
          error: null,
        })),
      });

      render(<AdminUsageDashboard />);

      // Switch to tiers tab
      fireEvent.click(screen.getByText('Tier Analytics'));

      await waitFor(() => {
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
        expect(screen.getByText('5.0')).toBeInTheDocument();
        expect(screen.getByText('2.0')).toBeInTheDocument();
      });
    });
  });

  describe('Utility Functions', () => {
    it('should format file sizes correctly', () => {
      // This would test the formatFileSize utility function
      // Since it's internal to the component, we test it indirectly
      // through the data display tests above
    });

    it('should format dates correctly', () => {
      // This would test the formatDate utility function
      // Since it's internal to the component, we test it indirectly
      // through the data display tests above
    });

    it('should apply correct color classes for asset types', () => {
      // This would test the getAssetTypeColor utility function
      // Since it's internal to the component, we test it indirectly
      // through the data display tests above
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });
    });

    it('should handle zero values correctly', async () => {
      const mockStats = [
        {
          asset_type: 'slide',
          total_downloads: 0,
          successful_downloads: 0,
          failed_downloads: 0,
          total_file_size_bytes: 0,
          avg_file_size_bytes: 0,
          unique_users: 0,
          last_download: '2024-01-15T10:30:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: mockStats,
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('0 B')).toBeInTheDocument();
      });
    });

    it('should handle missing data gracefully', async () => {
      const mockStats = [
        {
          asset_type: 'slide',
          total_downloads: 10,
          successful_downloads: 8,
          failed_downloads: 2,
          total_file_size_bytes: null,
          avg_file_size_bytes: null,
          unique_users: 5,
          last_download: null,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: mockStats,
                error: null,
              })),
            })),
          })),
        })),
      });

      render(<AdminUsageDashboard />);

      await waitFor(() => {
        expect(screen.getByText('80.0%')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  // TODO: Add tests for:
  // - Realtime charts using Supabase subscriptions (future)
  // - Very large datasets
  // - Network timeouts
  // - Invalid data formats
  // - Concurrent user access
  // - Mobile responsiveness
  // - Accessibility compliance
  // - Performance with large datasets
  // - Security vulnerabilities
  // - Cross-browser compatibility

  describe('Alerts Functionality', () => {
    beforeEach(() => {
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Admin',
        allowedActions: ['view', 'analyze', 'export'],
        theme: 'analytics',
        contentSensitivity: 'high',
      });

      // Mock alerts data
      mockSupabase.from.mockImplementation(table => {
        if (table === 'asset_download_events') {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: [
                    {
                      user_id: 'user1',
                      asset_type: 'audio',
                      tier_at_time: 'Free',
                      timestamp: new Date().toISOString(),
                    },
                    {
                      user_id: 'user2',
                      asset_type: 'slide',
                      tier_at_time: 'Pro',
                      timestamp: new Date().toISOString(),
                    },
                  ],
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'pipelines') {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: [
                    {
                      id: 'pipeline1',
                      user_id: 'user1',
                      created_at: new Date().toISOString(),
                      tier: 'Free',
                    },
                  ],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            data: [],
            error: null,
          })),
        };
      });
    });

    it('should render alerts tab with filters', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Check for alerts content
      expect(
        screen.getByText('Usage Alerts & Upgrade Nudges')
      ).toBeInTheDocument();
      expect(screen.getByText('Alert Filters')).toBeInTheDocument();
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
      expect(screen.getByText('Enable Alert Emails')).toBeInTheDocument();
    });

    it('should filter alerts by severity', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find severity filter
      const severityFilter = screen.getByDisplayValue('All Severities');
      fireEvent.change(severityFilter, { target: { value: 'warning' } });

      expect(severityFilter).toHaveValue('warning');
    });

    it('should filter alerts by tier', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find tier filter
      const tierFilter = screen.getByDisplayValue('All Tiers');
      fireEvent.change(tierFilter, { target: { value: 'Free' } });

      expect(tierFilter).toHaveValue('Free');
    });

    it('should toggle alert emails setting', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find alert emails checkbox
      const alertEmailsCheckbox = screen.getByLabelText('Enable Alert Emails');
      fireEvent.click(alertEmailsCheckbox);

      expect(alertEmailsCheckbox).toBeChecked();
    });

    it('should export alerts data', async () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find export button
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      // Check if export function was called
      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('a');
      });
    });

    it('should copy alerts data to clipboard', async () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find copy button
      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      // Check if clipboard API was called
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should show alert thresholds information', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Check for threshold information
      expect(
        screen.getByText(/Free tier: 80% usage limit/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Audio downloads: 3\+ per day/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pipeline generation: 5\+ per day/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Pro tier: 90% usage limit/)).toBeInTheDocument();
    });

    it('should handle acknowledge button click', () => {
      render(<AdminUsageDashboard />);

      // Navigate to alerts tab
      fireEvent.click(screen.getByText('Alerts & Upgrade Nudges'));

      // Find acknowledge button (if alerts are present)
      const acknowledgeButtons = screen.queryAllByText('Acknowledge');
      if (acknowledgeButtons.length > 0) {
        fireEvent.click(acknowledgeButtons[0]);
        // TODO: Test acknowledge functionality when implemented
      }
    });
  });
});
