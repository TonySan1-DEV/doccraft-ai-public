import { Routes, Route } from 'react-router-dom';

import { WriterProfileProvider } from './contexts/WriterProfileContext';
import { DocCraftAgentProvider } from './contexts/AgentContext';
import Header from './components/Header';
import { Sidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import DocumentProcessor from './pages/DocumentProcessor';
import DocumentView from './pages/DocumentView';
import ProcessDocument from './pages/ProcessDocument';
import Analyzer from './pages/Analyzer';
import Builder from './pages/Builder';
import CollabTest from './pages/CollabTest';
import AuditLogs from './pages/AuditLogs';
import SupabaseTestPage from './pages/SupabaseTestPage';
import Home from './pages/Home';
import { Login } from './pages/Login';
import SignUp from './pages/SignUp';
import Demo from './pages/Demo';
import EbookAnalyzer from './pages/EbookAnalyzer';
import CharacterDevelopment from './pages/CharacterDevelopment';
import Workspace from './pages/Workspace';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import OutlineBuilder from './pages/OutlineBuilder';
import BookOutliner from './pages/BookOutliner';
import ResetPassword from './pages/ResetPassword';
import DocumentEditorDemo from './pages/DocumentEditorDemo';
import Support from './pages/Support';
import ShareableAccessPage from './pages/ShareableAccessPage';
import { Footer } from './components/Footer';
import DemoModeIndicator from './components/DemoModeIndicator';
import TestPage from './pages/TestPage';
import MinimalTest from './pages/MinimalTest';

import './index.css';

console.log('🚀 App.tsx loading...');

// Check if running in demo mode
const isDemoMode =
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' ||
  !import.meta.env.VITE_SUPABASE_URL;

console.log('🔍 Demo mode:', isDemoMode);

// Sidebar layout handler
const handleSidebarToggle = (event: CustomEvent) => {
  const layoutElement = document.querySelector('[data-sidebar-layout]');
  if (layoutElement) {
    if (event.detail.isCollapsed) {
      layoutElement.classList.remove('sidebar-expanded');
    } else {
      layoutElement.classList.add('sidebar-expanded');
    }
  }
};

// Add event listener for sidebar toggle
if (typeof window !== 'undefined') {
  window.addEventListener(
    'sidebar-toggle',
    handleSidebarToggle as EventListener
  );
}

// Layout wrapper component for pages with header only
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <Header />
    <main className="pt-16 flex-1">{children}</main>
    <Footer />
  </div>
);

// Layout wrapper component for pages with sidebar
const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <Sidebar />
    <div
      className="lg:pl-16 transition-all duration-300 sidebar-layout-content flex-1 flex flex-col"
      data-sidebar-layout
    >
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  </div>
);

function App() {
  console.log('🚀 App component rendering...');

  return (
    <div
      className="App"
      style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
    >
      <DemoModeIndicator isVisible={isDemoMode} />

      <WriterProfileProvider>
        <DocCraftAgentProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/minimal" element={<MinimalTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedTiers={['Pro', 'Admin']}>
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/processor"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <DocumentProcessor />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/view"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <DocumentView />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/process"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <ProcessDocument />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyzer"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Analyzer />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Builder />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Workspace />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Settings />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Billing />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedTiers={['Pro', 'Admin']}>
                  <SidebarLayout>
                    <Analytics />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <Profile />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/support" element={<Support />} />
            <Route path="/share/:token" element={<ShareableAccessPage />} />
            <Route
              path="/collab-test"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <CollabTest />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedTiers={['Admin']}>
                  <SidebarLayout>
                    <AuditLogs />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/supabase-test"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <SupabaseTestPage />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/outliner"
              element={
                <ProtectedRoute allowedTiers={['Pro', 'Admin']}>
                  <OutlineBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-outliner"
              element={
                <ProtectedRoute>
                  <BookOutliner />
                </ProtectedRoute>
              }
            />
            <Route path="/demo/editor" element={<DocumentEditorDemo />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route
              path="/demo"
              element={
                <LayoutWrapper>
                  <Demo />
                </LayoutWrapper>
              }
            />
            <Route
              path="/ebook-analyzer"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <EbookAnalyzer />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/character-development"
              element={
                <ProtectedRoute>
                  <SidebarLayout>
                    <CharacterDevelopment />
                  </SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </DocCraftAgentProvider>
      </WriterProfileProvider>
    </div>
  );
}

export default App;
