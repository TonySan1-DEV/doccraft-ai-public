import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DemoModeIndicatorProps {
  isVisible: boolean;
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Demo Mode</span>
      </div>
    </div>
  );
};

export default DemoModeIndicator;
