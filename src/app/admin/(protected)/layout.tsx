import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/admin/app-sidebar";
import { SiteHeader } from "@/components/layout/admin/site-header";
import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import { User } from "@/lib/auth";
import { Role } from "@prisma/client";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) unauthorized();
  const userRole = (user.role as Role) ?? Role.USER;
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" role={userRole} />
      <SidebarInset>
        <SiteHeader user={user as User} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
