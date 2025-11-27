import { Role } from "@prisma/client";

export const ADMIN_FEATURE_ACCESS = {
  DASHBOARD: [Role.SUPERADMIN, Role.ADMIN, Role.ACCOUNTING],
  ACCOUNTS: [Role.SUPERADMIN, Role.ADMIN],
  RESIDENTS: [Role.SUPERADMIN, Role.ADMIN],
  ANNOUNCEMENTS: [Role.SUPERADMIN, Role.ADMIN],
  ANNOUNCEMENTS_PUBLISH: [Role.SUPERADMIN],
  WHATS_NEW: [Role.SUPERADMIN, Role.ADMIN],
  WHATS_NEW_PUBLISH: [Role.SUPERADMIN],
  TRANSACTIONS: [Role.SUPERADMIN, Role.ACCOUNTING],
  VEHICLE_REGISTRATIONS: [Role.SUPERADMIN, Role.ACCOUNTING],
  CONTACT: [Role.SUPERADMIN],
  FEEDBACK: [Role.SUPERADMIN],
  MAPS: [Role.SUPERADMIN],
  SETTINGS: [Role.SUPERADMIN],
  SYSTEM_LOGS: [Role.SUPERADMIN],
  NOTIFICATIONS: [Role.SUPERADMIN, Role.ADMIN],
} as const;

export type AdminFeature = keyof typeof ADMIN_FEATURE_ACCESS;

export const normalizeRole = (role?: string | null): Role => {
  if (!role) return Role.USER;

  const normalized = role.toUpperCase() as Role;
  if ((Object.values(Role) as string[]).includes(normalized)) {
    return normalized;
  }

  return Role.USER;
};

export const hasRequiredRole = (
  role: string | Role | null | undefined,
  allowed?: Role[] | null
) => {
  if (!allowed || allowed.length === 0) {
    return true;
  }

  const normalized = normalizeRole(typeof role === "string" ? role : role ?? Role.USER);
  return allowed.includes(normalized);
};

