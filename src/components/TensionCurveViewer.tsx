// MCP Context Block
/*
{
  file: "TensionCurveViewer.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useMemo } from 'react';

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
}

export default function TensionCurveViewer({
  tensionCurve,
  emotionalPeaks,
  readerEngagement
}: TensionCurveViewerProps) {
  const chartData = useMemo(() => {
    return tensionCurve.map(curve => ({
      x: curve.position * 100,
      tension: curve.tension,
      empathy: curve.empathy,
      engagement: curve.engagement
    }));
  }, [tensionCurve]);

  const renderTensionCurve = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
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
      <div className="relative h-64">
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
          />
          
          {/* Tension line */}
          <polyline
            points={chartData.map(point => `${point.x},${100 - point.tension}`).join(' ')}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
          />
        </svg>

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
          />
        ))}
      </div>
    );
  };

  const calculateStats = () => {
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
  };

  const stats = calculateStats();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tension & Engagement Analysis</h3>
        <div className="flex items-center space-x-4">
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
      </div>

      {renderTensionCurve()}

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