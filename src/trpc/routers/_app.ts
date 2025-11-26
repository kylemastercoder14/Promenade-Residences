import { createTRPCRouter } from "../init";
import { accountsRouter } from "@/lib/routers/accounts";
import { mapsRouter } from "@/lib/routers/maps";
import { amenityReservationsRouter } from "@/lib/routers/amenity-reservations";
import { announcementsRouter } from "@/lib/routers/announcements";
import { vehicleRegistrationsRouter } from "@/lib/routers/vehicle-registrations";
import { residentsRouter } from "@/lib/routers/residents";
import { monthlyDuesRouter } from "@/lib/routers/monthly-dues";
import { settingsRouter } from "@/lib/routers/settings";
import { logsRouter } from "@/lib/routers/logs";
import { feedbackRouter } from "@/lib/routers/feedback";

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  maps: mapsRouter,
  amenityReservations: amenityReservationsRouter,
  announcements: announcementsRouter,
  vehicleRegistrations: vehicleRegistrationsRouter,
  residents: residentsRouter,
  monthlyDues: monthlyDuesRouter,
  settings: settingsRouter,
  logs: logsRouter,
  feedback: feedbackRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
