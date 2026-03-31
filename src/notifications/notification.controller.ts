import { Request, Response } from "express";
import {
  getUnreadNotificationsService,
  resetUnreadNotificationsService,
} from "./notification.service";

// ── GET /notifications/unread/:farmerID ───────────────────────────────────
export const getUnreadNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string);
    if (isNaN(farmerID)) {
      res.status(400).json({ message: "Invalid farmerID" });
      return;
    }

    const count = await getUnreadNotificationsService(farmerID);
    res.status(200).json({ farmerID, unreadCount: count });
  } catch (error: any) {
    console.error("❌ getUnreadNotificationsController error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /notifications/reset/:farmerID ────────────────────────────────────
export const resetUnreadNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string);
    if (isNaN(farmerID)) {
      res.status(400).json({ message: "Invalid farmerID" });
      return;
    }

    await resetUnreadNotificationsService(farmerID);
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error: any) {
    console.error(
      "❌ resetUnreadNotificationsController error:",
      error.message,
    );
    res.status(500).json({ message: error.message });
  }
};
