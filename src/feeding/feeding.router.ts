import { Router } from "express";
import {
  createFeedingHabitController,
  getAllFeedingHabitsController,
  getFeedingByIDController,
  getFeedingByFarmerController,
  getFeedingByDateController,
  getFeedingByMilkIDController,
  updateFeedingHabitController,
  deleteFeedingHabitController,
} from "./feeding.controller";
import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

const feedingRouter = Router();

// ── Static routes FIRST (before parameterized /:id) ───────────────────────────
feedingRouter.get("/all", adminRoleAuth, getAllFeedingHabitsController);
feedingRouter.get("/milk/:milkID", bothRoleAuth, getFeedingByMilkIDController);
feedingRouter.get(
  "/farmer/:farmerID/date/:date",
  bothRoleAuth,
  getFeedingByDateController,
);
feedingRouter.get(
  "/farmer/:farmerID",
  bothRoleAuth,
  getFeedingByFarmerController,
);

// ── Parameterized routes LAST ─────────────────────────────────────────────────
feedingRouter.get("/:id", bothRoleAuth, getFeedingByIDController);
feedingRouter.post("/", adminRoleAuth, createFeedingHabitController);
feedingRouter.put("/:id", adminRoleAuth, updateFeedingHabitController);
feedingRouter.delete("/:id", adminRoleAuth, deleteFeedingHabitController);

export default feedingRouter;
