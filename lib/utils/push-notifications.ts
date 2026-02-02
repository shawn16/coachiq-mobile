import { prisma } from "@/lib/db";

/**
 * Expo Push API endpoint for sending push notifications.
 */
const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Maximum number of notifications per batch (Expo API limit).
 */
const BATCH_SIZE = 100;

/**
 * Shape of an Expo push notification object.
 */
interface ExpoPushNotification {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: "default";
  priority: "high";
}

/**
 * Shape of a single push ticket returned by the Expo Push API.
 */
interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  details?: {
    error?: "DeviceNotRegistered" | "InvalidCredentials" | "MessageTooBig" | "MessageRateExceeded";
  };
  message?: string;
}

/**
 * Response shape from the Expo Push API.
 */
interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

/**
 * Sends an array of Expo push notifications, batching in groups of 100.
 * Fire-and-forget: sends batches without awaiting within the calling
 * endpoint's request/response cycle. Handles DeviceNotRegistered errors
 * by deactivating the corresponding tokens.
 *
 * @param notifications - Array of Expo push notification objects
 */
export async function sendPushNotifications(
  notifications: ExpoPushNotification[]
): Promise<void> {
  if (notifications.length === 0) return;

  // Split into batches of BATCH_SIZE
  const batches: ExpoPushNotification[][] = [];
  for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
    batches.push(notifications.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error("Expo Push API error:", response.status, await response.text());
        continue;
      }

      const result = (await response.json()) as ExpoPushResponse;

      // Check for DeviceNotRegistered errors and deactivate those tokens
      const tokensToDeactivate: string[] = [];
      for (let i = 0; i < result.data.length; i++) {
        const ticket = result.data[i];
        if (
          ticket.status === "error" &&
          ticket.details?.error === "DeviceNotRegistered"
        ) {
          tokensToDeactivate.push(batch[i].to);
        }
      }

      if (tokensToDeactivate.length > 0) {
        await prisma.deviceToken.updateMany({
          where: { token: { in: tokensToDeactivate } },
          data: { isActive: false },
        });
      }
    } catch (error) {
      // Log but don't throw — fire-and-forget pattern
      console.error("Failed to send push notification batch:", error);
    }
  }
}

// ---------------------------------------------------------------------------
// Helper: send wellness request notifications to athletes
// ---------------------------------------------------------------------------

interface WellnessRequestNotificationParams {
  teamId: string;
  groupId: string | null;
  coachName: string;
  requestId: string;
}

/**
 * Sends "Wellness Check-In" push notifications to targeted athletes.
 * Resolves recipients by team and optional group, queries active device
 * tokens, and fires notifications via the Expo Push API.
 *
 * @returns Number of notifications sent
 */
export async function sendWellnessRequestNotifications(
  params: WellnessRequestNotificationParams
): Promise<number> {
  const { teamId, groupId, coachName, requestId } = params;

  // Resolve target athletes
  const athletes = await prisma.athlete.findMany({
    where: {
      teamId,
      status: "active",
      ...(groupId ? { groupId } : {}),
    },
    select: { id: true },
  });

  if (athletes.length === 0) return 0;

  const athleteIds = athletes.map((a) => a.id);

  // Query active device tokens for those athletes
  const deviceTokens = await prisma.deviceToken.findMany({
    where: {
      userId: { in: athleteIds },
      userRole: "athlete",
      isActive: true,
    },
  });

  if (deviceTokens.length === 0) return 0;

  const notifications: ExpoPushNotification[] = deviceTokens.map((dt) => ({
    to: dt.token,
    title: "Wellness Check-In",
    body: `Coach ${coachName} is requesting a wellness check-in`,
    data: { type: "wellness_request", requestId },
    sound: "default" as const,
    priority: "high" as const,
  }));

  // Fire-and-forget — caller uses void to avoid blocking
  void sendPushNotifications(notifications);

  return notifications.length;
}

// ---------------------------------------------------------------------------
// Helper: send RPE request notifications to athletes
// ---------------------------------------------------------------------------

interface RpeRequestNotificationParams {
  teamId: string;
  groupId: string | null;
  workoutName: string;
  requestId: string;
  workoutId: string;
}

/**
 * Sends "Rate Your Effort" push notifications to targeted athletes.
 * Resolves recipients by team and optional group, queries active device
 * tokens, and fires notifications via the Expo Push API.
 *
 * @returns Number of notifications sent
 */
export async function sendRpeRequestNotifications(
  params: RpeRequestNotificationParams
): Promise<number> {
  const { teamId, groupId, workoutName, requestId, workoutId } = params;

  // Resolve target athletes
  const athletes = await prisma.athlete.findMany({
    where: {
      teamId,
      status: "active",
      ...(groupId ? { groupId } : {}),
    },
    select: { id: true },
  });

  if (athletes.length === 0) return 0;

  const athleteIds = athletes.map((a) => a.id);

  // Query active device tokens for those athletes
  const deviceTokens = await prisma.deviceToken.findMany({
    where: {
      userId: { in: athleteIds },
      userRole: "athlete",
      isActive: true,
    },
  });

  if (deviceTokens.length === 0) return 0;

  const notifications: ExpoPushNotification[] = deviceTokens.map((dt) => ({
    to: dt.token,
    title: "Rate Your Effort",
    body: `How hard was ${workoutName}? Submit your RPE.`,
    data: { type: "rpe_request", requestId, workoutId },
    sound: "default" as const,
    priority: "high" as const,
  }));

  // Fire-and-forget — caller uses void to avoid blocking
  void sendPushNotifications(notifications);

  return notifications.length;
}

// ---------------------------------------------------------------------------
// Helper: send critical alert notification to the coach
// ---------------------------------------------------------------------------

interface CriticalAlertNotificationParams {
  coachId: string;
  athleteName: string;
  alertMessage: string;
  alertId: string;
}

/**
 * Sends a "Critical Alert" push notification to the coach when a critical
 * wellness alert is created for one of their athletes.
 *
 * @returns Number of notifications sent
 */
export async function sendCriticalAlertNotification(
  params: CriticalAlertNotificationParams
): Promise<number> {
  const { coachId, athleteName, alertMessage, alertId } = params;

  // Query active device tokens for the coach
  const deviceTokens = await prisma.deviceToken.findMany({
    where: {
      userId: coachId,
      userRole: "coach",
      isActive: true,
    },
  });

  if (deviceTokens.length === 0) return 0;

  const notifications: ExpoPushNotification[] = deviceTokens.map((dt) => ({
    to: dt.token,
    title: "⚠️ Critical Alert",
    body: `${athleteName} needs attention: ${alertMessage}`,
    data: { type: "critical_alert", alertId },
    sound: "default" as const,
    priority: "high" as const,
  }));

  // Fire-and-forget — caller uses void to avoid blocking
  void sendPushNotifications(notifications);

  return notifications.length;
}
