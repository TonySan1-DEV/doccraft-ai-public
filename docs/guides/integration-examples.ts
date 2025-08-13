export const integrationExamples = {
  javascript: {
    installation: `npm install @doccraft-ai/sdk`,
    basicUsage: `
import { DocCraftAI } from '@doccraft-ai/sdk';

const client = new DocCraftAI({
  apiKey: 'dca_live_your_api_key_here',
  mode: 'HYBRID' // or 'MANUAL', 'FULLY_AUTO'
});

// Enhance content
const result = await client.ai.enhance({
  content: 'Your content here',
  type: 'content-enhancement',
  context: {
    genre: 'business-writing',
    tone: 'professional'
  }
});

console.log(result.content); // Enhanced content
console.log(result.enhancements); // Applied enhancements
console.log(result.performance.processingTime); // < 500ms
    `,
    advancedUsage: `
// Advanced emotional arc analysis
const emotionalAnalysis = await client.ai.analyzeEmotionalArc({
  content: 'Your story content here',
  analysisDepth: 'comprehensive'
});

// Mode-aware processing
const manualResult = await client.withMode('MANUAL').ai.enhance({
  content: 'Content for manual processing',
  explicitUserInitiated: true
});

// Batch processing with performance monitoring
const batchResults = await client.ai.batchProcess([
  { content: 'Content 1', type: 'content-enhancement' },
  { content: 'Content 2', type: 'emotional-analysis' }
], {
  concurrency: 3,
  trackPerformance: true
});

// Real-time mode switching
const hybridClient = client.withMode('HYBRID');
const autoClient = client.withMode('FULLY_AUTO');

// Process same content with different modes
const [hybridResult, autoResult] = await Promise.all([
  hybridClient.ai.enhance({ content: 'Test content', type: 'content-enhancement' }),
  autoClient.ai.enhance({ content: 'Test content', type: 'content-enhancement' })
]);

console.log('Hybrid mode processing time:', hybridResult.performance.processingTime);
console.log('Auto mode processing time:', autoResult.performance.processingTime);
    `,
    errorHandling: `
// Comprehensive error handling
try {
  const result = await client.ai.enhance({
    content: 'Your content here',
    type: 'content-enhancement'
  });
  
  if (result.success) {
    console.log('Content enhanced successfully');
    console.log('Processing time:', result.performance.processingTime);
    console.log('Cache hit:', result.performance.cacheHit);
  }
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    console.log('Rate limit exceeded. Retry after:', error.retryAfter);
  } else if (error.code === 'UNAUTHORIZED') {
    console.log('Invalid API key. Please check your credentials.');
  } else if (error.code === 'INVALID_REQUEST') {
    console.log('Invalid request parameters:', error.details);
  } else {
    console.log('Unexpected error:', error.message);
  }
}

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'RATE_LIMITED' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
    `,
    performanceOptimization: `
// Performance optimization with caching
const cache = new Map();

const getCachedResult = async (content, options) => {
  const cacheKey = JSON.stringify({ content, options });
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes
      return { ...cached.result, performance: { ...cached.result.performance, cacheHit: true } };
    }
  }
  
  const result = await client.ai.enhance({ content, ...options });
  cache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
};

// Batch processing with rate limiting
const processBatchWithRateLimit = async (contents, options = {}) => {
  const batchSize = 5; // Process 5 at a time
  const delay = 100; // 100ms between batches
  
  const results = [];
  
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(content => getCachedResult(content, options))
    );
    
    results.push(...batchResults);
    
    if (i + batchSize < contents.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};
    `,
  },

  python: {
    installation: `pip install doccraft-ai`,
    basicUsage: `
from doccraft_ai import DocCraftAI

client = DocCraftAI(
    api_key='dca_live_your_api_key_here',
    mode='HYBRID'
)

# Enhance content
result = client.ai.enhance(
    content='Your content here',
    type='content-enhancement',
    context={
        'genre': 'academic-writing',
        'tone': 'scholarly'
    }
)

print(result.content)  # Enhanced content
print(f"Processing time: {result.performance.processing_time}ms")
    `,
    advancedUsage: `
# Async processing for better performance
import asyncio

async def process_content():
    async with DocCraftAI(api_key='your_key') as client:
        tasks = [
            client.ai.enhance(content=content, type='content-enhancement')
            for content in content_list
        ]
        results = await asyncio.gather(*tasks)
        return results

# Context-aware emotional analysis
emotional_arc = client.ai.analyze_emotional_arc(
    content='Your narrative content',
    analysis_depth='comprehensive',
    context={'genre': 'drama', 'target_emotion': 'melancholy'}
)

# Mode-specific processing
manual_client = client.with_mode('MANUAL')
hybrid_client = client.with_mode('HYBRID')
auto_client = client.with_mode('FULLY_AUTO')

# Compare results across modes
mode_results = {}
for mode_name, mode_client in [('manual', manual_client), ('hybrid', hybrid_client), ('auto', auto_client)]:
    result = mode_client.ai.enhance(
        content='Test content for mode comparison',
        type='content-enhancement'
    )
    mode_results[mode_name] = {
        'processing_time': result.performance.processing_time,
        'enhancements_count': len(result.enhancements),
        'suggestions_count': len(result.suggestions)
    }

print("Mode comparison results:", mode_results)
    `,
    errorHandling: `
# Comprehensive error handling
from doccraft_ai.exceptions import (
    DocCraftAIError, RateLimitError, AuthenticationError, ValidationError
)

try:
    result = client.ai.enhance(
        content='Your content here',
        type='content-enhancement'
    )
    
    if result.success:
        print(f"Content enhanced successfully in {result.performance.processing_time}ms")
        print(f"Cache hit: {result.performance.cache_hit}")
        print(f"Mode used: {result.performance.mode}")
        
except RateLimitError as e:
    print(f"Rate limit exceeded. Retry after {e.retry_after} seconds")
    
except AuthenticationError as e:
    print("Authentication failed. Please check your API key.")
    
except ValidationError as e:
    print(f"Validation error: {e.details}")
    
except DocCraftAIError as e:
    print(f"API error: {e.message} (Code: {e.code})")
    
except Exception as e:
    print(f"Unexpected error: {str(e)}")

# Retry decorator for rate limiting
import time
from functools import wraps

def retry_on_rate_limit(max_retries=3, base_delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try {
                    return func(*args, **kwargs)
                } catch (RateLimitError as e):
                    if attempt == max_retries - 1:
                        raise
                    delay = base_delay * (2 ** attempt)
                    print(f"Rate limited. Retrying in {delay} seconds...")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@retry_on_rate_limit(max_retries=3, base_delay=1)
def enhance_with_retry(content, **kwargs):
    return client.ai.enhance(content=content, **kwargs)
    `,
    performanceOptimization: `
# Performance optimization with caching
import hashlib
import json
from datetime import datetime, timedelta

class ContentCache:
    def __init__(self, ttl_minutes=5):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)
    
    def _get_cache_key(self, content, options):
        content_hash = hashlib.md5(content.encode()).hexdigest()
        options_hash = hashlib.md5(json.dumps(options, sort_keys=True).encode()).hexdigest()
        return f"{content_hash}:{options_hash}"
    
    def get(self, content, options):
        key = self._get_cache_key(content, options)
        if key in self.cache:
            cached_item = self.cache[key]
            if datetime.now() - cached_item['timestamp'] < self.ttl:
                # Return cached result with cache hit indicator
                result = cached_item['result']
                result.performance.cache_hit = True
                return result
            else:
                del self.cache[key]
        return None
    
    def set(self, content, options, result):
        key = self._get_cache_key(content, options)
        self.cache[key] = {
            'result': result,
            'timestamp': datetime.now()
        }
    
    def clear_expired(self):
        now = datetime.now()
        expired_keys = [
            key for key, item in self.cache.items()
            if now - item['timestamp'] >= self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]

# Usage with caching
cache = ContentCache(ttl_minutes=5)

def enhance_with_cache(content, **options):
    # Check cache first
    cached_result = cache.get(content, options)
    if cached_result:
        print("Served from cache!")
        return cached_result
    
    # Process with AI
    result = client.ai.enhance(content=content, **options)
    
    # Cache the result
    cache.set(content, options, result)
    
    return result

# Batch processing with concurrency control
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def process_batch_concurrent(contents, max_workers=3, **options):
    semaphore = asyncio.Semaphore(max_workers)
    
    async def process_single(content):
        async with semaphore:
            return await enhance_with_cache(content, **options)
    
    tasks = [process_single(content) for content in contents]
    results = await asyncio.gather(*tasks)
    
    return results

# Performance monitoring
class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'total_processing_time': 0,
            'mode_usage': {'MANUAL': 0, 'HYBRID': 0, 'FULLY_AUTO': 0}
        }
    
    def record_request(self, result):
        self.metrics['total_requests'] += 1
        self.metrics['total_processing_time'] += result.performance.processing_time
        
        if result.performance.cache_hit:
            self.metrics['cache_hits'] += 1
        else:
            self.metrics['cache_misses'] += 1
        
        mode = result.performance.mode
        if mode in self.metrics['mode_usage']:
            self.metrics['mode_usage'][mode] += 1
    
    def get_stats(self):
        avg_time = (self.metrics['total_processing_time'] / 
                   self.metrics['total_requests'] if self.metrics['total_requests'] > 0 else 0)
        
        cache_hit_rate = (self.metrics['cache_hits'] / 
                         self.metrics['total_requests'] if self.metrics['total_requests'] > 0 else 0)
        
        return {
            'average_processing_time': round(avg_time, 2),
            'cache_hit_rate': round(cache_hit_rate, 3),
            'total_requests': self.metrics['total_requests'],
            'mode_usage': self.metrics['mode_usage']
        }

# Usage with performance monitoring
monitor = PerformanceMonitor()

def enhance_with_monitoring(content, **options):
    result = enhance_with_cache(content, **options)
    monitor.record_request(result)
    return result

# Print performance stats periodically
def print_performance_stats():
    stats = monitor.get_stats()
    print(f"Performance Stats:")
    print(f"  Avg Processing Time: {stats['average_processing_time']}ms")
    print(f"  Cache Hit Rate: {stats['cache_hit_rate']:.1%}")
    print(f"  Total Requests: {stats['total_requests']}")
    print(f"  Mode Usage: {stats['mode_usage']}")
    `,
  },

  python_async: {
    installation: `pip install doccraft-ai[async]`,
    basicUsage: `
import asyncio
from doccraft_ai import AsyncDocCraftAI

async def main():
    async with AsyncDocCraftAI(api_key='your_key') as client:
        # Basic content enhancement
        result = await client.ai.enhance(
            content='Your content here',
            type='content-enhancement',
            context={'genre': 'creative-fiction', 'tone': 'mysterious'}
        )
        
        print(f"Enhanced content: {result.content}")
        print(f"Processing time: {result.performance.processing_time}ms")
        print(f"Mode used: {result.performance.mode}")

# Run the async function
asyncio.run(main())
    `,
    advancedUsage: `
# Advanced async patterns
import asyncio
from typing import List
from doccraft_ai import AsyncDocCraftAI

class AsyncDocCraftProcessor:
    def __init__(self, api_key: str, max_concurrent: int = 5):
        self.client = AsyncDocCraftAI(api_key=api_key)
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def process_content_batch(self, contents: List[str], **options):
        """Process multiple contents concurrently with rate limiting"""
        async def process_single(content: str):
            async with self.semaphore:
                return await self.client.ai.enhance(
                    content=content,
                    type='content-enhancement',
                    **options
                )
        
        tasks = [process_single(content) for content in contents]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Error processing content {i}: {result}")
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def analyze_emotional_arcs(self, contents: List[str]):
        """Analyze emotional arcs for multiple contents"""
        async def analyze_single(content: str):
            async with self.semaphore:
                return await self.client.ai.analyze_emotional_arc(
                    content=content,
                    analysis_depth='comprehensive'
                )
        
        tasks = [analyze_single(content) for content in contents]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def mode_comparison_analysis(self, content: str):
        """Compare AI behavior across different modes"""
        modes = ['MANUAL', 'HYBRID', 'FULLY_AUTO']
        
        async def test_mode(mode: str):
            mode_client = self.client.with_mode(mode)
            return await mode_client.ai.enhance(
                content=content,
                type='content-enhancement'
            )
        
        tasks = [test_mode(mode) for mode in modes]
        results = await asyncio.gather(*tasks)
        
        comparison = {}
        for mode, result in zip(modes, results):
            comparison[mode] = {
                'processing_time': result.performance.processing_time,
                'enhancements_count': len(result.enhancements),
                'suggestions_count': len(result.suggestions),
                'content_length': len(result.content)
            }
        
        return comparison

# Usage example
async def main():
    processor = AsyncDocCraftProcessor(api_key='your_key', max_concurrent=3)
    
    contents = [
        "The old lighthouse stood on the cliff.",
        "She walked through the empty house, memories flooding back.",
        "The quarterly report showed promising growth trends."
    ]
    
    # Process batch
    print("Processing content batch...")
    batch_results = await processor.process_content_batch(
        contents,
        context={'genre': 'mixed', 'tone': 'neutral'}
    )
    
    # Analyze emotional arcs
    print("Analyzing emotional arcs...")
    emotional_results = await processor.analyze_emotional_arcs(contents)
    
    # Compare modes
    print("Comparing AI modes...")
    mode_comparison = await processor.mode_comparison_analysis(contents[0])
    
    print("\\nMode Comparison Results:")
    for mode, stats in mode_comparison.items():
        print(f"  {mode}:")
        print(f"    Processing Time: {stats['processing_time']}ms")
        print(f"    Enhancements: {stats['enhancements_count']}")
        print(f"    Suggestions: {stats['suggestions_count']}")
        print(f"    Content Length: {stats['content_length']} chars")

if __name__ == "__main__":
    asyncio.run(main())
    `,
    streaming: `
# Streaming content processing
import asyncio
from doccraft_ai import AsyncDocCraftAI

async def stream_content_enhancement(content: str, chunk_size: int = 100):
    """Stream content enhancement in chunks for real-time processing"""
    async with AsyncDocCraftAI(api_key='your_key') as client:
        # Split content into chunks
        chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
        
        enhanced_chunks = []
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)}...")
            
            result = await client.ai.enhance(
                content=chunk,
                type='content-enhancement',
                context={'chunk_index': i, 'total_chunks': len(chunks)}
            )
            
            enhanced_chunks.append(result.content)
            
            # Simulate real-time streaming
            yield {
                'chunk_index': i,
                'total_chunks': len(chunks),
                'enhanced_content': result.content,
                'processing_time': result.performance.processing_time
            }
        
        # Combine all enhanced chunks
        final_content = ' '.join(enhanced_chunks)
        yield {
            'type': 'complete',
            'final_content': final_content,
            'total_chunks': len(chunks)
        }

# Usage
async def main():
    content = "Your long content here..." * 10  # Make it long
    
    async for update in stream_content_enhancement(content):
        if update.get('type') == 'complete':
            print(f"\\nComplete! Processed {update['total_chunks']} chunks")
            print(f"Final content length: {len(update['final_content'])} chars")
        else:
            print(f"Chunk {update['chunk_index']+1}/{update['total_chunks']} "
                  f"processed in {update['processing_time']}ms")

asyncio.run(main())
    `,
  },

  nodejs: {
    installation: `npm install @doccraft-ai/sdk`,
    basicUsage: `
const { DocCraftAI } = require('@doccraft-ai/sdk');

const client = new DocCraftAI({
  apiKey: 'dca_live_your_api_key_here',
  mode: 'HYBRID'
});

async function enhanceContent() {
  try {
    const result = await client.ai.enhance({
      content: 'Your content here',
      type: 'content-enhancement',
      context: {
        genre: 'business-writing',
        tone: 'professional'
      }
    });

    console.log('Enhanced content:', result.content);
    console.log('Processing time:', result.performance.processingTime, 'ms');
    console.log('Mode used:', result.performance.mode);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

enhanceContent();
    `,
    advancedUsage: `
// Advanced Node.js patterns
const { DocCraftAI } = require('@doccraft-ai/sdk');
const EventEmitter = require('events');

class DocCraftProcessor extends EventEmitter {
  constructor(apiKey, options = {}) {
    super();
    this.client = new DocCraftAI({ apiKey, ...options });
    this.maxConcurrent = options.maxConcurrent || 5;
    this.activeRequests = 0;
    this.queue = [];
  }

  async processContent(content, options = {}) {
    if (this.activeRequests >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.queue.push({ content, options, resolve, reject });
      });
    }

    this.activeRequests++;
    this.emit('requestStarted');

    try {
      const result = await this.client.ai.enhance({
        content,
        type: 'content-enhancement',
        ...options
      });

      this.emit('requestCompleted', result);
      return result;
    } catch (error) {
      this.emit('requestError', error);
      throw error;
    } finally {
      this.activeRequests--;
      this.emit('requestFinished');
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { content, options, resolve, reject } = this.queue.shift();
      this.processContent(content, options).then(resolve).catch(reject);
    }
  }

  async batchProcess(contents, options = {}) {
    const promises = contents.map(content => 
      this.processContent(content, options)
    );

    return Promise.allSettled(promises);
  }
}

// Usage with event handling
const processor = new DocCraftProcessor('your_api_key', { maxConcurrent: 3 });

processor.on('requestStarted', () => {
  console.log('Request started, active:', processor.activeRequests);
});

processor.on('requestCompleted', (result) => {
  console.log('Request completed in', result.performance.processingTime, 'ms');
});

processor.on('requestError', (error) => {
  console.error('Request failed:', error.message);
});

// Process multiple contents
async function processBatch() {
  const contents = [
    'Content 1 for processing',
    'Content 2 for processing',
    'Content 3 for processing'
  ];

  const results = await processor.batchProcess(contents, {
    context: { genre: 'mixed', tone: 'neutral' }
  });

  console.log('Batch processing completed');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(\`Content \${index + 1}: \${result.value.content.length} chars\`);
    } else {
      console.log(\`Content \${index + 1}: Failed - \${result.reason.message}\`);
    }
  });
}

processBatch();
    `,
    streaming: `
// Streaming content processing with Node.js streams
const { DocCraftAI } = require('@doccraft-ai/sdk');
const { Transform } = require('stream');

class ContentEnhancementStream extends Transform {
  constructor(client, options = {}) {
    super({ objectMode: true });
    this.client = client;
    this.options = options;
    this.chunkSize = options.chunkSize || 100;
  }

  async _transform(chunk, encoding, callback) {
    try {
      // Split content into chunks
      const content = chunk.toString();
      const chunks = this.splitIntoChunks(content);

      for (const textChunk of chunks) {
        const result = await this.client.ai.enhance({
          content: textChunk,
          type: 'content-enhancement',
          context: { ...this.options.context, chunkSize: textChunk.length }
        });

        this.push({
          originalChunk: textChunk,
          enhancedChunk: result.content,
          processingTime: result.performance.processingTime,
          timestamp: new Date()
        });
      }

      callback();
    } catch (error) {
      callback(error);
    }
  }

  splitIntoChunks(content) {
    const chunks = [];
    for (let i = 0; i < content.length; i += this.chunkSize) {
      chunks.push(content.slice(i, i + this.chunkSize));
    }
    return chunks;
  }
}

// Usage with streams
const { createReadStream } = require('fs');
const { pipeline } = require('stream/promises');

async function streamProcessFile(filePath) {
  const client = new DocCraftAI({ apiKey: 'your_api_key' });
  
  const enhancementStream = new ContentEnhancementStream(client, {
    chunkSize: 200,
    context: { genre: 'document', tone: 'formal' }
  });

  const readStream = createReadStream(filePath, { encoding: 'utf8' });
  
  enhancementStream.on('data', (enhancedChunk) => {
    console.log('Enhanced chunk:', enhancedChunk.enhancedChunk);
    console.log('Processing time:', enhancedChunk.processingTime, 'ms');
  });

  await pipeline(readStream, enhancementStream);
}

// Stream from string content
async function streamProcessContent(content) {
  const client = new DocCraftAI({ apiKey: 'your_api_key' });
  
  const enhancementStream = new ContentEnhancementStream(client, {
    chunkSize: 150,
    context: { genre: 'creative', tone: 'descriptive' }
  });

  const { Readable } = require('stream');
  const contentStream = Readable.from([content]);

  enhancementStream.on('data', (enhancedChunk) => {
    console.log('Enhanced:', enhancedChunk.enhancedChunk);
  });

  await pipeline(contentStream, enhancementStream);
}

// Example usage
const longContent = "Your very long content here...".repeat(100);
streamProcessContent(longContent);
    `,
  },

  php: {
    installation: `composer require doccraft-ai/php-sdk`,
    basicUsage: `
<?php

require_once 'vendor/autoload.php';

use DocCraftAI\\DocCraftAIClient;

$client = new DocCraftAIClient([
    'api_key' => 'dca_live_your_api_key_here',
    'mode' => 'HYBRID'
]);

try {
    $result = $client->ai->enhance([
        'content' => 'Your content here',
        'type' => 'content-enhancement',
        'context' => [
            'genre' => 'business-writing',
            'tone' => 'professional'
        ]
    ]);

    echo "Enhanced content: " . $result->content . PHP_EOL;
    echo "Processing time: " . $result->performance->processingTime . "ms" . PHP_EOL;
    echo "Mode used: " . $result->performance->mode . PHP_EOL;

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
    `,
    advancedUsage: `
<?php

use DocCraftAI\\DocCraftAIClient;
use DocCraftAI\\Exceptions\\RateLimitException;
use DocCraftAI\\Exceptions\\AuthenticationException;

class DocCraftProcessor {
    private $client;
    private $maxConcurrent;
    private $activeRequests = 0;
    private $queue = [];

    public function __construct($apiKey, $options = []) {
        $this->client = new DocCraftAIClient(['api_key' => $apiKey] + $options);
        $this->maxConcurrent = $options['max_concurrent'] ?? 5;
    }

    public function processContent($content, $options = []) {
        if ($this->activeRequests >= $this->maxConcurrent) {
            return $this->queueRequest($content, $options);
        }

        return $this->executeRequest($content, $options);
    }

    private function executeRequest($content, $options) {
        $this->activeRequests++;

        try {
            $result = $this->client->ai->enhance([
                'content' => $content,
                'type' => 'content-enhancement',
                ...$options
            ]);

            return $result;
        } catch (RateLimitException $e) {
            // Implement retry logic
            sleep($e->getRetryAfter());
            return $this->executeRequest($content, $options);
        } catch (Exception $e) {
            throw $e;
        } finally {
            $this->activeRequests--;
            $this->processQueue();
        }
    }

    private function queueRequest($content, $options) {
        return new Promise(function($resolve, $reject) use ($content, $options) {
            $this->queue[] = [
                'content' => $content,
                'options' => $options,
                'resolve' => $resolve,
                'reject' => $reject
            ];
        });
    }

    private function processQueue() {
        if (!empty($this->queue) && $this->activeRequests < $this->maxConcurrent) {
            $request = array_shift($this->queue);
            $this->executeRequest($request['content'], $request['options'])
                ->then($request['resolve'])
                ->catch($request['reject']);
        }
    }

    public function batchProcess($contents, $options = []) {
        $promises = array_map(function($content) use ($options) {
            return $this->processContent($content, $options);
        }, $contents);

        return Promise::all($promises);
    }
}

// Usage
$processor = new DocCraftProcessor('your_api_key', ['max_concurrent' => 3]);

$contents = [
    'Content 1 for processing',
    'Content 2 for processing',
    'Content 3 for processing'
];

$results = $processor->batchProcess($contents, [
    'context' => ['genre' => 'mixed', 'tone' => 'neutral']
]);

foreach ($results as $index => $result) {
    echo "Content " . ($index + 1) . ": " . strlen($result->content) . " chars" . PHP_EOL;
}
    `,
  },

  go: {
    installation: `go get github.com/doccraft-ai/go-sdk`,
    basicUsage: `
package main

import (
    "fmt"
    "log"
    
    "github.com/doccraft-ai/go-sdk"
)

func main() {
    client := doccraft.NewClient(&doccraft.Config{
        APIKey: "dca_live_your_api_key_here",
        Mode:   "HYBRID",
    })

    result, err := client.AI.Enhance(&doccraft.EnhanceRequest{
        Content: "Your content here",
        Type:    "content-enhancement",
        Context: &doccraft.Context{
            Genre: "business-writing",
            Tone:  "professional",
        },
    })

    if err != nil {
        log.Fatal("Error:", err)
    }

    fmt.Printf("Enhanced content: %s\\n", result.Content)
    fmt.Printf("Processing time: %dms\\n", result.Performance.ProcessingTime)
    fmt.Printf("Mode used: %s\\n", result.Performance.Mode)
}
    `,
    advancedUsage: `
package main

import (
    "context"
    "fmt"
    "log"
    "sync"
    "time"
    
    "github.com/doccraft-ai/go-sdk"
)

type DocCraftProcessor struct {
    client        *doccraft.Client
    maxConcurrent int
    semaphore     chan struct{}
}

func NewDocCraftProcessor(apiKey string, maxConcurrent int) *DocCraftProcessor {
    return &DocCraftProcessor{
        client:        doccraft.NewClient(&doccraft.Config{APIKey: apiKey}),
        maxConcurrent: maxConcurrent,
        semaphore:     make(chan struct{}, maxConcurrent),
    }
}

func (p *DocCraftProcessor) ProcessContent(ctx context.Context, content string, options *doccraft.EnhanceRequest) (*doccraft.EnhanceResponse, error) {
    // Acquire semaphore
    select {
    case p.semaphore <- struct{}{}:
        defer func() { <-p.semaphore }()
    case <-ctx.Done():
        return nil, ctx.Err()
    }

    return p.client.AI.Enhance(options)
}

func (p *DocCraftProcessor) BatchProcess(ctx context.Context, contents []string, options *doccraft.EnhanceRequest) ([]*doccraft.EnhanceResponse, error) {
    var wg sync.WaitGroup
    results := make([]*doccraft.EnhanceResponse, len(contents))
    errors := make([]error, len(contents))

    for i, content := range contents {
        wg.Add(1)
        go func(index int, text string) {
            defer wg.Done()

            request := *options
            request.Content = text

            result, err := p.ProcessContent(ctx, text, &request)
            if err != nil {
                errors[index] = err
                return
            }

            results[index] = result
        }(i, content)
    }

    wg.Wait()

    // Check for errors
    for _, err := range errors {
        if err != nil {
            return nil, fmt.Errorf("batch processing error: %w", err)
        }
    }

    return results, nil
}

func (p *DocCraftProcessor) ModeComparison(ctx context.Context, content string) (map[string]*doccraft.EnhanceResponse, error) {
    modes := []string{"MANUAL", "HYBRID", "FULLY_AUTO"}
    results := make(map[string]*doccraft.EnhanceResponse)

    for _, mode := range modes {
        modeClient := p.client.WithMode(mode)
        
        result, err := modeClient.AI.Enhance(&doccraft.EnhanceRequest{
            Content: content,
            Type:    "content-enhancement",
        })

        if err != nil {
            return nil, fmt.Errorf("error processing with mode %s: %w", mode, err)
        }

        results[mode] = result
    }

    return results, nil
}

func main() {
    processor := NewDocCraftProcessor("your_api_key", 3)
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    contents := []string{
        "Content 1 for processing",
        "Content 2 for processing",
        "Content 3 for processing",
    }

    // Batch process
    results, err := processor.BatchProcess(ctx, contents, &doccraft.EnhanceRequest{
        Type: "content-enhancement",
        Context: &doccraft.Context{
            Genre: "mixed",
            Tone:  "neutral",
        },
    })

    if err != nil {
        log.Fatal("Batch processing error:", err)
    }

    for i, result := range results {
        fmt.Printf("Content %d: %d chars\\n", i+1, len(result.Content))
    }

    // Mode comparison
    modeResults, err := processor.ModeComparison(ctx, contents[0])
    if err != nil {
        log.Fatal("Mode comparison error:", err)
    }

    fmt.Println("\\nMode Comparison Results:")
    for mode, result := range modeResults {
        fmt.Printf("  %s:\\n", mode)
        fmt.Printf("    Processing Time: %dms\\n", result.Performance.ProcessingTime)
        fmt.Printf("    Enhancements: %d\\n", len(result.Enhancements))
        fmt.Printf("    Suggestions: %d\\n", len(result.Suggestions))
    }
}
    `,
  },
};

// Export for use in other components
export default integrationExamples;
