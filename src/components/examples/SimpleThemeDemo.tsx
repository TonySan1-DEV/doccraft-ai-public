import React from 'react';
import { useSimpleTheme } from '../../contexts/SimpleThemeContext';
import { simpleThemes } from '../../configs/simpleThemes';

export function SimpleThemeDemo() {
  const { currentTheme, setTheme } = useSimpleTheme();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Simple Theme Demo</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current Theme: {currentTheme.name}</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: currentTheme.primary,
              border: '2px solid #333',
              borderRadius: '8px',
            }}
            title={`Primary: ${currentTheme.primary}`}
          />
          <div
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: currentTheme.secondary,
              border: '2px solid #333',
              borderRadius: '8px',
            }}
            title={`Secondary: ${currentTheme.secondary}`}
          />
          <div
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: currentTheme.accent,
              border: '2px solid #333',
              borderRadius: '8px',
            }}
            title={`Accent: ${currentTheme.accent}`}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Available Themes:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {simpleThemes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              style={{
                padding: '10px 15px',
                border:
                  currentTheme.id === theme.id
                    ? '2px solid #333'
                    : '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor:
                  currentTheme.id === theme.id ? theme.primary : '#f5f5f5',
                color: currentTheme.id === theme.id ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          border: '2px solid var(--theme-primary)',
          borderRadius: '8px',
          backgroundColor: 'var(--theme-secondary)',
          color: 'white',
        }}
      >
        <h4>CSS Variables Demo</h4>
        <p>
          This box uses CSS variables that automatically update when you change
          themes:
        </p>
        <ul>
          <li>
            Border: <code>var(--theme-primary)</code>
          </li>
          <li>
            Background: <code>var(--theme-secondary)</code>
          </li>
          <li>Text: White (for contrast)</li>
        </ul>
        <p>
          Try switching themes above to see the CSS variables update in
          real-time!
        </p>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>
          <strong>Note:</strong> Open your browser's DevTools → Elements → :root
          to see the CSS variables being set dynamically.
        </p>
        <p>
          You can also test theme switching programmatically in the console:
        </p>
        <code
          style={{
            backgroundColor: '#f0f0f0',
            padding: '5px',
            borderRadius: '4px',
            display: 'block',
            marginTop: '5px',
          }}
        >
          window.themeContext.setTheme('ruby-red')
        </code>
      </div>
    </div>
  );
}
