import { Routes, Route } from 'react-router-dom';

import { WriterProfileProvider } from './contexts/WriterProfileContext';
import { DocCraftAgentProvider } from './contexts/AgentContext';
import { SimpleThemeProvider } from './contexts/SimpleThemeContext';

import Header from './components/Header';
import { Sidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import DocumentProcessor from './pages/DocumentProcessor';
import DocumentView from './pages/DocumentView';
import ProcessDocument from './pages/ProcessDocument';
import Analyzer from './pages/Analyzer';
import Builder from './pages/Builder';
import AuditLogs from './pages/AuditLogs';
import Home from './pages/Home';
import { Login } from './pages/Login';
import SignUp from './pages/SignUp';
import Demo from './pages/Demo';
import Pricing from './pages/Pricing';

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
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Help from './pages/Help';
import DemoModeIndicator from './components/DemoModeIndicator';

import { ErrorBoundary } from './components/ErrorBoundary';

import './index.css';

// Check if running in demo mode
const isDemoMode =
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' ||
  !import.meta.env.VITE_SUPABASE_URL;

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
  return (
    <div
      className="App"
      style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
    >
      <DemoModeIndicator isVisible={isDemoMode} />

      <SimpleThemeProvider>
        <WriterProfileProvider>
          <DocCraftAgentProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />

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
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/support" element={<Support />} />
                <Route path="/share/:token" element={<ShareableAccessPage />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/help" element={<Help />} />

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
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route
                  path="/demo"
                  element={
                    <LayoutWrapper>
                      <Demo />
                    </LayoutWrapper>
                  }
                />

                <Route
                  path="/pricing"
                  element={
                    <LayoutWrapper>
                      <Pricing />
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
                      <CharacterDevelopment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/docs"
                  element={
                    <LayoutWrapper>
                      <div className="py-20 px-8 text-center">
                        <h1 className="text-3xl font-bold mb-4">
                          Documentation
                        </h1>
                        <p className="text-gray-600">
                          Documentation coming soon...
                        </p>
                      </div>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <LayoutWrapper>
                      <div className="py-20 px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">Blog</h1>
                        <p className="text-gray-600">
                          Blog posts coming soon...
                        </p>
                      </div>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/tutorials"
                  element={
                    <LayoutWrapper>
                      <div className="py-20 px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">Tutorials</h1>
                        <p className="text-gray-600">
                          Tutorials coming soon...
                        </p>
                      </div>
                    </LayoutWrapper>
                  }
                />
                <Route path="*" element={<Home />} />
              </Routes>
            </ErrorBoundary>
          </DocCraftAgentProvider>
        </WriterProfileProvider>
      </SimpleThemeProvider>
    </div>
  );
}

export default App;
