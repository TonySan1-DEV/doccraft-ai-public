# Admin Module

## Overview

The Admin module provides administrative tools and analytics dashboards for monitoring and managing the DocCraft-AI system. This module includes components for viewing audit logs, usage analytics, and system performance metrics.

## Components

### AdminUsageDashboard

A comprehensive analytics dashboard for administrators to monitor:

- **Asset Download Statistics**: Track downloads of slide decks, scripts, and audio files
- **Shareable Link Analytics**: Monitor link creation and access patterns
- **Tier Usage Analytics**: Analyze usage patterns across different subscription tiers

#### Features

- **Multi-tab Interface**: Organized analytics views for different data types
- **Advanced Filtering**: Date ranges, asset types, event types, tiers, and user filters
- **Export Capabilities**: CSV and JSON export with metadata options
- **Clipboard Integration**: Quick copy functionality for data sharing
- **Access Control**: Admin-only access with MCP integration
- **Responsive Design**: Dark mode compatible and mobile-responsive layout

#### Usage

```tsx
import { AdminUsageDashboard } from '../modules/admin';

// The component automatically handles access control
// Only users with admin role/tier can view the dashboard
<AdminUsageDashboard />;
```

#### Access Requirements

- **Role**: `admin`
- **Tier**: `Admin`
- **Allowed Actions**: `view`, `analyze`, `export`
- **Content Sensitivity**: `high`

## Database Integration

### Views Utilized

1. **`asset_download_stats`**: Aggregated download statistics
2. **`sharable_link_stats`**: Link creation and access analytics
3. **`tier_usage_analytics`**: Tier-based usage patterns

### Security

- **Service Role Access**: Secure database access using service role key
- **Read-only Queries**: No data modification capabilities
- **RLS Compliance**: Row-level security policies enforced
- **Audit Trail**: All access is logged for compliance

## Testing

### Test Coverage

The admin module includes comprehensive Jest tests covering:

- **Access Control**: Admin vs non-admin user scenarios
- **Component Rendering**: All UI elements and sections
- **Tab Navigation**: Switching between analytics views
- **Filter Functionality**: All filter types and combinations
- **Export Features**: CSV/JSON export and clipboard copy
- **Data Loading**: Loading states and error handling
- **Data Display**: Correct rendering of analytics data
- **Edge Cases**: Zero values, missing data, error scenarios

### Running Tests

```bash
# Run admin module tests
npm test modules/admin

# Run specific test file
npm test AdminUsageDashboard.spec.tsx
```

## Future Enhancements

### Planned Features

1. **Real-time Charts**: Supabase subscriptions for live updates
2. **Advanced Analytics**: Trend analysis and predictions
3. **Custom Dashboards**: User-configurable layouts
4. **Alert System**: Usage threshold notifications
5. **API Integration**: External analytics tools

### Technical Improvements

1. **Performance Monitoring**: Query performance tracking
2. **Caching Layer**: Redis-based caching
3. **Data Archiving**: Historical data management
4. **Export Scheduling**: Automated report generation

## MCP Compliance

The admin module follows the MCP (Managed Control Plane) framework:

- **Role-based Access**: Admin-only functionality
- **Action Permissions**: View, analyze, export capabilities
- **Content Sensitivity**: High-security data handling
- **Theme Integration**: Analytics-focused UI

## Security Considerations

### Data Privacy

- **GDPR Compliance**: User data protection
- **Audit Logging**: Complete access tracking
- **Data Retention**: Configurable retention policies
- **Access Controls**: Role-based permissions

### Security Measures

- **Input Validation**: Filter sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Output sanitization
- **CSRF Protection**: Request validation

## Performance

### Optimization Strategies

1. **Lazy Loading**: Data loaded only when needed
2. **Memoized Queries**: Cached filter results
3. **Efficient Rendering**: Virtual scrolling for large datasets
4. **Optimized Queries**: Database-level aggregation

### Scalability

- **Database Views**: Pre-computed aggregations
- **Indexed Queries**: Fast data retrieval
- **Pagination**: Support for large datasets
- **Caching**: Client-side data caching

## Dependencies

- **React**: UI framework
- **TypeScript**: Type safety
- **Supabase**: Database and authentication
- **Tailwind CSS**: Styling
- **Jest**: Testing framework

## Contributing

When contributing to the admin module:

1. **Follow MCP Guidelines**: Ensure all components follow MCP compliance
2. **Add Tests**: Include comprehensive Jest tests for new features
3. **Document Changes**: Update documentation for any new components
4. **Security Review**: Ensure all security measures are maintained
5. **Performance Testing**: Verify performance impact of changes

## License

This module is part of the DocCraft-AI project and follows the same licensing terms.
