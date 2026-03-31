import { eq, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { CustomersTable } from "../Drizzle/schema";

// ── Increment unread count after SMS sent ─────────────────────────────────
export const incrementUnreadNotificationsService = async (
  farmerID: number,
): Promise<void> => {
  try {
    await db
      .update(CustomersTable)
      .set({
        unreadNotifications: sql`${CustomersTable.unreadNotifications} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(CustomersTable.customerID, farmerID));

    console.log(`🔔 Unread count incremented for farmer ${farmerID}`);
  } catch (error: any) {
    console.error(
      "❌ incrementUnreadNotificationsService error:",
      error.message,
    );
  }
};

// ── Get unread count ──────────────────────────────────────────────────────
export const getUnreadNotificationsService = async (
  farmerID: number,
): Promise<number> => {
  const [farmer] = await db
    .select({ unreadNotifications: CustomersTable.unreadNotifications })
    .from(CustomersTable)
    .where(eq(CustomersTable.customerID, farmerID));

  if (!farmer) throw new Error("Farmer not found");
  return farmer.unreadNotifications ?? 0;
};

// ── Reset unread count when farmer opens notifications ────────────────────
export const resetUnreadNotificationsService = async (
  farmerID: number,
): Promise<void> => {
  try {
    await db
      .update(CustomersTable)
      .set({
        unreadNotifications: 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(CustomersTable.customerID, farmerID));

    console.log(`✅ Unread count reset for farmer ${farmerID}`);
  } catch (error: any) {
    console.error("❌ resetUnreadNotificationsService error:", error.message);
  }
};
