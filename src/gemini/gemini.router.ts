import { Router } from "express";
import { getRecommendationsController } from "./gemini.controller";
import { bothRoleAuth } from "../middleware/bearAuth";

const geminiRouter = Router();

geminiRouter.get(
  "/recommendations/:farmerID",
  bothRoleAuth,
  getRecommendationsController,
);

export default geminiRouter;
