import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Edit,
  Folder,
  BarChart3,
  Settings,
  Menu,
  X,
  Wand2,
  ChevronDown,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  Headphones,
} from "lucide-react";
import { useMCP } from "../useMCP";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: "Free" | "Pro" | "Admin";
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    tier: "Pro",
    description: "Overview and analytics",
  },
  {
    label: "Document Processor",
    path: "/processor",
    icon: Edit,
    tier: "Pro",
    description: "Process and enhance documents",
  },
  {
    label: "Document Viewer",
    path: "/view",
    icon: FileText,
    tier: "Pro",
    description: "View processed documents",
  },
  {
    label: "Ebook Analyzer",
    path: "/ebook-analyzer",
    icon: BookOpen,
    tier: "Pro",
    description: "Analyze and create ebooks",
  },
  {
    label: "Character Development",
    path: "/character-development",
    icon: User,
    tier: "Pro",
    description: "Create and develop characters",
  },
  {
    label: "Analyzer",
    path: "/analyzer",
    icon: BookOpen,
    tier: "Pro",
    description: "Document analysis",
  },
  {
    label: "Builder",
    path: "/builder",
    icon: Edit,
    tier: "Pro",
    description: "Content creation",
  },
  {
    label: "Book Outliner",
    path: "/book-outliner",
    icon: BookOpen,
    tier: "Pro",
    description: "AI-powered book outlining",
  },
  {
    label: "Workspace",
    path: "/workspace",
    icon: Folder,
    tier: "Free",
    description: "File management",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
    tier: "Free",
    description: "User profile and settings",
  },
  {
    label: "Support",
    path: "/support",
    icon: Headphones,
    tier: "Free",
    description: "Customer support and help",
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: BarChart3,
    tier: "Admin",
    description: "System audit logs",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    tier: "Admin",
    description: "System configuration",
  },
];

const ROLES = [
  "viewer",
  "editor",
  "uploader",
  "curator",
  "configurator",
  "admin",
] as const;

export const Sidebar: React.FC = () => {
  const mcpContext = useMCP("Sidebar.tsx");
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default

  const currentRole = localStorage.getItem("mcpRole") || "viewer";

  // Emit event when sidebar state changes
  React.useEffect(() => {
    // Add data attribute to document for layout detection
    document.documentElement.setAttribute(
      "data-sidebar-collapsed",
      isCollapsed.toString()
    );

    // Emit custom event for layout wrapper
    window.dispatchEvent(
      new CustomEvent("sidebar-toggle", {
        detail: { isCollapsed },
      })
    );
  }, [isCollapsed]);

  const isVisible = (tier: string) => {
    // Always show Free tier items
    if (tier === "Free") return true;

    // Show Pro items if user has Pro or Admin tier
    if (
      tier === "Pro" &&
      (mcpContext.tier === "Pro" || mcpContext.tier === "Admin")
    )
      return true;

    // Show Admin items only if user has Admin tier
    if (tier === "Admin" && mcpContext.tier === "Admin") return true;

    return false;
  };

  const updateRole = (role: string) => {
    localStorage.setItem("mcpRole", role);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <button
        onClick={() => {
          navigate(item.path);
          setIsMobileOpen(false);
        }}
        className={`
          group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${
            isActive
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
          }
          ${isCollapsed ? "justify-center" : ""}
        `}
        title={isCollapsed ? item.description : undefined}
      >
        <Icon
          className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"} ${
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {isActive && (
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </>
        )}
      </button>
    );
  };

  const SidebarContent = () => {
    const visibleItems = navigationItems.filter((item) => isVisible(item.tier));

    // Debug logging to check user state
    console.log("Sidebar Debug - User State:", {
      user: user?.email,
      isAuthenticated: !!user,
      isCollapsed,
      visibleItems: visibleItems.length,
    });

    return (
      <div
        className={`flex flex-col h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header - Fixed height to prevent overlap */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 min-h-[72px]">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-20"></div>
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent truncate">
                  DocCraft AI
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  AI-Powered
                </p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation - Scrollable area with proper spacing */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          {/* Logout Button - Always show for testing */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
            <button
              onClick={handleLogout}
              className={`
                group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300
                border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10
                ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? "Sign out" : undefined}
            >
              <LogOut
                className={`w-5 h-5 ${
                  isCollapsed ? "" : "mr-3"
                } text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left">
                  Sign Out{" "}
                  {user ? `(${user.email?.split("@")[0]})` : "(Not logged in)"}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer with Role Dropdown - Only show when expanded */}
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700">
            {/* User Info */}
            {user && (
              <button
                onClick={() => navigate("/profile")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/profile")}
                className="w-full mb-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="truncate">Role: {currentRole}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${
                    isRoleDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        updateRole(role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                        currentRole === role
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tier Badge */}
            <div className="mt-3 text-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200">
                {mcpContext.tier || "Free"} Tier
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => e.key === "Enter" && setIsMobileOpen(false)}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-y-0 left-0 w-64 z-50">
          <SidebarContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </div>
    </>
  );
};
