import React, { useState, useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ShieldAlert,
  CheckSquare,
  Activity,
  Settings,
  UserCircle,
  Bell,
  BarChart2,
  FileText,
  BookOpen,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/AuthContext";
import { useData } from "@/store/DataContext";

const navItems = [
  // Board Oversight Layer
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart2,
    group: "Board Oversight",
  },
  {
    name: "Risk Register",
    href: "/risks",
    icon: ShieldAlert,
    group: "Board Oversight",
  },

  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    group: "Governance Toolsets",
  },
  {
    name: "User Guide",
    href: "/guide",
    icon: BookOpen,
    group: "Governance Toolsets",
  },

  // Risk Control Toolsets
  {
    name: "Asset Register",
    href: "/assets",
    icon: FileText,
    group: "Control Toolsets",
  },
  {
    name: "Control Register",
    href: "/controls",
    icon: CheckSquare,
    group: "Control Toolsets",
  },

  // Legacy/System
  {
    name: "Treatment Plans",
    href: "/treatments",
    icon: Activity,
    group: "System",
  },
  { name: "Audit Log", href: "/audit-log", icon: FileText, group: "System" },
  { name: "Admin", href: "/admin", icon: Settings, group: "System" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();

  const unreadCount = notifications.filter(n => !n.read).length;

  // default project
  const projectId = searchParams.get("projectId") || "proj-main";

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const projects = [
    { id: "proj-main", name: "Global Enterprise HQ" },
    { id: "proj-apac", name: "APAC Region Division" },
    { id: "proj-emea", name: "EMEA Division" },
  ];

  const handleProjectSwitch = (newId: string) => {
    navigate(`${location.pathname}?projectId=${newId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 w-full overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <ShieldAlert className="w-6 h-6 text-indigo-500 mr-2" />
            <span className="text-lg font-bold text-white tracking-tight">
              Risk App
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {[
            "Board Oversight",
            "Governance Toolsets",
            "Control Toolsets",
            "System",
          ].map((groupName) => (
            <div key={groupName}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {groupName}
              </h3>
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.group === groupName)
                  .filter((item) => {
                    if (user?.role === "Administrator") return true;
                    if (item.name === "Admin") return false;
                    return true;
                  })
                  .map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href !== "/" &&
                        location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 flex-shrink-0 h-5 w-5",
                            isActive
                              ? "text-indigo-400"
                              : "text-slate-500 group-hover:text-slate-300",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            <Avatar className="h-9 w-9 bg-slate-800 border border-slate-700">
              <AvatarFallback className="text-slate-300">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-col flex w-full overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user?.role || "Role"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 shrink-0 shadow-sm w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {navItems.find((item) => location.pathname === item.href)?.name ||
                "Risk Management"}
            </h1>
            <h1 className="text-lg font-semibold text-gray-900 sm:hidden mr-2">
              Risk App
            </h1>

            <div className="hidden md:flex ml-4 border-l pl-4 border-slate-200 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "bg-slate-50 text-slate-700 h-8 gap-2 font-medium",
                  )}
                >
                  <span className="max-w-[120px] truncate">
                    {projects.find((p) => p.id === projectId)?.name ||
                      "Select Project"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Project Context</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => handleProjectSwitch(p.id)}
                      className={
                        p.id === projectId
                          ? "font-semibold text-indigo-600"
                          : ""
                      }
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative text-gray-500")}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="h-auto p-0 text-xs font-normal text-indigo-600">Mark all as read</Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className={cn("flex flex-col items-start p-3 gap-1 cursor-default", !notif.read && "bg-slate-50")} onClick={(e) => { e.preventDefault(); markNotificationAsRead(notif.id); }}>
                         <div className="flex w-full items-center justify-between">
                            <span className={cn("text-xs font-medium", notif.type === 'error' ? "text-red-600" : "text-amber-600")}>{notif.title}</span>
                            {!notif.read && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                         </div>
                         <p className="text-sm text-slate-700 whitespace-normal leading-snug">
                           {notif.message}
                         </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "rounded-full",
                )}
              >
                <UserCircle className="h-6 w-6 text-gray-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "My Account"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
