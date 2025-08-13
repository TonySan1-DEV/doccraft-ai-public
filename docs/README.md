# DocCraft-AI API Documentation

Welcome to the comprehensive API documentation for DocCraft-AI, the world-class AI writing platform with a revolutionary mode system. This documentation is designed to enable enterprise adoption and third-party integrations with our cutting-edge AI technology.

## 🚀 Quick Start

- **[OpenAPI Specification](api/openapi.yaml)** - Complete API schema in OpenAPI 3.0.3 format
- **[Interactive Documentation](components/ApiDocumentation.tsx)** - Modern, responsive documentation interface
- **[Integration Examples](guides/integration-examples.ts)** - Code examples in multiple programming languages
- **[Postman Collection](postman/DocCraft-AI-API.postman_collection.json)** - Ready-to-use API testing collection

## 🌟 Revolutionary Features

### Three AI Modes

- **MANUAL**: Complete user control - AI responds only to explicit requests
- **HYBRID**: Collaborative assistance with contextual suggestions and user control
- **FULLY_AUTO**: Proactive AI with comprehensive assistance and real-time optimization

### Performance Excellence

- **Sub-500ms response times** with intelligent caching
- **Advanced performance analytics** and monitoring
- **Enterprise-grade scalability** and reliability

### Enterprise Security

- **GDPR compliant** with comprehensive audit logging
- **API key authentication** with secure header-based auth
- **Rate limiting** and usage monitoring

## 📚 Documentation Sections

### 1. [OpenAPI Specification](api/openapi.yaml)

Complete API schema including:

- All endpoints with detailed descriptions
- Request/response schemas and examples
- Authentication and security details
- Error handling specifications

### 2. [Interactive Documentation](components/ApiDocumentation.tsx)

Modern React-based documentation featuring:

- Responsive design with sidebar navigation
- Code examples with syntax highlighting
- Interactive endpoint testing
- Performance metrics display

### 3. [Integration Guides](guides/integration-examples.ts)

Comprehensive code examples in:

- **JavaScript/TypeScript** - Official SDK with advanced patterns
- **Python** - Async support and performance optimization
- **Node.js** - Event-driven processing and streaming
- **PHP** - Composer-based integration
- **Go** - High-performance concurrent processing

### 4. [Postman Collection](postman/DocCraft-AI-API.postman_collection.json)

Ready-to-use API testing including:

- Pre-configured requests for all endpoints
- Environment variables for easy setup
- Automated testing scripts
- Performance monitoring examples

## 🔑 Authentication

All API requests require authentication using an API key in the `X-API-Key` header:

```bash
curl -X POST https://api.doccraft-ai.com/v3/ai/process \
  -H "X-API-Key: dca_live_your_api_key_here" \
  -H "X-Mode: HYBRID" \
  -H "Content-Type: application/json" \
  -d '{"type": "content-enhancement", "content": "Your content here"}'
```

## 🎯 Core Endpoints

### AI Processing (`/ai/process`)

Process writing requests through our revolutionary mode-aware AI system:

```json
{
  "type": "content-enhancement",
  "content": "Your content here",
  "context": {
    "genre": "business-writing",
    "tone": "professional"
  },
  "options": {
    "enhanceEmotion": true,
    "improvePacing": true
  }
}
```

### Emotional Analysis (`/ai/emotional-arc`)

Analyze emotional journey and sentiment progression:

```json
{
  "content": "Your narrative content",
  "analysisDepth": "comprehensive",
  "context": {
    "genre": "drama",
    "targetEmotion": "melancholy"
  }
}
```

### Mode Configuration (`/ai/mode/configure`)

Customize AI behavior for your application:

```json
{
  "mode": "HYBRID",
  "settings": {
    "initiativeLevel": "responsive",
    "userControlLevel": 75,
    "interventionStyle": "balanced"
  }
}
```

### Performance Analytics (`/analytics/performance`)

Monitor system performance and usage metrics:

```bash
GET /analytics/performance?startDate=2024-01-01&endDate=2024-01-31&mode=HYBRID
```

## 🚀 Getting Started

### 1. Get Your API Key

Visit the [DocCraft-AI Dashboard](https://doccraft-ai.com/dashboard/api-keys) to obtain your API key.

### 2. Choose Your Integration Method

- **SDK Integration**: Use our official SDKs for the fastest setup
- **Direct API**: Make HTTP requests directly to our REST endpoints
- **Postman Testing**: Import our collection for immediate testing

### 3. Make Your First Request

```javascript
import { DocCraftAI } from '@doccraft-ai/sdk';

const client = new DocCraftAI({
  apiKey: 'dca_live_your_api_key_here',
  mode: 'HYBRID',
});

const result = await client.ai.enhance({
  content: 'The old lighthouse stood on the cliff.',
  type: 'content-enhancement',
  context: {
    genre: 'creative-fiction',
    tone: 'mysterious',
  },
});

console.log('Enhanced content:', result.content);
console.log('Processing time:', result.performance.processingTime, 'ms');
```

## 📊 Performance Metrics

Our API consistently delivers:

- **Response Time**: < 500ms average
- **Cache Hit Rate**: 85%+ for repeated content
- **Uptime**: 99.9% SLA
- **Throughput**: 10,000+ requests per minute

## 🔧 Error Handling

Comprehensive error handling with detailed error codes:

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}
```

Common error codes:

- `UNAUTHORIZED` - Invalid or missing API key
- `RATE_LIMITED` - Rate limit exceeded
- `INVALID_REQUEST` - Malformed request parameters
- `INTERNAL_ERROR` - Server-side error

## 🧪 Testing & Development

### Postman Collection

1. Download our [Postman collection](postman/DocCraft-AI-API.postman_collection.json)
2. Import into Postman
3. Set your API key in environment variables
4. Start testing all endpoints

### Automated Testing

Our Postman collection includes automated tests for:

- Response status validation
- Performance metrics verification
- Response structure validation
- Error handling scenarios

## 🌐 SDKs & Libraries

### Official SDKs

- **[JavaScript/TypeScript](guides/integration-examples.ts#javascript)** - `npm install @doccraft-ai/sdk`
- **[Python](guides/integration-examples.ts#python)** - `pip install doccraft-ai`
- **[Go](guides/integration-examples.ts#go)** - `go get github.com/doccraft-ai/go-sdk`

### Community SDKs

- **PHP** - `composer require doccraft-ai/php-sdk`
- **Ruby** - `gem install doccraft-ai`
- **Java** - Available via Maven Central

## 📈 Enterprise Features

### Advanced Analytics

- Real-time performance monitoring
- Usage analytics and reporting
- Custom dashboard integration
- Webhook notifications

### Security & Compliance

- GDPR compliance
- SOC 2 Type II certification
- Enterprise SSO integration
- Advanced audit logging

### Support & SLA

- 24/7 technical support
- 99.9% uptime SLA
- Dedicated account management
- Custom integration assistance

## 🤝 Community & Support

### Documentation

- [API Reference](api/openapi.yaml)
- [Integration Examples](guides/integration-examples.ts)
- [Best Practices](guides/best-practices.md)
- [Troubleshooting](guides/troubleshooting.md)

### Support Channels

- **Email**: api-support@doccraft-ai.com
- **Documentation**: [docs.doccraft-ai.com](https://docs.doccraft-ai.com)
- **Community**: [community.doccraft-ai.com](https://community.doccraft-ai.com)
- **Status Page**: [status.doccraft-ai.com](https://status.doccraft-ai.com)

### Contributing

We welcome contributions to our documentation and SDKs:

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Issue Templates](ISSUE_TEMPLATE.md)

## 📄 License

This documentation is licensed under the [MIT License](LICENSE). The DocCraft-AI API itself is proprietary software licensed by DocCraft-AI Inc.

## 🔄 Changelog

### v3.0.0 (2024-12-01)

- ✨ Revolutionary three-mode AI system
- 🚀 Sub-500ms response times
- 🔒 Enhanced security and compliance
- 📊 Comprehensive performance analytics
- 🌐 Multi-language SDK support

### v2.1.0 (2024-11-15)

- 🔧 Improved error handling
- 📈 Enhanced performance monitoring
- 🎯 Better mode configuration options

### v2.0.0 (2024-10-01)

- 🎉 Complete API redesign
- 🚀 Performance optimizations
- 🔒 Enhanced authentication system

---

**Ready to revolutionize your writing with AI?** [Get started today](https://doccraft-ai.com/get-started) with DocCraft-AI's revolutionary mode system and experience the future of AI-powered writing assistance.

For questions or support, contact us at [api-support@doccraft-ai.com](mailto:api-support@doccraft-ai.com).
