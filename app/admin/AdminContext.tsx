"use client";
// app/admin/AdminContext.tsx — shares the logged-in admin and permission checks across admin pages.
import { createContext, useContext } from "react";
import type { AdminUser } from "@/lib/types";

const SUPER_ADMIN_ONLY = new Set([
  "profiles.delete",
  "staff.manage",
  "auditlogs.view",
  "settings.manage",
]);

interface AdminContextValue {
  admin: AdminUser | null;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

export const AdminContext = createContext<AdminContextValue>({
  admin: null,
  isSuperAdmin: false,
  hasPermission: () => false,
});

// Checks whether an AdminUser has a given permission, mirroring backend rules.
export function checkAdminPermission(admin: AdminUser | null, permission: string): boolean {
  if (!admin) return false;
  if (admin.adminRole === "super_admin") return true;
  if (SUPER_ADMIN_ONLY.has(permission)) return false;
  return Array.isArray(admin.permissions) && admin.permissions.includes(permission);
}

// Hook for admin pages to inspect the current staff user and their permissions.
export function useAdmin() {
  return useContext(AdminContext);
}
