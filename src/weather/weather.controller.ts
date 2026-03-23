import { Request, Response } from "express";
import {
  fetchAndSaveWeatherService,
  fetchLiveWeather,
  getWeatherByFarmerService,
  getWeatherByDateService,
} from "./weather.service";
import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { CustomersTable } from "../Drizzle/schema";

// ── Helper: get farmer location from DB ───────────────────────────────────
const getFarmerLocation = async (farmerID: number): Promise<string | null> => {
  const [farmer] = await db
    .select()
    .from(CustomersTable)
    .where(eq(CustomersTable.customerID, farmerID));
  return farmer?.farmLocation ?? null;
};

// ── GET /weather/farmer/:farmerID ─────────────────────────────────────────
export const getWeatherByFarmerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string); // ← cast
    const records = await getWeatherByFarmerService(farmerID);
    res.status(200).json({ message: "Weather records fetched", data: records });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch weather records",
      message: error.message,
    });
  }
};

// ── GET /weather/farmer/:farmerID/date/:date ──────────────────────────────
export const getWeatherByDateController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string); // ← cast
    const date = req.params.date as string; // ← cast

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      return;
    }

    const record = await getWeatherByDateService(farmerID, date);
    if (!record) {
      res.status(404).json({ error: "No weather record found for this date" });
      return;
    }
    res.status(200).json({ message: "Weather record fetched", data: record });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch weather record",
      message: error.message,
    });
  }
};

// ── POST /weather/fetch/:farmerID ─────────────────────────────────────────
export const fetchAndSaveWeatherController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string); // ← cast
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const location = await getFarmerLocation(farmerID);
    if (!location) {
      res.status(400).json({ error: "Farmer has no farm location set" });
      return;
    }

    const record = await fetchAndSaveWeatherService(farmerID, location, today);
    res
      .status(200)
      .json({ message: "Weather fetched and saved", data: record });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch weather",
      message: error.message,
    });
  }
};

// ── GET /weather/current/:farmerID ────────────────────────────────────────
export const getCurrentWeatherController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string); // ← cast

    const location = await getFarmerLocation(farmerID);
    if (!location) {
      res.status(400).json({ error: "Farmer has no farm location set" });
      return;
    }

    const weather = await fetchLiveWeather(location);
    res.status(200).json({ message: "Current weather fetched", data: weather });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch current weather",
      message: error.message,
    });
  }
};
