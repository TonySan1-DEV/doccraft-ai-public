import React from 'react';

export default function MinimalTest() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🧪 Minimal Test Component
      </h1>

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ color: '#2563eb', marginBottom: '20px' }}>
          ✅ React is Working!
        </h2>

        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
          If you can see this content, React is rendering correctly. The white
          screen issue is likely caused by CSS or component-specific problems.
        </p>

        <div
          style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            border: '1px solid #93c5fd',
          }}
        >
          <h3 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>
            Debug Information:
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#1e40af' }}>
            <li>Component loaded at: {new Date().toLocaleTimeString()}</li>
            <li>User agent: {navigator.userAgent}</li>
            <li>
              Window size: {window.innerWidth} x {window.innerHeight}
            </li>
            <li>Document ready state: {document.readyState}</li>
          </ul>
        </div>

        <div
          style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fbbf24',
          }}
        >
          <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>
            Next Steps:
          </h3>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
            <li>Check browser console for JavaScript errors</li>
            <li>Verify CSS is loading properly</li>
            <li>Test other components one by one</li>
            <li>Check network tab for failed requests</li>
          </ol>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            🏠 Back to Home
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
