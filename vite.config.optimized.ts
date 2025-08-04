import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2015",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@headlessui/react", "@heroicons/react"],
          "utils-vendor": ["lodash", "date-fns", "clsx"],
          "auth-vendor": ["@supabase/supabase-js"],
          "charts-vendor": ["recharts", "d3"],
          "editor-vendor": ["@monaco-editor/react", "monaco-editor"],

          // Feature chunks
          "agent-features": [
            "./src/agent",
            "./src/contexts/AgentPreferencesContext.tsx",
            "./src/hooks/useAgentToggle.ts",
          ],
          "emotion-features": [
            "./src/components/EmotionalArcModule.tsx",
            "./src/components/EmotionTimelineChart.tsx",
            "./src/services/arcSimulator.ts",
          ],
          "narrative-features": [
            "./src/components/narrativeDashboard",
            "./src/modules/narrativeDashboard",
          ],
          "style-features": [
            "./src/modules/styleProfile",
            "./src/components/StyleProfilePanel.tsx",
          ],
          "theme-features": [
            "./src/modules/themeAnalysis",
            "./src/components/ThemeMatrixPanel.tsx",
          ],
          "plot-features": [
            "./src/modules/plotStructure",
            "./src/components/PlotStructurePanel.tsx",
          ],

          // Admin features
          "admin-features": [
            "./src/components/admin",
            "./src/components/audit",
            "./src/pages/AuditLogs.tsx",
          ],

          // Support features
          "support-features": [
            "./src/components/support",
            "./src/pages/Support.tsx",
            "./src/services/supportService.ts",
          ],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || "")) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || "")) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      external: ["electron"], // If building for desktop
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@headlessui/react",
      "@heroicons/react",
      "lodash",
      "date-fns",
      "clsx",
      "@supabase/supabase-js",
      "recharts",
      "d3",
      "@monaco-editor/react",
      "monaco-editor",
    ],
    exclude: ["electron"], // If building for desktop
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
