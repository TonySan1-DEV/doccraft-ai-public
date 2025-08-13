import React from 'react';

export default function TestPage() {
  console.log('🧪 TestPage component loading...');

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🧪 Test Page</h1>
        <p className="text-gray-700 mb-4">
          If you can see this, React is working correctly!
        </p>
        <div className="bg-green-100 p-4 rounded border border-green-300">
          <p className="text-green-800 font-medium">
            ✅ Basic React rendering is working
          </p>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Current time: {new Date().toLocaleTimeString()}</p>
          <p>User agent: {navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
}
