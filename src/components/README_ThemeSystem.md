# Simple Theme System

A lightweight, 5-color theme system for DocCraft AI that provides easy theme switching with CSS variable support.

## Components

### 1. SimpleThemeChanger

A professional theme selector component with dropdown functionality.

**Features:**

- Palette icon + colored circle + chevron dropdown
- Shows current theme color
- Dropdown with 5 theme options
- Visual feedback for current selection
- Accessibility features (ARIA labels, keyboard support)
- Click outside to close

**Usage:**

```tsx
import { SimpleThemeChanger } from '../components/SimpleThemeChanger';
import { SimpleThemeProvider } from '../contexts/SimpleThemeContext';

function App() {
  return (
    <SimpleThemeProvider>
      <header>
        <SimpleThemeChanger />
      </header>
    </SimpleThemeProvider>
  );
}
```

### 2. SimpleThemeContext

Manages theme state and applies CSS variables.

**Features:**

- useState for theme state management
- Automatically sets CSS variables: `--theme-primary`, `--theme-secondary`, `--theme-accent`
- localStorage persistence
- No interference with dark mode

**Usage:**

```tsx
import { useSimpleTheme } from '../contexts/SimpleThemeContext';

function MyComponent() {
  const { currentTheme, setTheme, getCurrentTheme } = useSimpleTheme();

  // Change theme
  setTheme('forest-green');

  // Get current theme
  const theme = getCurrentTheme();
}
```

## Available Themes

1. **Ocean Blue** (default) - `#1e3a8a`, `#3b82f6`, `#60a5fa`
2. **Forest Green** - `#166534`, `#16a34a`, `#22c55e`
3. **Royal Purple** - `#581c87`, `#9333ea`, `#a855f7`
4. **Ruby Red** - `#991b1b`, `#dc2626`, `#ef4444`
5. **Sunset Orange** - `#c2410c`, `#ea580c`, `#f97316`

## CSS Variables

The context automatically sets these CSS variables on the `:root` element:

```css
:root {
  --theme-primary: #1e3a8a;
  --theme-secondary: #3b82f6;
  --theme-accent: #60a5fa;
}
```

Use them in your CSS:

```css
.my-button {
  background-color: var(--theme-primary);
  border-color: var(--theme-secondary);
  color: var(--theme-accent);
}
```

## Integration Examples

### Header Integration

```tsx
import { SimpleThemeChanger } from './SimpleThemeChanger';

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1>DocCraft AI</h1>
        <SimpleThemeChanger />
      </div>
    </header>
  );
}
```

### Custom Theme Usage

```tsx
import { useSimpleTheme } from '../contexts/SimpleThemeContext';

function CustomComponent() {
  const { currentTheme } = useSimpleTheme();

  return (
    <div
      style={{
        backgroundColor: currentTheme.secondary,
        borderColor: currentTheme.primary,
        color: currentTheme.accent,
      }}
    >
      Theme-aware content
    </div>
  );
}
```

## Testing

Run the test suite:

```bash
npm test -- SimpleThemeChanger.test.tsx
npm test -- SimpleThemeContext.test.tsx
```

## Demo Components

- `SimpleThemeDemo` - Shows theme switching in action
- `HeaderWithThemeChanger` - Header integration example
- `ThemeChangerDemo` - Complete demo page

## Notes

- **No Dark Mode Interference**: This system works independently of any existing dark mode toggle
- **localStorage Key**: Uses `'simple-theme-id'` for persistence
- **CSS Variables**: Automatically applied to `document.documentElement.style`
- **Performance**: Lightweight with minimal re-renders
- **Accessibility**: Full ARIA support and keyboard navigation
