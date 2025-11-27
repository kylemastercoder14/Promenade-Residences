import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { hasRequiredRole, normalizeRole } from "./rbac";

type RequireAuthOptions = {
  roles?: Role[];
  redirectTo?: string;
};

export const requireAuth = async (options?: RequireAuthOptions) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(options?.redirectTo ?? "/admin/login");
  }

  const userRole = normalizeRole(session.user.role);

  if (options?.roles && !hasRequiredRole(userRole, options.roles)) {
    redirect(options.redirectTo ?? "/admin/dashboard");
  }

  return session;
};

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/admin/dashboard");
};
