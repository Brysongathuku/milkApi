import { Router } from "express";
import {
  getUnreadNotificationsController,
  resetUnreadNotificationsController,
} from "./notification.controller";
import { bothRoleAuth } from "../middleware/bearAuth";

const notificationRouter = Router();

// GET  /notifications/unread/:farmerID  — get badge count
notificationRouter.get(
  "/unread/:farmerID",
  bothRoleAuth,
  getUnreadNotificationsController,
);

// PUT  /notifications/reset/:farmerID   — mark all as read
notificationRouter.put(
  "/reset/:farmerID",
  bothRoleAuth,
  resetUnreadNotificationsController,
);

export default notificationRouter;
