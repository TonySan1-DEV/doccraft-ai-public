import React from 'react';

export function DebugInfo() {
  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>React Version: {React.version}</div>
        <div>User Agent: {navigator.userAgent}</div>
        <div>
          Window Size: {window.innerWidth}x{window.innerHeight}
        </div>
        <div>URL: {window.location.href}</div>
        <div>Timestamp: {new Date().toISOString()}</div>
      </div>
    </div>
  );
}
