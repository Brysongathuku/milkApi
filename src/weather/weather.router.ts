import { Router } from "express";
import {
  getWeatherByFarmerController,
  getWeatherByDateController,
  fetchAndSaveWeatherController,
  getCurrentWeatherController,
} from "./weather.controller";
import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

const weatherRouter = Router();

// Static routes first
weatherRouter.get(
  "/farmer/:farmerID/date/:date",
  bothRoleAuth,
  getWeatherByDateController,
);
weatherRouter.get(
  "/farmer/:farmerID",
  bothRoleAuth,
  getWeatherByFarmerController,
);
weatherRouter.get(
  "/current/:farmerID",
  bothRoleAuth,
  getCurrentWeatherController,
);
weatherRouter.post(
  "/fetch/:farmerID",
  adminRoleAuth,
  fetchAndSaveWeatherController,
);

export default weatherRouter;
