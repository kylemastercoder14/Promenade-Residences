import prisma from "@/lib/db";
import { headers } from "next/headers";

export enum LogAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  ARCHIVE = "ARCHIVE",
  RETRIEVE = "RETRIEVE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  STATUS_CHANGE = "STATUS_CHANGE",
  PAYMENT_CREATE = "PAYMENT_CREATE",
  PAYMENT_UPDATE = "PAYMENT_UPDATE",
  PAYMENT_DELETE = "PAYMENT_DELETE",
}

export enum LogModule {
  ACCOUNTS = "ACCOUNTS",
  RESIDENTS = "RESIDENTS",
  VEHICLE_REGISTRATIONS = "VEHICLE_REGISTRATIONS",
  ANNOUNCEMENTS = "ANNOUNCEMENTS",
  AMENITY_RESERVATIONS = "AMENITY_RESERVATIONS",
  MAPS = "MAPS",
  MONTHLY_DUES = "MONTHLY_DUES",
  SETTINGS = "SETTINGS",
  AUTH = "AUTH",
  WHATS_NEW = "WHATS_NEW",
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface CreateLogParams {
  userId: string;
  action: LogAction;
  module: LogModule;
  entityId?: string;
  entityType?: string;
  description: string;
  metadata?: JsonValue | null;
}

/**
 * Creates a system log entry
 * This function should be called after successful operations
 */
export async function createSystemLog(params: CreateLogParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "Unknown";
    const userAgent = headersList.get("user-agent") || "Unknown";

    await prisma.systemLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        module: params.module,
        entityId: params.entityId,
        entityType: params.entityType,
        description: params.description,
        metadata: params.metadata ?? undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw errors for logging failures - log to console instead
    console.error("Failed to create system log:", error);
  }
}

/**
 * Helper function to create log descriptions
 */
export function createLogDescription(
  action: LogAction,
  entityType: string,
  entityIdentifier: string,
  details?: string
): string {
  const actionText = {
    CREATE: "created",
    UPDATE: "updated",
    DELETE: "deleted",
    ARCHIVE: "archived",
    RETRIEVE: "retrieved",
    LOGIN: "logged in",
    LOGOUT: "logged out",
    PASSWORD_CHANGE: "changed password",
    PROFILE_UPDATE: "updated profile",
    STATUS_CHANGE: "changed status",
    PAYMENT_CREATE: "created payment",
    PAYMENT_UPDATE: "updated payment",
    PAYMENT_DELETE: "deleted payment",
  }[action];

  let description = `${actionText} ${entityType}`;
  if (entityIdentifier) {
    description += ` (${entityIdentifier})`;
  }
  if (details) {
    description += ` - ${details}`;
  }

  return description;
}
