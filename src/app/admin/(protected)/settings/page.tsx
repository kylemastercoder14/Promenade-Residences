import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";
import { SettingsClient } from "./_components/settings-client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN] });
  return <SettingsClient />;
};

export default Page;

