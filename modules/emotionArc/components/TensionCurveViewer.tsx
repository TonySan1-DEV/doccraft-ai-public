// MCP Context Block
/*
{
  file: "modules/emotionArc/components/TensionCurveViewer.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React, { useMemo, useState, useCallback, useRef } from 'react';

interface TensionCurveViewerProps {
  tensionCurve: Array<{
    position: number;
    tension: number;
    empathy: number;
    engagement: number;
  }>;
  emotionalPeaks: number[];
  readerEngagement?: {
    predictedDrops: number[];
    highEngagementSections: number[];
    emotionalComplexity: number;
  };
  isLoading?: boolean;
  error?: string | null;
  onPointClick?: (position: number, data: any) => void;
  onZoomChange?: (zoomLevel: number) => void;
  className?: string;
  'aria-label'?: string;
}

interface ChartPoint {
  x: number;
  tension: number;
  empathy: number;
  engagement: number;
  position: number;
}

export default function TensionCurveViewer({
  tensionCurve,
  emotionalPeaks,
  readerEngagement,
  isLoading = false,
  error = null,
  onPointClick,
  onZoomChange,
  className = '',
  'aria-label': ariaLabel = 'Tension Curve Viewer'
}: TensionCurveViewerProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    return tensionCurve.map(curve => ({
      x: curve.position * 100,
      tension: curve.tension,
      empathy: curve.empathy,
      engagement: curve.engagement,
      position: curve.position
    }));
  }, [tensionCurve]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const avgTension = chartData.reduce((sum, point) => sum + point.tension, 0) / chartData.length;
    const avgEngagement = chartData.reduce((sum, point) => sum + point.engagement, 0) / chartData.length;
    const avgEmpathy = chartData.reduce((sum, point) => sum + point.empathy, 0) / chartData.length;
    
    const maxTension = Math.max(...chartData.map(point => point.tension));
    const minTension = Math.min(...chartData.map(point => point.tension));
    
    return {
      avgTension: Math.round(avgTension),
      avgEngagement: Math.round(avgEngagement),
      avgEmpathy: Math.round(avgEmpathy),
      maxTension,
      minTension,
      tensionRange: maxTension - minTension
    };
  }, [chartData]);

  // Accessibility helpers
  const getAccessibleDescription = useCallback((point: ChartPoint) => {
    return `At ${Math.round(point.x)}% of the story: Tension ${Math.round(point.tension)}%, Empathy ${Math.round(point.empathy)}%, Engagement ${Math.round(point.engagement)}%`;
  }, []);

  const handlePointClick = useCallback((point: ChartPoint) => {
    if (onPointClick) {
      onPointClick(point.position, point);
    }
  }, [onPointClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, point: ChartPoint) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePointClick(point);
    }
  }, [handlePointClick]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel * 1.2, 3);
    setZoomLevel(newZoom);
    onZoomChange?.(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel / 1.2, 0.5);
    setZoomLevel(newZoom);
    onZoomChange?.(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  // Error state
  if (error) {
    return (
      <div 
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Error loading tension data</span>
        </div>
        <p className="text-red-700 mt-1 text-sm">{error}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tension curve...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center h-64 text-gray-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="mt-2">No tension data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-4 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tension & Engagement Analysis</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Tension</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded border-dashed border"></div>
              <span className="text-sm text-gray-600">Engagement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded border-dotted border"></div>
              <span className="text-sm text-gray-600">Empathy</span>
            </div>
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-600 hover:text-gray-800 rounded"
              aria-label="Zoom out"
              disabled={zoomLevel <= 0.5}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-600 hover:text-gray-800 rounded"
              aria-label="Zoom in"
              disabled={zoomLevel >= 3}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartRef}
        className="relative h-64 bg-white border border-gray-200 rounded-lg overflow-hidden"
        onWheel={handleWheel}
        role="img"
        aria-label="Tension curve chart"
      >
        {/* Chart Grid */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border-r border-gray-200 last:border-r-0" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border-b border-gray-200 last:border-b-0" />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        {/* Tension Area */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Tension area fill */}
          <defs>
            <linearGradient id="tensionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          <polygon
            points={`0,100 ${chartData.map(point => `${point.x},${100 - point.tension}`).join(' ')} 100,100`}
            fill="url(#tensionGradient)"
            aria-hidden="true"
          />
          
          {/* Tension line */}
          <polyline
            points={chartData.map(point => `${point.x},${100 - point.tension}`).join(' ')}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          />
        </svg>

        {/* Engagement overlay */}
        <svg className="absolute inset-0 w-full h-full">
          <polyline
            points={chartData.map(point => `${point.x},${100 - point.engagement}`).join(' ')}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.8"
            aria-hidden="true"
          />
        </svg>

        {/* Empathy overlay */}
        <svg className="absolute inset-0 w-full h-full">
          <polyline
            points={chartData.map(point => `${point.x},${100 - point.empathy}`).join(' ')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="3,3"
            opacity="0.6"
            aria-hidden="true"
          />
        </svg>

        {/* Interactive data points */}
        {chartData.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={100 - point.tension}
            r="3"
            fill="#EF4444"
            className={`cursor-pointer transition-all duration-200 ${
              hoveredPoint === point ? 'r-5' : 'hover:r-4'
            }`}
            onMouseEnter={() => setHoveredPoint(point)}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => handlePointClick(point)}
            onKeyDown={(e) => handleKeyDown(e, point)}
            tabIndex={0}
            role="button"
            aria-label={getAccessibleDescription(point)}
          />
        ))}

        {/* Emotional peaks markers */}
        {emotionalPeaks.map((peak, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg"
            style={{
              left: `${peak * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            aria-hidden="true"
          />
        ))}

        {/* Reader engagement markers */}
        {readerEngagement?.predictedDrops.map((drop, index) => (
          <div
            key={`drop-${index}`}
            className="absolute w-2 h-2 bg-red-500 rounded-full border border-white"
            style={{
              left: `${drop * 100}%`,
              bottom: '10%',
              transform: 'translateX(-50%)'
            }}
            aria-hidden="true"
          />
        ))}

        {readerEngagement?.highEngagementSections.map((section, index) => (
          <div
            key={`high-${index}`}
            className="absolute w-2 h-2 bg-green-500 rounded-full border border-white"
            style={{
              left: `${section * 100}%`,
              top: '10%',
              transform: 'translateX(-50%)'
            }}
            aria-hidden="true"
          />
        ))}

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg pointer-events-none"
            style={{
              left: `${hoveredPoint.x}%`,
              top: `${100 - hoveredPoint.tension}%`,
              transform: 'translate(-50%, -100%) translateY(-8px)'
            }}
            role="tooltip"
          >
            <div className="font-medium">Position: {Math.round(hoveredPoint.x)}%</div>
            <div className="text-red-300">Tension: {Math.round(hoveredPoint.tension)}%</div>
            <div className="text-green-300">Engagement: {Math.round(hoveredPoint.engagement)}%</div>
            <div className="text-blue-300">Empathy: {Math.round(hoveredPoint.empathy)}%</div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-red-600">Avg Tension</div>
            <div className="text-xl font-bold text-red-900">{stats.avgTension}%</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-600">Avg Engagement</div>
            <div className="text-xl font-bold text-green-900">{stats.avgEngagement}%</div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Avg Empathy</div>
            <div className="text-xl font-bold text-blue-900">{stats.avgEmpathy}%</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-yellow-600">Tension Range</div>
            <div className="text-xl font-bold text-yellow-900">{stats.tensionRange}%</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-600">Emotional Peaks</div>
            <div className="text-xl font-bold text-purple-900">{emotionalPeaks.length}</div>
          </div>
        </div>
      )}

      {/* Reader Engagement Analysis */}
      {readerEngagement && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Reader Engagement Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {readerEngagement.predictedDrops.length} engagement risks
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {readerEngagement.highEngagementSections.length} high engagement sections
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                Emotional complexity: {readerEngagement.emotionalComplexity}%
              </span>
            </div>
          </div>

          {readerEngagement.predictedDrops.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800">⚠️ Engagement Risks</div>
              <div className="text-sm text-red-700 mt-1">
                Consider adding conflict or stakes at {readerEngagement.predictedDrops.map(drop => 
                  `${Math.round(drop * 100)}%`
                ).join(', ')} of the story.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 