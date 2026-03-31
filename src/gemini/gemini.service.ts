import axios from "axios";
import db from "../Drizzle/db";
import {
  CustomersTable,
  MilkTable,
  FeedingHabitsTable,
  WeatherRecordsTable,
} from "../Drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// BREED STANDARDS (KALRO / Kenya Dairy Board)
// ═══════════════════════════════════════════════════════════════════════════
const BREED_STANDARDS: Record<
  string,
  {
    dailyYieldRange: string;
    minDailyYield: number;
    maxDailyYield: number;
    napierKgPerCow: number;
    dairyMealKgPerCow: number;
    dryMatterNeed: number;
    crudeProteinPct: number;
    energyMjMe: number;
    waterLitersPerCow: number;
    minFatContent: number;
    pricePerKgFeed: number;
  }
> = {
  Friesian: {
    dailyYieldRange: "20-35L/cow/day",
    minDailyYield: 20,
    maxDailyYield: 35,
    napierKgPerCow: 35,
    dairyMealKgPerCow: 6,
    dryMatterNeed: 18,
    crudeProteinPct: 16,
    energyMjMe: 11,
    waterLitersPerCow: 100,
    minFatContent: 3.5,
    pricePerKgFeed: 25,
  },
  Holstein: {
    dailyYieldRange: "25-40L/cow/day",
    minDailyYield: 25,
    maxDailyYield: 40,
    napierKgPerCow: 40,
    dairyMealKgPerCow: 7,
    dryMatterNeed: 20,
    crudeProteinPct: 17,
    energyMjMe: 12,
    waterLitersPerCow: 120,
    minFatContent: 3.2,
    pricePerKgFeed: 25,
  },
  Ayrshire: {
    dailyYieldRange: "12-22L/cow/day",
    minDailyYield: 12,
    maxDailyYield: 22,
    napierKgPerCow: 30,
    dairyMealKgPerCow: 4,
    dryMatterNeed: 15,
    crudeProteinPct: 15,
    energyMjMe: 10.5,
    waterLitersPerCow: 80,
    minFatContent: 3.8,
    pricePerKgFeed: 25,
  },
  Jersey: {
    dailyYieldRange: "10-18L/cow/day",
    minDailyYield: 10,
    maxDailyYield: 18,
    napierKgPerCow: 25,
    dairyMealKgPerCow: 3.5,
    dryMatterNeed: 13,
    crudeProteinPct: 15,
    energyMjMe: 10,
    waterLitersPerCow: 70,
    minFatContent: 4.5,
    pricePerKgFeed: 25,
  },
  Guernsey: {
    dailyYieldRange: "10-18L/cow/day",
    minDailyYield: 10,
    maxDailyYield: 18,
    napierKgPerCow: 25,
    dairyMealKgPerCow: 3.5,
    dryMatterNeed: 13,
    crudeProteinPct: 15,
    energyMjMe: 10,
    waterLitersPerCow: 70,
    minFatContent: 4.2,
    pricePerKgFeed: 25,
  },
  Sahiwal: {
    dailyYieldRange: "6-14L/cow/day",
    minDailyYield: 6,
    maxDailyYield: 14,
    napierKgPerCow: 20,
    dairyMealKgPerCow: 2,
    dryMatterNeed: 10,
    crudeProteinPct: 13,
    energyMjMe: 9.5,
    waterLitersPerCow: 60,
    minFatContent: 4.0,
    pricePerKgFeed: 25,
  },
  "Brown Swiss": {
    dailyYieldRange: "15-25L/cow/day",
    minDailyYield: 15,
    maxDailyYield: 25,
    napierKgPerCow: 32,
    dairyMealKgPerCow: 5,
    dryMatterNeed: 16,
    crudeProteinPct: 15,
    energyMjMe: 11,
    waterLitersPerCow: 90,
    minFatContent: 3.6,
    pricePerKgFeed: 25,
  },
  Crossbreed: {
    dailyYieldRange: "8-18L/cow/day",
    minDailyYield: 8,
    maxDailyYield: 18,
    napierKgPerCow: 28,
    dairyMealKgPerCow: 3,
    dryMatterNeed: 14,
    crudeProteinPct: 14,
    energyMjMe: 10,
    waterLitersPerCow: 80,
    minFatContent: 3.5,
    pricePerKgFeed: 25,
  },
};

const parseBreeds = (cowBreed: string): string[] => {
  const known = Object.keys(BREED_STANDARDS);
  const found = known.filter((k) =>
    cowBreed.toLowerCase().includes(k.toLowerCase()),
  );
  return found.length > 0 ? found : ["Crossbreed"];
};

const getBreedStandard = (breed: string) =>
  BREED_STANDARDS[breed] ?? BREED_STANDARDS["Crossbreed"];

// ═══════════════════════════════════════════════════════════════════════════
// FETCH FARMER DATA — last 30 days
// ═══════════════════════════════════════════════════════════════════════════
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
    .limit(60);

  const feedingRecords = await db
    .select()
    .from(FeedingHabitsTable)
    .where(eq(FeedingHabitsTable.farmerID, farmerID))
    .orderBy(desc(FeedingHabitsTable.feedingDate))
    .limit(60);

  const weatherRecords = await db
    .select()
    .from(WeatherRecordsTable)
    .where(eq(WeatherRecordsTable.farmerID, farmerID))
    .orderBy(desc(WeatherRecordsTable.recordDate))
    .limit(30);

  return { farmer, milkRecords, feedingRecords, weatherRecords };
};

// ═══════════════════════════════════════════════════════════════════════════
// PRE-CALCULATE ALL ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
const calculateAnalytics = (
  data: Awaited<ReturnType<typeof fetchFarmerData>>,
) => {
  const { farmer, milkRecords, feedingRecords, weatherRecords } = data;
  const numberOfCows = farmer.numberOfCows ?? 1;
  const breed = parseBreeds(farmer.cowBreed ?? "Crossbreed")[0];
  const standard = getBreedStandard(breed);

  // ── 1. YIELD ─────────────────────────────────────────────────────────
  const totalLiters = milkRecords.reduce(
    (s, m) => s + parseFloat(m.quantityInLiters),
    0,
  );
  const avgPerSession =
    milkRecords.length > 0 ? totalLiters / milkRecords.length : 0;
  const avgPerCow = avgPerSession / numberOfCows;
  const highestYield =
    milkRecords.length > 0
      ? Math.max(...milkRecords.map((m) => parseFloat(m.quantityInLiters)))
      : 0;
  const lowestYield =
    milkRecords.length > 0
      ? Math.min(...milkRecords.map((m) => parseFloat(m.quantityInLiters)))
      : 0;

  const half = Math.floor(milkRecords.length / 2);
  const recent = milkRecords.slice(0, half);
  const older = milkRecords.slice(half);
  const recentAvg =
    recent.length > 0
      ? recent.reduce((s, m) => s + parseFloat(m.quantityInLiters), 0) /
        recent.length
      : 0;
  const olderAvg =
    older.length > 0
      ? older.reduce((s, m) => s + parseFloat(m.quantityInLiters), 0) /
        older.length
      : 0;
  const yieldTrendPct =
    olderAvg > 0 ? (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1) : "0";
  const yieldTrend =
    parseFloat(yieldTrendPct) > 5
      ? "IMPROVING"
      : parseFloat(yieldTrendPct) < -5
        ? "DECLINING"
        : "STABLE";

  const latestYield =
    milkRecords.length > 0 ? parseFloat(milkRecords[0].quantityInLiters) : 0;
  const previousYield =
    milkRecords.length > 1
      ? parseFloat(milkRecords[1].quantityInLiters)
      : latestYield;
  const yieldDropPct =
    previousYield > 0
      ? (((latestYield - previousYield) / previousYield) * 100).toFixed(1)
      : "0";
  const criticalYieldDrop = parseFloat(yieldDropPct) <= -20;

  const midStandard = (standard.minDailyYield + standard.maxDailyYield) / 2;
  const performancePct =
    midStandard > 0 ? ((avgPerCow / midStandard) * 100).toFixed(1) : "0";
  const performanceStatus =
    parseFloat(performancePct) >= 90
      ? "Above/At standard"
      : parseFloat(performancePct) >= 70
        ? "Slightly below standard"
        : "Significantly below standard";

  // ── 2. FAT CONTENT ────────────────────────────────────────────────────
  const fatRecords = milkRecords.filter((m) => m.fatContent != null);
  const avgFat =
    fatRecords.length > 0
      ? fatRecords.reduce((s, m) => s + parseFloat(m.fatContent!), 0) /
        fatRecords.length
      : null;
  const fatAlert = avgFat !== null && avgFat < standard.minFatContent;
  const fatTrend = (() => {
    if (fatRecords.length < 4) return "insufficient data";
    const rf = fatRecords.slice(0, 2).map((m) => parseFloat(m.fatContent!));
    const of_ = fatRecords.slice(-2).map((m) => parseFloat(m.fatContent!));
    const ra = rf.reduce((a, b) => a + b, 0) / rf.length;
    const oa = of_.reduce((a, b) => a + b, 0) / of_.length;
    return ra < oa ? "DROPPING" : ra > oa ? "RISING" : "STABLE";
  })();

  // ── 3. FEED ───────────────────────────────────────────────────────────
  const totalFeedKg = feedingRecords.reduce(
    (s, f) => s + parseFloat(f.amountKg),
    0,
  );
  const avgFeedPerSession =
    feedingRecords.length > 0 ? totalFeedKg / feedingRecords.length : 0;
  const feedEfficiency =
    avgPerSession > 0 && avgFeedPerSession > 0
      ? (avgFeedPerSession / avgPerSession).toFixed(2)
      : "N/A";
  const recommendedDailyFeed =
    (standard.napierKgPerCow + standard.dairyMealKgPerCow) * numberOfCows;
  const feedDeficit = recommendedDailyFeed - avgFeedPerSession;
  const feedBelowStandard = feedDeficit > 0;

  const feedTypeCount: Record<string, number> = {};
  feedingRecords.forEach((f) => {
    feedTypeCount[f.feedType] = (feedTypeCount[f.feedType] ?? 0) + 1;
  });
  const dominantFeed =
    Object.entries(feedTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Unknown";

  // ── 4. FINANCIAL ──────────────────────────────────────────────────────
  const totalRevenue = milkRecords.reduce(
    (s, m) => s + parseFloat(m.totalAmount),
    0,
  );
  const totalFeedCost = totalFeedKg * standard.pricePerKgFeed;
  const profitMargin =
    totalRevenue > 0
      ? (((totalRevenue - totalFeedCost) / totalRevenue) * 100).toFixed(1)
      : "0";
  const revenuePerLiter =
    totalLiters > 0 ? (totalRevenue / totalLiters).toFixed(2) : "0";
  const costPerLiter =
    totalLiters > 0 ? (totalFeedCost / totalLiters).toFixed(2) : "0";
  const dailyRevenue =
    milkRecords.length > 0
      ? (totalRevenue / milkRecords.length).toFixed(2)
      : "0";
  const dailyFeedCost =
    feedingRecords.length > 0
      ? (totalFeedCost / feedingRecords.length).toFixed(2)
      : "0";

  // ── 5. WEATHER CORRELATION ────────────────────────────────────────────
  const weatherMap: Record<string, { temp: number; humidity: number }> = {};
  weatherRecords.forEach((w) => {
    if (w.temperatureCelsius && w.humidity) {
      weatherMap[w.recordDate] = {
        temp: parseFloat(w.temperatureCelsius),
        humidity: parseFloat(w.humidity),
      };
    }
  });

  const heatStressSessions = milkRecords.filter((m) => {
    const w = weatherMap[m.collectionDate];
    return w && w.temp > 30;
  });
  const heatStressAvgYield =
    heatStressSessions.length > 0
      ? (
          heatStressSessions.reduce(
            (s, m) => s + parseFloat(m.quantityInLiters),
            0,
          ) / heatStressSessions.length
        ).toFixed(1)
      : null;

  const normalSessions = milkRecords.filter((m) => {
    const w = weatherMap[m.collectionDate];
    return w && w.temp <= 30;
  });
  const normalAvgYield =
    normalSessions.length > 0
      ? (
          normalSessions.reduce(
            (s, m) => s + parseFloat(m.quantityInLiters),
            0,
          ) / normalSessions.length
        ).toFixed(1)
      : null;

  const latestWeather = weatherRecords[0];
  const heatStressAlert = latestWeather
    ? parseFloat(latestWeather.temperatureCelsius ?? "0") > 30
    : false;

  // ── 6. SMART ALERTS ───────────────────────────────────────────────────
  const alerts: string[] = [];

  if (criticalYieldDrop) {
    alerts.push(
      `🚨 Yield dropped ${Math.abs(parseFloat(yieldDropPct))}% — from ${previousYield.toFixed(1)}L to ${latestYield.toFixed(1)}L last session`,
    );
  }
  if (feedBelowStandard) {
    alerts.push(
      `⚠️ Feed deficit ${feedDeficit.toFixed(1)}kg/day — current ${avgFeedPerSession.toFixed(1)}kg vs recommended ${recommendedDailyFeed.toFixed(1)}kg for ${numberOfCows} cows`,
    );
  }
  if (fatAlert && avgFat !== null) {
    alerts.push(
      `⚠️ Fat ${avgFat.toFixed(1)}% is below ${standard.minFatContent}% standard — add energy-dense feed`,
    );
  }
  if (heatStressAlert) {
    alerts.push(
      `🌡️ Heat stress active — increase water to ${Math.round(standard.waterLitersPerCow * 1.3)}L/cow and add electrolytes`,
    );
  }
  if (yieldTrend === "DECLINING") {
    alerts.push(
      `📉 Production declined ${Math.abs(parseFloat(yieldTrendPct))}% over 30 days — review feeding and health`,
    );
  }

  return {
    totalLiters: totalLiters.toFixed(1),
    avgPerSession: avgPerSession.toFixed(1),
    avgPerCow: avgPerCow.toFixed(1),
    highestYield: highestYield.toFixed(1),
    lowestYield: lowestYield.toFixed(1),
    yieldTrend,
    yieldTrendPct,
    yieldDropPct,
    criticalYieldDrop,
    performancePct,
    performanceStatus,
    avgFat: avgFat?.toFixed(1) ?? "N/A",
    fatAlert,
    fatTrend,
    avgFeedPerSession: avgFeedPerSession.toFixed(1),
    feedEfficiency,
    recommendedDailyFeed: recommendedDailyFeed.toFixed(1),
    feedDeficit: feedDeficit.toFixed(1),
    feedBelowStandard,
    dominantFeed,
    totalFeedKg: totalFeedKg.toFixed(1),
    totalRevenue: totalRevenue.toFixed(2),
    totalFeedCost: totalFeedCost.toFixed(2),
    profitMargin,
    revenuePerLiter,
    costPerLiter,
    dailyRevenue,
    dailyFeedCost,
    heatStressAlert,
    heatStressSessions: heatStressSessions.length,
    heatStressAvgYield,
    normalAvgYield,
    latestTemp: latestWeather?.temperatureCelsius ?? "N/A",
    latestHumidity: latestWeather?.humidity ?? "N/A",
    latestRainfall: latestWeather?.rainfallMm ?? "N/A",
    latestCondition: latestWeather?.weatherCondition ?? "N/A",
    alerts,
    alertCount: alerts.length,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// BUILD PROMPT — CONCISE BULLET-FIRST OUTPUT
// ═══════════════════════════════════════════════════════════════════════════
const buildPrompt = (
  data: Awaited<ReturnType<typeof fetchFarmerData>>,
  analytics: ReturnType<typeof calculateAnalytics>,
) => {
  const { farmer, milkRecords, feedingRecords, weatherRecords } = data;
  const numberOfCows = farmer.numberOfCows ?? 1;
  const cowBreedRaw = farmer.cowBreed ?? "Crossbreed";
  const breeds = parseBreeds(cowBreedRaw);
  const isMultiBreed = breeds.length > 1;
  const primaryBreed = breeds[0];
  const standard = getBreedStandard(primaryBreed);

  const breedStandardsSection = breeds
    .map((b) => {
      const s = getBreedStandard(b);
      return `${b}: ${s.dailyYieldRange} | napier ${s.napierKgPerCow}kg | meal ${s.dairyMealKgPerCow}kg | water ${s.waterLitersPerCow}L | fat>=${s.minFatContent}%`;
    })
    .join("\n");

  const milkSection = milkRecords
    .slice(0, 15)
    .map(
      (m) =>
        `${m.collectionDate}: ${m.quantityInLiters}L | ${m.qualityGrade} | fat:${m.fatContent ?? "N/A"}%`,
    )
    .join("\n");

  const feedSection = feedingRecords
    .slice(0, 10)
    .map(
      (f) =>
        `${f.feedingDate}: ${f.feedType} ${f.amountKg}kg [${f.feedingTime}]${f.supplementName ? ` + ${f.supplementName}` : ""}`,
    )
    .join("\n");

  const weatherSection = weatherRecords
    .slice(0, 7)
    .map(
      (w) =>
        `${w.recordDate}: ${w.temperatureCelsius}°C | hum:${w.humidity}% | rain:${w.rainfallMm}mm | ${w.weatherCondition}`,
    )
    .join("\n");

  const breedRecsTemplate = breeds
    .map((b) => {
      const s = getBreedStandard(b);
      return `{
      "breed": "${b}",
      "yieldStandard": "${s.dailyYieldRange}",
      "feedingPlan": {
        "morning":         "EXACT: [feed] [kg]/cow + [feed] [kg]/cow + water [L]/cow",
        "afternoon":       "EXACT: [feed] [kg]/cow + mineral lick [g]/cow + water [L]/cow",
        "evening":         "EXACT: [feed] [kg]/cow + dairy meal [kg]/cow + [supplement] [g]/cow",
        "dailyTotalPerCow":"[total kg] DM/cow/day"
      },
      "supplementPlan": "• Mineral lick: [g]/cow/day  • [supplement]: [dose]  • [supplement]: [dose]",
      "yieldTarget": "[N]L/cow/day in 30 days",
      "specificTips": ["≤12 word tip", "≤12 word tip", "≤12 word tip"]
    }`;
    })
    .join(",\n");

  return `You are a KALRO-certified Kenyan dairy advisor. Generate CONCISE, DATA-DRIVEN recommendations.

WRITING RULES — CRITICAL:
1. Every text field must be SHORT: max 2 sentences OR a bullet list — never long paragraphs
2. Use numbers and units, not vague descriptions
3. Start bullet lists with "• " — one fact per bullet, max 12 words each
4. No filler phrases ("it is important to note", "you should consider", "please ensure")
5. Lead with the key number or action, then the reason in ≤8 words
6. quickTips: each tip must be one sentence, max 15 words, starting with an action verb

═══════════ FARM PROFILE ═══════════
Farmer: ${farmer.firstName} ${farmer.lastName} | Location: ${farmer.farmLocation ?? "Kenya"}
Breed(s): ${cowBreedRaw} → ${breeds.join(", ")} | Herd: ${numberOfCows} cows
Period: 30 days | Sessions: ${milkRecords.length} milk, ${feedingRecords.length} feeding, ${weatherRecords.length} weather

═══════════ PRE-CALCULATED ANALYTICS ═══════════
YIELD: avg/session=${analytics.avgPerSession}L | avg/cow=${analytics.avgPerCow}L | high=${analytics.highestYield}L | low=${analytics.lowestYield}L
TREND: ${analytics.yieldTrend} (${analytics.yieldTrendPct}%) | latest session change: ${analytics.yieldDropPct}% | vs standard: ${analytics.performancePct}% — ${analytics.performanceStatus}
CRITICAL DROP: ${analytics.criticalYieldDrop ? `YES ${analytics.yieldDropPct}%` : "No"}

FAT: avg=${analytics.avgFat}% | standard≥${standard.minFatContent}% | status=${analytics.fatAlert ? "⚠️ BELOW" : "✅ OK"} | trend=${analytics.fatTrend}

FEED: avg/session=${analytics.avgFeedPerSession}kg | recommended=${analytics.recommendedDailyFeed}kg/day | ${analytics.feedBelowStandard ? `DEFICIT ${analytics.feedDeficit}kg` : "No deficit"} | efficiency=${analytics.feedEfficiency}kg/L | dominant=${analytics.dominantFeed}

FINANCE: revenue=KSh${analytics.totalRevenue} | feed cost=KSh${analytics.totalFeedCost} | margin=${analytics.profitMargin}% | KSh${analytics.revenuePerLiter}/L revenue | KSh${analytics.costPerLiter}/L cost

WEATHER: ${analytics.latestTemp}°C | hum=${analytics.latestHumidity}% | rain=${analytics.latestRainfall}mm | ${analytics.latestCondition} | heat sessions=${analytics.heatStressSessions} | heat active=${analytics.heatStressAlert ? "YES 🚨" : "No"}
Heat yield=${analytics.heatStressAvgYield ?? "N/A"}L vs normal=${analytics.normalAvgYield ?? "N/A"}L

ALERTS (${analytics.alertCount}): ${analytics.alerts.join(" | ") || "None"}

BREED STANDARDS:
${breedStandardsSection}

RAW DATA:
MILK: ${milkSection}
FEED: ${feedSection}
WEATHER: ${weatherSection}

═══════════ OUTPUT RULES ═══════════
• Use EXACT numbers from analytics — do NOT recalculate
• ${isMultiBreed ? `Mixed herd: separate plan per breed (${breeds.join(", ")})` : `Single breed: ${primaryBreed}`}
• Address every active alert with a specific fix
• All text fields: SHORT (2 sentences max, or bullet list)
• Scores: yield=0-100 based on ${analytics.performancePct}% of standard; feeding based on deficit; health on fat/alerts; weather on temp
• emergencyProtocol: only if criticalYieldDrop=true, else ""

Return ONLY valid JSON — no markdown, no extra text:
{
  "yieldAnalysis": "1-2 sentences MAX. Include exact ${analytics.avgPerCow}L/cow avg and ${analytics.yieldTrend} trend.",
  "yieldStats": {
    "avgPerSession": "${analytics.avgPerSession}",
    "avgPerCow":     "${analytics.avgPerCow}",
    "highest":       "${analytics.highestYield}",
    "lowest":        "${analytics.lowestYield}",
    "breedStandard": "${breeds.map((b) => `${b}: ${getBreedStandard(b).dailyYieldRange}`).join(" | ")}",
    "performance":   "${analytics.performancePct}% of standard — ${analytics.performanceStatus}"
  },
  "smartAlerts": {
    "criticalYieldDrop": ${analytics.criticalYieldDrop},
    "feedBelowStandard": ${analytics.feedBelowStandard},
    "fatContentAlert":   ${analytics.fatAlert},
    "heatStressAlert":   ${analytics.heatStressAlert},
    "alertMessages":     ${JSON.stringify(analytics.alerts)},
    "emergencyProtocol": "${analytics.criticalYieldDrop ? "3 bullet steps to recover yield immediately" : ""}"
  },
  "financialSummary": {
    "totalRevenue":    "KSh ${analytics.totalRevenue}",
    "totalFeedCost":   "KSh ${analytics.totalFeedCost}",
    "profitMargin":    "${analytics.profitMargin}%",
    "revenuePerLitre": "KSh ${analytics.revenuePerLiter}",
    "costPerLitre":    "KSh ${analytics.costPerLiter}",
    "feedEfficiency":  "${analytics.feedEfficiency} kg/L",
    "improvement":     "One sentence: specific action to improve ${analytics.profitMargin}% margin"
  },
  "weatherCorrelation": {
    "currentCondition": "${analytics.latestCondition} ${analytics.latestTemp}°C",
    "heatStressActive": ${analytics.heatStressAlert},
    "yieldImpact":      "One sentence with exact numbers on heat vs normal yield",
    "recommendations":  "• [action] — [reason] (max 3 bullets, 10 words each)"
  },
  "feedEfficiencyAnalysis": "• Current: ${analytics.feedEfficiency}kg/L — [good/poor] for ${primaryBreed}  • Target: [N]kg/L  • Action: [exact change]",
  "breedRecommendations": [
    ${breedRecsTemplate}
  ],
  "feedingPlan": {
    "morning":          "${isMultiBreed ? "See breed plans" : `Napier ${standard.napierKgPerCow / 2}kg + Meal ${standard.dairyMealKgPerCow / 2}kg + ${standard.waterLitersPerCow / 2}L water`}",
    "afternoon":        "${isMultiBreed ? "See breed plans" : `Napier ${standard.napierKgPerCow / 2}kg + ${standard.waterLitersPerCow / 2}L water`}",
    "evening":          "${isMultiBreed ? "See breed plans" : `Napier ${standard.napierKgPerCow}kg + Meal ${standard.dairyMealKgPerCow}kg + mineral lick 60g`}",
    "dailyTotalPerCow": "${isMultiBreed ? "See breed plans" : `${standard.napierKgPerCow + standard.dairyMealKgPerCow}kg DM/cow/day`}"
  },
  "supplementRecommendation": "• Mineral lick: 60g/cow/day  • Dairy Cal: 100g/cow/day  • Vitamin AD3E: 5ml/cow/week${analytics.fatAlert ? "  • Energy booster: 200g/cow/day (low fat)" : "  • Selenium: 1mg/cow/day"}",
  "feedingRecommendation": "One sentence on fixing the ${analytics.feedBelowStandard ? `${analytics.feedDeficit}kg deficit` : "current feeding plan"} with expected revenue impact.",
  "weatherImpact": "• ${analytics.latestTemp}°C effect: [specific yield/behaviour impact]  • Action: [exact step]  • Timeline: [when]",
  "healthAlert": "• Risk 1: [name] — [vaccine/dose]  • Risk 2: [name] — [prevention]  • Risk 3: [name] — [sign to watch]",
  "quickTips": [
    "Action verb + specific fix for biggest alert (≤15 words)",
    "Action verb + feed efficiency improvement (≤15 words)",
    "Action verb + margin improvement step (≤15 words)",
    "Action verb + weather management at ${analytics.latestTemp}°C (≤15 words)",
    "Action verb + yield target to reach ${(parseFloat(analytics.avgPerCow) * 1.15).toFixed(1)}L/cow/day (≤15 words)"
  ],
  "scores": {
    "yield":   0,
    "feeding": 0,
    "health":  0,
    "weather": 0
  },
  "overallScore": 0,
  "scoreLabel":   "Poor|Fair|Good|Excellent"
}
scoreLabel bands: 0-40=Poor, 41-60=Fair, 61-80=Good, 81-100=Excellent
CRITICAL: Return ONLY the JSON object. No markdown. No code blocks. No preamble.`;
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export const getRecommendationsService = async (farmerID: number) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GEMINI_BASE_URL;

  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");
  if (!baseUrl) throw new Error("GEMINI_BASE_URL not set in .env");

  const farmerData = await fetchFarmerData(farmerID);
  const analytics = calculateAnalytics(farmerData);
  const prompt = buildPrompt(farmerData, analytics);
  const breeds = parseBreeds(farmerData.farmer.cowBreed ?? "Crossbreed");

  console.log(
    `🤖 AI request → farmer ${farmerID} | ${breeds.join(", ")} | ${farmerData.farmer.numberOfCows ?? 1} cows`,
  );
  console.log(
    `📊 yield=${analytics.avgPerCow}L/cow | trend=${analytics.yieldTrend} | margin=${analytics.profitMargin}% | alerts=${analytics.alertCount}`,
  );

  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/3…`);

      const response = await axios.post(
        `${baseUrl}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // near-zero = factual, concise
            maxOutputTokens: 6000, // reduced — concise output needs less
            responseMimeType: "application/json",
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 90000,
        },
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      console.log(`✅ AI responded (${rawText.length} chars)`);

      const cleaned = rawText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/gi, "")
        .trim();

      let recommendations;
      try {
        recommendations = JSON.parse(cleaned);
      } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
          throw new Error(`No JSON found: ${cleaned.substring(0, 200)}`);
        try {
          recommendations = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error(`Invalid JSON: ${jsonMatch[0].substring(0, 200)}`);
        }
      }

      // ── Always override with server-calculated values ─────────────────
      recommendations.yieldStats = {
        avgPerSession: analytics.avgPerSession,
        avgPerCow: analytics.avgPerCow,
        highest: analytics.highestYield,
        lowest: analytics.lowestYield,
        breedStandard: breeds
          .map((b) => `${b}: ${getBreedStandard(b).dailyYieldRange}`)
          .join(" | "),
        performance: `${analytics.performancePct}% of breed standard — ${analytics.performanceStatus}`,
      };

      recommendations.smartAlerts = {
        criticalYieldDrop: analytics.criticalYieldDrop,
        feedBelowStandard: analytics.feedBelowStandard,
        fatContentAlert: analytics.fatAlert,
        heatStressAlert: analytics.heatStressAlert,
        alertMessages: analytics.alerts,
        emergencyProtocol: recommendations.smartAlerts?.emergencyProtocol ?? "",
      };

      recommendations.financialSummary = {
        ...recommendations.financialSummary,
        totalRevenue: `KSh ${analytics.totalRevenue}`,
        totalFeedCost: `KSh ${analytics.totalFeedCost}`,
        profitMargin: `${analytics.profitMargin}%`,
        revenuePerLitre: `KSh ${analytics.revenuePerLiter}`,
        costPerLitre: `KSh ${analytics.costPerLiter}`,
        feedEfficiency: `${analytics.feedEfficiency} kg/L`,
      };

      console.log(`🎉 Done for farmer ${farmerID}`);

      return {
        farmerID,
        farmerName: `${farmerData.farmer.firstName} ${farmerData.farmer.lastName}`,
        farmLocation: farmerData.farmer.farmLocation,
        cowBreed: farmerData.farmer.cowBreed,
        numberOfCows: farmerData.farmer.numberOfCows,
        breeds,
        isMultiBreed: breeds.length > 1,
        analytics,
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

      console.error(
        `❌ Attempt ${attempt} — status:${status} — ${errData?.message ?? error.message}`,
      );

      if (status === 429) {
        const retryDetail = errData?.details?.find((d: any) =>
          d["@type"]?.includes("RetryInfo"),
        );
        const retrySeconds = parseInt(retryDetail?.retryDelay ?? "60") || 60;
        console.warn(`⏳ Rate limited — waiting ${retrySeconds}s…`);
        if (attempt < 3) await sleep(retrySeconds * 1000);
      } else if (status === 404) {
        throw new Error(`Model not found: ${baseUrl}`);
      } else if (status === 400) {
        throw new Error(`Bad request: ${errData?.message}`);
      } else if (status === 403) {
        throw new Error(`Invalid API key or permission denied`);
      } else {
        throw error;
      }
    }
  }

  const errMsg =
    lastError?.response?.data?.error?.message ?? lastError?.message;
  throw new Error(`AI analysis failed after 3 attempts: ${errMsg}`);
};
