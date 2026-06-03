"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItemsByRole = {
  SYSADMIN: [
    { label: "Activity Logs", href: "/sysadmin/actLogs", icon: LayoutList },
    { label: "Users", href: "/sysadmin/users", icon: Users },
    { label: "My Organization", href: "/sysadmin/myOrg", icon: Building2 }
  ],
  ADMIN: [
    { label: "Projects", href: "/admin/projects", icon: FolderKanban },
    { label: "Tasks", href: "/admin/tasks", icon: ClipboardList },
    { label: "Employees", href: "/admin/users", icon: Users },
    { label: "My Organization", href: "/admin/myOrg", icon: Building2 },
  ],
  EMPLOYEE: [
    { label: "My Tasks", href: "/employee/tasks", icon: ClipboardList },
    { label: "Assigned Projects", href: "/employee/projects", icon: FolderKanban },
  ],
};

export function SideNav({ children, role }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navItemsByRole[role] ?? navItemsByRole.EMPLOYEE;

  return (
    <div className="flex min-h-screen bg-mist-100 pt-16">
      <Button
        type="button"
        size="icon"
        className="fixed left-4 top-20 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative h-full w-72 bg-white shadow-xl">
            <SideNavContent
              navItems={navItems}
              pathname={pathname}
              collapsed={false}
              role={role}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 border-r bg-white transition-[width] duration-300 md:block",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {!!role 
          ? <SideNavContent
              navItems={navItems}
              pathname={pathname}
              collapsed={collapsed}
              role={role}
              onToggle={() => setCollapsed((value) => !value)}
            />
        
          : "Loading"
        }
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 transition-all duration-300 md:px-8">
        {children}
      </main>
    </div>
  );
}

function SideNavContent({ navItems, pathname, collapsed, onToggle, onClose, role }) {
    function roleFormat(userRole){
        switch(userRole){
            case "EMPLOYEE":
                return "Employee";
            case "ADMIN":
                return "Admin";
            case "SYSADMIN":
                return "System Admin";
            default:
                return "Unclassified"
        }
    }
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-xl font-bold text-lime-500">{roleFormat(role)}</span>
        )}

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onClose ?? onToggle}
          className="ml-auto"
        >
          {onClose ? (
            <X className="size-5" />
          ) : collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-lime-500 text-black"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-black",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
