import axios from "axios";
import db from "../Drizzle/db";
import { WeatherRecordsTable } from "../Drizzle/schema";
import { eq, and } from "drizzle-orm";

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string; main: string }[];
  wind: { speed: number };
  rain?: { "1h"?: number; "3h"?: number };
  name: string;
}

// ── Fetch live weather from OpenWeatherMap ────────────────────────────────
export const fetchLiveWeather = async (location: string) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = process.env.OPENWEATHER_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("OpenWeatherMap API key or base URL not configured");
  }

  const response = await axios.get<OpenWeatherResponse>(baseUrl, {
    params: {
      q: `${location},KE`, // KE = Kenya country code
      appid: apiKey,
      units: "metric", // Celsius
    },
  });

  const data = response.data;

  return {
    temperatureCelsius: data.main.temp.toFixed(2),
    humidity: data.main.humidity.toFixed(2),
    rainfallMm: (data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0).toFixed(2),
    weatherCondition: data.weather[0]?.main ?? "Unknown",
    windSpeedKph: (data.wind.speed * 3.6).toFixed(2), // m/s → km/h
    location: data.name,
  };
};

// ── Fetch and save weather for a farmer ──────────────────────────────────
export const fetchAndSaveWeatherService = async (
  farmerID: number,
  location: string,
  recordDate: string,
) => {
  // Check if weather already saved for this farmer + date
  const existing = await db
    .select()
    .from(WeatherRecordsTable)
    .where(
      and(
        eq(WeatherRecordsTable.farmerID, farmerID),
        eq(WeatherRecordsTable.recordDate, recordDate),
      ),
    );

  if (existing.length > 0) {
    // Already have weather for this date — return existing
    return existing[0];
  }

  // Fetch from OpenWeatherMap
  const weatherData = await fetchLiveWeather(location);

  // Save to DB
  const [saved] = await db
    .insert(WeatherRecordsTable)
    .values({
      farmerID,
      recordDate,
      temperatureCelsius: weatherData.temperatureCelsius,
      humidity: weatherData.humidity,
      rainfallMm: weatherData.rainfallMm,
      weatherCondition: weatherData.weatherCondition,
      windSpeedKph: weatherData.windSpeedKph,
      location: weatherData.location,
      dataSource: "openweather",
    })
    .returning();

  return saved;
};

// ── Get all weather records for a farmer ─────────────────────────────────
export const getWeatherByFarmerService = async (farmerID: number) => {
  return await db
    .select()
    .from(WeatherRecordsTable)
    .where(eq(WeatherRecordsTable.farmerID, farmerID))
    .orderBy(WeatherRecordsTable.recordDate);
};

// ── Get weather for a farmer on a specific date ───────────────────────────
export const getWeatherByDateService = async (
  farmerID: number,
  date: string,
) => {
  const result = await db
    .select()
    .from(WeatherRecordsTable)
    .where(
      and(
        eq(WeatherRecordsTable.farmerID, farmerID),
        eq(WeatherRecordsTable.recordDate, date),
      ),
    );
  return result[0] ?? null;
};
