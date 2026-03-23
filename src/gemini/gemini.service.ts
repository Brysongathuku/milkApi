import axios from "axios";
import db from "../Drizzle/db";
import {
  CustomersTable,
  MilkTable,
  FeedingHabitsTable,
  WeatherRecordsTable,
} from "../Drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ── Fetch farmer data ─────────────────────────────────────────────────────
const fetchFarmerData = async (farmerID: number) => {
  const [farmer] = await db
    .select()
    .from(CustomersTable)
    .where(eq(CustomersTable.customerID, farmerID));

  if (!farmer) throw new Error(`Farmer ${farmerID} not found`);

  const milkRecords = await db
    .select()
    .from(MilkTable)
    .where(eq(MilkTable.farmerID, farmerID))
    .orderBy(desc(MilkTable.collectionDate))
    .limit(3);

  const feedingRecords = await db
    .select()
    .from(FeedingHabitsTable)
    .where(eq(FeedingHabitsTable.farmerID, farmerID))
    .orderBy(desc(FeedingHabitsTable.feedingDate))
    .limit(5);

  const weatherRecords = await db
    .select()
    .from(WeatherRecordsTable)
    .where(eq(WeatherRecordsTable.farmerID, farmerID))
    .orderBy(desc(WeatherRecordsTable.recordDate))
    .limit(3);

  return { farmer, milkRecords, feedingRecords, weatherRecords };
};

// ── Build minimal prompt ──────────────────────────────────────────────────
const buildPrompt = (data: Awaited<ReturnType<typeof fetchFarmerData>>) => {
  const { farmer, milkRecords, feedingRecords, weatherRecords } = data;

  const milk =
    milkRecords.length === 0
      ? "No milk records"
      : milkRecords
          .map(
            (m) =>
              `${m.collectionDate}:${m.quantityInLiters}L,${m.qualityGrade}`,
          )
          .join("|");

  const feeding =
    feedingRecords.length === 0
      ? "No feeding records"
      : feedingRecords
          .map((f) => `${f.feedingDate}:${f.feedType},${f.amountKg}kg`)
          .join("|");

  const weather =
    weatherRecords.length === 0
      ? "No weather records"
      : weatherRecords
          .map(
            (w) =>
              `${w.recordDate}:${w.temperatureCelsius}C,${w.humidity}%,${w.weatherCondition}`,
          )
          .join("|");

  const avgMilk =
    milkRecords.length > 0
      ? (
          milkRecords.reduce((s, m) => s + parseFloat(m.quantityInLiters), 0) /
          milkRecords.length
        ).toFixed(1)
      : "0";

  return `Dairy farm advisor. Analyze and return JSON only.
Farm:${farmer.firstName} ${farmer.lastName},${farmer.farmLocation ?? "Kenya"},${farmer.numberOfCows ?? "?"}cows,${farmer.cowBreed ?? "unknown breed"}
Milk(avg ${avgMilk}L):${milk}
Feeding:${feeding}
Weather:${weather}
Return ONLY this JSON:
{"yieldAnalysis":"1-2 sentences","feedingRecommendation":"1-2 sentences","weatherImpact":"1-2 sentences","healthAlert":"1-2 sentences","quickTips":["tip1","tip2","tip3"],"overallScore":75,"scoreLabel":"Good"}
scoreLabel: 0-40=Poor,41-60=Fair,61-80=Good,81-100=Excellent`;
};

// ── Sleep helper ──────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Call Gemini ───────────────────────────────────────────────────────────
export const getRecommendationsService = async (farmerID: number) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GEMINI_BASE_URL;

  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");
  if (!baseUrl) throw new Error("GEMINI_BASE_URL not set in .env");

  const farmerData = await fetchFarmerData(farmerID);
  const prompt = buildPrompt(farmerData);

  console.log(`🤖 Gemini request for farmer ${farmerID}`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);
  console.log(`🔑 Using model: ${baseUrl.split("/models/")[1]}`);

  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/3...`);

      const response = await axios.post(
        `${baseUrl}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        },
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      console.log(`✅ Gemini responded (${rawText.length} chars)`);

      // ── Clean markdown fences ─────────────────────────────────────────
      const cleaned = rawText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/gi, "")
        .trim();

      // ── Extract JSON object ───────────────────────────────────────────
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`No JSON in response: ${cleaned.substring(0, 200)}`);
      }

      let recommendations;
      try {
        recommendations = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(`Invalid JSON: ${jsonMatch[0].substring(0, 200)}`);
      }

      console.log(`🎉 Success for farmer ${farmerID}`);

      return {
        farmerID,
        farmerName: `${farmerData.farmer.firstName} ${farmerData.farmer.lastName}`,
        farmLocation: farmerData.farmer.farmLocation,
        cowBreed: farmerData.farmer.cowBreed,
        numberOfCows: farmerData.farmer.numberOfCows,
        dataUsed: {
          milkRecords: farmerData.milkRecords.length,
          feedingRecords: farmerData.feedingRecords.length,
          weatherRecords: farmerData.weatherRecords.length,
        },
        recommendations,
        generatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;
      const errData = error.response?.data?.error;

      console.error(`❌ Attempt ${attempt} failed:`);
      console.error(`   Status:  ${status}`);
      console.error(`   Code:    ${errData?.code}`);
      console.error(`   Message: ${errData?.message ?? error.message}`);

      if (status === 429) {
        const retryDetail = errData?.details?.find((d: any) =>
          d["@type"]?.includes("RetryInfo"),
        );
        const retrySeconds = parseInt(retryDetail?.retryDelay ?? "60") || 60;
        console.warn(
          `⏳ Rate limited — waiting ${retrySeconds}s before retry...`,
        );
        if (attempt < 3) await sleep(retrySeconds * 1000);
      } else if (status === 404) {
        console.error(`🔴 Model not found — check GEMINI_BASE_URL in .env`);
        throw new Error(`Model not found: ${baseUrl}`);
      } else if (status === 400) {
        console.error(`🔴 Bad request — prompt may be malformed`);
        throw new Error(`Bad request: ${errData?.message}`);
      } else if (status === 403) {
        console.error(`🔴 API key invalid or no permission`);
        throw new Error(`Invalid API key or permission denied`);
      } else {
        throw error;
      }
    }
  }

  const errMsg =
    lastError?.response?.data?.error?.message ?? lastError?.message;
  throw new Error(`Gemini failed after 3 attempts: ${errMsg}`);
};
