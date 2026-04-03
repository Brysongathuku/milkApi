import db from "./db";
import bcrypt from "bcryptjs";
import {
  CustomersTable,
  MilkTable,
  FeedingHabitsTable,
  PaymentsTable,
  CustomerSupportTicketsTable,
  WeatherRecordsTable,
} from "./schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min: number, max: number, dp = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dp));

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const dateStr = (day: number) => `2026-04-${String(day).padStart(2, "0")}`;

// ─── Farmer profiles — all locations within Kiambu County ────────────────────

const FARMER_PROFILES = [
  {
    firstName: "John",
    lastName: "Kamau",
    email: "farmer1@gmail.com",
    phone: "0711111111",
    address: "Limuru, Kiambu County",
    farmLocation: "Limuru, Kiambu County",
    farmSize: "5 acres",
    numberOfCows: 8,
    cowBreed: "Friesian",
    avatarSeed: "JK",
    avatarBg: "0284c7",
    liters: [26, 31] as [number, number],
    grade: "Grade A" as const,
    fat: [4.0, 4.5] as [number, number],
    time: "06:30",
    price: 50,
  },
  {
    firstName: "Mary",
    lastName: "Wanjiku",
    email: "farmer2@gmail.com",
    phone: "0722222222",
    address: "Githunguri, Kiambu County",
    farmLocation: "Githunguri, Kiambu County",
    farmSize: "3 acres",
    numberOfCows: 5,
    cowBreed: "Ayrshire",
    avatarSeed: "MW",
    avatarBg: "db2777",
    liters: [16, 21] as [number, number],
    grade: "Grade B" as const,
    fat: [3.2, 3.8] as [number, number],
    time: "07:00",
    price: 48,
  },
  {
    firstName: "Peter",
    lastName: "Mwangi",
    email: "farmer3@gmail.com",
    phone: "0733333333",
    address: "Kikuyu, Kiambu County",
    farmLocation: "Kikuyu, Kiambu County",
    farmSize: "8 acres",
    numberOfCows: 12,
    cowBreed: "Holstein",
    avatarSeed: "PM",
    avatarBg: "7c3aed",
    liters: [32, 38] as [number, number],
    grade: "Grade A" as const,
    fat: [4.3, 4.7] as [number, number],
    time: "06:45",
    price: 50,
  },
  {
    firstName: "Grace",
    lastName: "Njeri",
    email: "farmer4@gmail.com",
    phone: "0744444444",
    address: "Ruiru, Kiambu County",
    farmLocation: "Ruiru, Kiambu County",
    farmSize: "4 acres",
    numberOfCows: 6,
    cowBreed: "Crossbreed",
    avatarSeed: "GN",
    avatarBg: "ea580c",
    liters: [20, 25] as [number, number],
    grade: "Grade A" as const,
    fat: [3.6, 4.1] as [number, number],
    time: "07:15",
    price: 50,
  },
  {
    firstName: "Samuel",
    lastName: "Ochieng",
    email: "farmer5@gmail.com",
    phone: "0755555555",
    address: "Thika, Kiambu County",
    farmLocation: "Thika, Kiambu County",
    farmSize: "6 acres",
    numberOfCows: 10,
    cowBreed: "Sahiwal",
    avatarSeed: "SO",
    avatarBg: "0891b2",
    liters: [28, 33] as [number, number],
    grade: "Grade A" as const,
    fat: [4.0, 4.4] as [number, number],
    time: "06:30",
    price: 50,
  },
  {
    firstName: "Faith",
    lastName: "Auma",
    email: "farmer6@gmail.com",
    phone: "0766666666",
    address: "Lari, Kiambu County",
    farmLocation: "Lari, Kiambu County",
    farmSize: "4 acres",
    numberOfCows: 7,
    cowBreed: "Jersey",
    avatarSeed: "FA",
    avatarBg: "16a34a",
    liters: [22, 27] as [number, number],
    grade: "Grade A" as const,
    fat: [3.8, 4.3] as [number, number],
    time: "07:00",
    price: 50,
  },
  {
    firstName: "David",
    lastName: "Kipchoge",
    email: "farmer7@gmail.com",
    phone: "0777777777",
    address: "Gatundu, Kiambu County",
    farmLocation: "Gatundu, Kiambu County",
    farmSize: "10 acres",
    numberOfCows: 15,
    cowBreed: "Friesian",
    avatarSeed: "DK",
    avatarBg: "b45309",
    liters: [40, 48] as [number, number],
    grade: "Grade A" as const,
    fat: [4.2, 4.8] as [number, number],
    time: "06:15",
    price: 50,
  },
  {
    firstName: "Agnes",
    lastName: "Mutua",
    email: "farmer8@gmail.com",
    phone: "0788888888",
    address: "Kabete, Kiambu County",
    farmLocation: "Kabete, Kiambu County",
    farmSize: "3 acres",
    numberOfCows: 4,
    cowBreed: "Guernsey",
    avatarSeed: "AM",
    avatarBg: "be185d",
    liters: [12, 16] as [number, number],
    grade: "Grade B" as const,
    fat: [3.2, 3.7] as [number, number],
    time: "07:30",
    price: 48,
  },
  {
    firstName: "James",
    lastName: "Kariuki",
    email: "farmer9@gmail.com",
    phone: "0799999999",
    address: "Kiambaa, Kiambu County",
    farmLocation: "Kiambaa, Kiambu County",
    farmSize: "7 acres",
    numberOfCows: 11,
    cowBreed: "Brown Swiss",
    avatarSeed: "JKa",
    avatarBg: "0f766e",
    liters: [30, 36] as [number, number],
    grade: "Grade A" as const,
    fat: [4.1, 4.6] as [number, number],
    time: "06:45",
    price: 50,
  },
  {
    firstName: "Esther",
    lastName: "Chebet",
    email: "farmer10@gmail.com",
    phone: "0710101010",
    address: "Karuri, Kiambu County",
    farmLocation: "Karuri, Kiambu County",
    farmSize: "5 acres",
    numberOfCows: 9,
    cowBreed: "Ayrshire",
    avatarSeed: "EC",
    avatarBg: "6d28d9",
    liters: [24, 30] as [number, number],
    grade: "Grade A" as const,
    fat: [3.9, 4.5] as [number, number],
    time: "07:00",
    price: 50,
  },
];

const avatarUrl = (seed: string, bg: string) =>
  `https://api.dicebear.com/7.x/initials/png?seed=${seed}&backgroundColor=${bg}&textColor=ffffff`;

// ─── Weather — Kiambu County has one climate profile (cool highland) ──────────
// Sub-locations vary slightly but all share the same highland belt climate.

const KIAMBU_WEATHER = {
  conditions: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Misty", "Clear"],
  tempRange: [14, 22] as [number, number],
  rainRange: [0, 18] as [number, number],
};

// ─── Feed plan types ──────────────────────────────────────────────────────────

type FeedType =
  | "Napier Grass"
  | "Maize Silage"
  | "Dairy Meal"
  | "Rhodes Grass"
  | "Lucerne"
  | "Wheat Bran"
  | "Cotton Seed Cake"
  | "Soya Bean Meal"
  | "Hay"
  | "Brewers Grain"
  | "Molasses"
  | "Mineral Supplement"
  | "Other";

type FeedTime = "Morning" | "Afternoon" | "Evening" | "Night";

interface FeedPlan {
  feedType: FeedType;
  amountKg: string;
  feedingTime: FeedTime;
  costPerKg: string;
  supplementName: string | null;
  notes: string | null;
}

const GRADE_A_FEEDS: FeedPlan[] = [
  {
    feedType: "Napier Grass",
    amountKg: "25.00",
    feedingTime: "Morning",
    costPerKg: "5.00",
    supplementName: null,
    notes: "Fresh cut grass",
  },
  {
    feedType: "Dairy Meal",
    amountKg: "4.50",
    feedingTime: "Morning",
    costPerKg: "65.00",
    supplementName: null,
    notes: null,
  },
  {
    feedType: "Lucerne",
    amountKg: "8.00",
    feedingTime: "Evening",
    costPerKg: "20.00",
    supplementName: null,
    notes: "High protein evening supplement",
  },
  {
    feedType: "Wheat Bran",
    amountKg: "3.00",
    feedingTime: "Afternoon",
    costPerKg: "30.00",
    supplementName: null,
    notes: null,
  },
];

const GRADE_B_FEEDS: FeedPlan[] = [
  {
    feedType: "Napier Grass",
    amountKg: "20.00",
    feedingTime: "Morning",
    costPerKg: "5.00",
    supplementName: null,
    notes: "Fresh cut grass",
  },
  {
    feedType: "Dairy Meal",
    amountKg: "3.00",
    feedingTime: "Morning",
    costPerKg: "65.00",
    supplementName: null,
    notes: null,
  },
  {
    feedType: "Rhodes Grass",
    amountKg: "10.00",
    feedingTime: "Evening",
    costPerKg: "8.00",
    supplementName: null,
    notes: null,
  },
];

const WEEKLY_MINERAL: FeedPlan = {
  feedType: "Mineral Supplement",
  amountKg: "0.50",
  feedingTime: "Morning",
  costPerKg: "120.00",
  supplementName: "Unga Dairy Mineral",
  notes: "Weekly mineral dose",
};

const BIWEEKLY_MOLASSES: FeedPlan = {
  feedType: "Molasses",
  amountKg: "1.00",
  feedingTime: "Afternoon",
  costPerKg: "45.00",
  supplementName: null,
  notes: "Energy booster — bi-weekly",
};

// ─── Misc pools ───────────────────────────────────────────────────────────────

const POSITIVE_NOTES = [
  "Excellent quality morning collection",
  "Very consistent fat content today",
  "Highest volume this week",
  "Cows well hydrated and calm",
  "Good temperature at delivery",
  "Clean collection, no issues",
  null,
  null,
  null,
  null,
];

const DISPUTED_REASONS = [
  "Temperature above 6°C at delivery",
  "Abnormal smell detected on arrival",
  "Somatic cell count elevated above threshold",
  "Possible contamination during transport",
];

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SEED
// ═════════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log(
    "\n🌱  Starting full database seed — April 2026 (Kiambu County)\n",
  );

  const hashedPassword = await bcrypt.hash("bryson20", 10);
  const CHUNK = 50;

  // ══════════════════════════════════════════════════════════════════════════
  //  1. ADMIN
  // ══════════════════════════════════════════════════════════════════════════

  console.log("👤  Inserting admin...");
  const [admin] = await db
    .insert(CustomersTable)
    .values({
      firstName: "Bryson",
      lastName: "Gathuku",
      email: "brysongathuku189@gmail.com",
      password: hashedPassword,
      contactPhone: "0700000001",
      address: "Nairobi, Kenya",
      farmLocation: null,
      farmSize: null,
      numberOfCows: null,
      cowBreed: null,
      role: "admin",
      isVerified: true,
      isActive: true,
      unreadNotifications: 0,
      imageUrl: avatarUrl("BG", "16a34a"),
    })
    .returning();

  // ══════════════════════════════════════════════════════════════════════════
  //  2. FARMERS
  // ══════════════════════════════════════════════════════════════════════════

  console.log("🧑‍🌾  Inserting 10 farmers (all Kiambu County)...");
  const farmerRows = await db
    .insert(CustomersTable)
    .values(
      FARMER_PROFILES.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        password: hashedPassword,
        contactPhone: p.phone,
        address: p.address,
        farmLocation: p.farmLocation,
        farmSize: p.farmSize,
        numberOfCows: p.numberOfCows,
        cowBreed: p.cowBreed,
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
        imageUrl: avatarUrl(p.avatarSeed, p.avatarBg),
      })),
    )
    .returning();

  // ══════════════════════════════════════════════════════════════════════════
  //  3. MILK COLLECTIONS — 1 per farmer per day, April 1–30
  // ══════════════════════════════════════════════════════════════════════════

  console.log("🥛  Inserting 300 milk collections (10 farmers × 30 days)...");

  const milkInserts: any[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = dateStr(day);

    for (let fi = 0; fi < farmerRows.length; fi++) {
      const profile = FARMER_PROFILES[fi];
      const farmer = farmerRows[fi];

      const qty = rand(profile.liters[0], profile.liters[1]);
      const fat = rand(profile.fat[0], profile.fat[1]);
      const temp = rand(3.6, 5.8);
      const total = parseFloat((qty * profile.price).toFixed(2));

      let status: "Verified" | "Recorded" | "Disputed" =
        day >= 25 ? "Recorded" : "Verified";
      let isDisputed = false;
      let disputeReason: string | null = null;
      let qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Rejected" =
        profile.grade;

      if (profile.grade === "Grade B" && day <= 20 && Math.random() < 0.1) {
        status = "Disputed";
        isDisputed = true;
        disputeReason = pick(DISPUTED_REASONS);
        qualityGrade = "Grade C";
      }

      milkInserts.push({
        farmerID: farmer.customerID,
        collectorID: admin.customerID,
        quantityInLiters: qty.toFixed(2),
        pricePerLiter: profile.price.toFixed(2),
        totalAmount: total.toFixed(2),
        collectionDate: date,
        collectionTime: profile.time,
        collectionStatus: status,
        qualityGrade,
        fatContent: fat.toFixed(2),
        temperature: temp.toFixed(2),
        notes: pick(POSITIVE_NOTES),
        isDisputed,
        disputeReason,
      });
    }
  }

  let milkRecords: any[] = [];
  for (let i = 0; i < milkInserts.length; i += CHUNK) {
    const chunk = await db
      .insert(MilkTable)
      .values(milkInserts.slice(i, i + CHUNK))
      .returning();
    milkRecords = milkRecords.concat(chunk);
  }
  console.log(`   ✅  ${milkRecords.length} milk records inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  4. FEEDING HABITS
  // ══════════════════════════════════════════════════════════════════════════

  console.log("🌿  Inserting feeding habits...");

  const feedInserts: any[] = [];
  const farmerCollectionCount: Record<number, number> = {};

  for (const milk of milkRecords) {
    const farmerIdx = farmerRows.findIndex(
      (f) => f.customerID === milk.farmerID,
    );
    farmerCollectionCount[farmerIdx] =
      (farmerCollectionCount[farmerIdx] ?? 0) + 1;
    const collCount = farmerCollectionCount[farmerIdx];

    const profile = FARMER_PROFILES[farmerIdx];
    const feeds = profile.grade === "Grade A" ? GRADE_A_FEEDS : GRADE_B_FEEDS;

    for (const feed of feeds) {
      feedInserts.push({
        farmerID: milk.farmerID,
        milkID: milk.milkID,
        feedType: feed.feedType,
        amountKg: feed.amountKg,
        feedingTime: feed.feedingTime,
        feedingDate: milk.collectionDate,
        costPerKg: feed.costPerKg,
        supplementName: feed.supplementName,
        notes: feed.notes,
        recordedBy: admin.customerID,
      });
    }

    if (collCount % 7 === 0) {
      feedInserts.push({
        farmerID: milk.farmerID,
        milkID: milk.milkID,
        feedType: WEEKLY_MINERAL.feedType,
        amountKg: WEEKLY_MINERAL.amountKg,
        feedingTime: WEEKLY_MINERAL.feedingTime,
        feedingDate: milk.collectionDate,
        costPerKg: WEEKLY_MINERAL.costPerKg,
        supplementName: WEEKLY_MINERAL.supplementName,
        notes: WEEKLY_MINERAL.notes,
        recordedBy: admin.customerID,
      });
    }

    if (collCount % 14 === 0) {
      feedInserts.push({
        farmerID: milk.farmerID,
        milkID: milk.milkID,
        feedType: BIWEEKLY_MOLASSES.feedType,
        amountKg: BIWEEKLY_MOLASSES.amountKg,
        feedingTime: BIWEEKLY_MOLASSES.feedingTime,
        feedingDate: milk.collectionDate,
        costPerKg: BIWEEKLY_MOLASSES.costPerKg,
        supplementName: BIWEEKLY_MOLASSES.supplementName,
        notes: BIWEEKLY_MOLASSES.notes,
        recordedBy: admin.customerID,
      });
    }
  }

  for (let i = 0; i < feedInserts.length; i += CHUNK) {
    await db.insert(FeedingHabitsTable).values(feedInserts.slice(i, i + CHUNK));
  }
  console.log(`   ✅  ${feedInserts.length} feeding records inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  5. WEATHER RECORDS — Kiambu County highland climate, all 30 days
  // ══════════════════════════════════════════════════════════════════════════

  console.log("🌤️   Inserting weather records (10 farmers × 30 days)...");

  const weatherInserts: any[] = [];

  for (let fi = 0; fi < farmerRows.length; fi++) {
    const farmer = farmerRows[fi];
    const profile = FARMER_PROFILES[fi];

    for (let day = 1; day <= 30; day++) {
      const condition = pick(KIAMBU_WEATHER.conditions);
      const isRainy = condition === "Rainy";
      const isMisty = condition === "Misty";

      weatherInserts.push({
        farmerID: farmer.customerID,
        recordDate: dateStr(day),
        temperatureCelsius: rand(
          KIAMBU_WEATHER.tempRange[0],
          KIAMBU_WEATHER.tempRange[1],
        ).toFixed(2),
        rainfallMm: isRainy
          ? rand(6, KIAMBU_WEATHER.rainRange[1]).toFixed(2)
          : isMisty
            ? rand(1, 5).toFixed(2)
            : rand(0, 1).toFixed(2),
        humidity: isRainy
          ? rand(78, 94).toFixed(2)
          : isMisty
            ? rand(70, 85).toFixed(2)
            : rand(55, 75).toFixed(2),
        weatherCondition: condition,
        windSpeedKph: rand(6, 18).toFixed(2),
        location: profile.farmLocation,
        dataSource: "openweather",
      });
    }
  }

  for (let i = 0; i < weatherInserts.length; i += CHUNK) {
    await db
      .insert(WeatherRecordsTable)
      .values(weatherInserts.slice(i, i + CHUNK));
  }
  console.log(`   ✅  ${weatherInserts.length} weather records inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  6. PAYMENTS — 2 per farmer (Week 1 & Weeks 2-3)
  // ══════════════════════════════════════════════════════════════════════════

  console.log("💰  Inserting payments (2 per farmer)...");

  const paymentMethods = ["M-Pesa", "Bank Transfer", "Cash"];
  const paymentInserts: any[] = [];

  for (let fi = 0; fi < farmerRows.length; fi++) {
    const farmer = farmerRows[fi];
    const profile = FARMER_PROFILES[fi];
    const method1 = paymentMethods[fi % 3];
    const method2 = paymentMethods[(fi + 1) % 3];

    // Week 1 (Apr 1–7)
    const w1Liters = parseFloat(
      (rand(profile.liters[0], profile.liters[1]) * 7).toFixed(2),
    );
    const w1Amount = parseFloat((w1Liters * profile.price).toFixed(2));
    const w1Deduct = profile.grade === "Grade B" ? 200 : 0;
    const w1Bonus = profile.grade === "Grade A" && w1Liters > 196 ? 500 : 0;
    const w1Net = parseFloat((w1Amount - w1Deduct + w1Bonus).toFixed(2));

    paymentInserts.push({
      farmerID: farmer.customerID,
      processedBy: admin.customerID,
      amount: w1Amount.toFixed(2),
      paymentStatus: "Completed" as const,
      paymentMethod: method1,
      transactionID:
        method1 === "M-Pesa"
          ? `MPE2604W1${String(fi + 1).padStart(3, "0")}`
          : method1 === "Bank Transfer"
            ? `TRF2604W1${String(fi + 1).padStart(3, "0")}`
            : null,
      paymentPeriod: "April 2026 - Week 1 (Apr 1-7)",
      totalLitersSupplied: w1Liters.toFixed(2),
      averagePricePerLiter: profile.price.toFixed(2),
      deductions: w1Deduct.toFixed(2),
      deductionReason:
        w1Deduct > 0
          ? "Quality deduction — Grade B collections in Week 1"
          : null,
      bonuses: w1Bonus.toFixed(2),
      netAmount: w1Net.toFixed(2),
      paymentNotes:
        w1Bonus > 0
          ? "Bonus for exceeding 196L volume target in Week 1"
          : w1Deduct > 0
            ? "Deduction applied for below-grade collections"
            : "Standard weekly payment — processed on schedule",
    });

    // Weeks 2-3 (Apr 8–21)
    const w2Liters = parseFloat(
      (rand(profile.liters[0], profile.liters[1]) * 14).toFixed(2),
    );
    const w2Amount = parseFloat((w2Liters * profile.price).toFixed(2));
    const w2Deduct = profile.grade === "Grade B" ? 350 : 0;
    const w2Bonus =
      profile.grade === "Grade A" && w2Liters > 420
        ? 1000
        : profile.grade === "Grade A"
          ? 250
          : 0;
    const w2Net = parseFloat((w2Amount - w2Deduct + w2Bonus).toFixed(2));
    const w2Status: "Completed" | "Pending" = fi < 7 ? "Completed" : "Pending";

    paymentInserts.push({
      farmerID: farmer.customerID,
      processedBy: admin.customerID,
      amount: w2Amount.toFixed(2),
      paymentStatus: w2Status,
      paymentMethod: method2,
      transactionID:
        w2Status === "Completed"
          ? method2 === "M-Pesa"
            ? `MPE2604W2${String(fi + 1).padStart(3, "0")}`
            : method2 === "Bank Transfer"
              ? `TRF2604W2${String(fi + 1).padStart(3, "0")}`
              : null
          : null,
      paymentPeriod: "April 2026 - Weeks 2-3 (Apr 8-21)",
      totalLitersSupplied: w2Liters.toFixed(2),
      averagePricePerLiter: profile.price.toFixed(2),
      deductions: w2Deduct.toFixed(2),
      deductionReason:
        w2Deduct > 0
          ? "Quality deduction — Grade B collections in Weeks 2-3"
          : null,
      bonuses: w2Bonus.toFixed(2),
      netAmount: w2Net.toFixed(2),
      paymentNotes:
        w2Status === "Pending"
          ? "Payment scheduled — to be processed by April 25th"
          : w2Bonus >= 1000
            ? "High-volume bonus: exceeded 420L across Weeks 2-3"
            : w2Bonus > 0
              ? "Grade A consistency bonus applied"
              : "Standard bi-weekly payment",
    });
  }

  await db.insert(PaymentsTable).values(paymentInserts);
  console.log(`   ✅  ${paymentInserts.length} payment records inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  7. SUPPORT TICKETS — all 10 farmers, Kiambu-specific context
  // ══════════════════════════════════════════════════════════════════════════

  console.log("🎫  Inserting support tickets...");

  const ticketInserts: any[] = [
    // Farmer 1 — Limuru — Resolved payment query
    {
      farmerID: farmerRows[0].customerID,
      subject: "Confirm April Week 1 M-Pesa payment — Limuru",
      description:
        "I received an SMS about my Week 1 payment but the amount looks different from my own calculation. Can you confirm the full breakdown including any bonus for my Limuru farm?",
      status: "Resolved" as const,
      priority: "Low",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Hi John, your Week 1 payment included your base milk earnings from your Limuru farm plus a KSh 500 bonus for exceeding the 196L volume target. The M-Pesa transaction was sent to 0711111111. Please check your M-Pesa statement for the exact amount.",
      resolution:
        "Farmer confirmed receipt of payment and understood the bonus breakdown. Ticket closed.",
      resolvedAt: "2026-04-10 10:30:00",
    },

    // Farmer 2 — Githunguri — High priority dispute
    {
      farmerID: farmerRows[1].customerID,
      subject:
        "Collection graded Grade C — disputing the decision (Githunguri)",
      description:
        "One of my April collections from my Githunguri farm was downgraded to Grade C due to temperature. My cooling equipment was serviced last week by a technician in Githunguri town and was confirmed working correctly. I want a full review and payment without deductions.",
      status: "In Progress" as const,
      priority: "High",
      category: "Collection Issue",
      assignedTo: admin.customerID,
      response:
        "Hi Mary, we have noted your dispute and escalated it. We are reviewing the temperature log from the collection vehicle that serves the Githunguri route. A farm visit is scheduled for April 18th to inspect your cooling equipment. We will update you within 48 hours of the visit.",
      resolution: null,
      resolvedAt: null,
    },

    // Farmer 3 — Kikuyu — Bonus explanation
    {
      farmerID: farmerRows[2].customerID,
      subject: "Bonus calculation query — Kikuyu farm",
      description:
        "I noticed a KSh 1,000 bonus in my Weeks 2-3 payment. I want to understand how bonuses are calculated so I can plan my Kikuyu farm operations to consistently earn them.",
      status: "Resolved" as const,
      priority: "Low",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Hi Peter! Our bonus system: (1) Grade A consistency all week = KSh 500, (2) Total volume above 420L in a 2-week period = KSh 1,000, (3) Zero disputes in the period = KSh 250. Your Kikuyu farm earned the high-volume bonus this cycle. Keep it up — you are one of our top performers!",
      resolution:
        "Farmer fully understands the bonus system. Very motivated. Ticket closed.",
      resolvedAt: "2026-04-17 14:00:00",
    },

    // Farmer 4 — Ruiru — Urgent equipment
    {
      farmerID: farmerRows[3].customerID,
      subject: "Cooling tank thermostat fluctuating — urgent (Ruiru)",
      description:
        "My cooling tank at my Ruiru farm has a thermostat that keeps fluctuating between 4°C and 7°C. I am very worried my milk will be downgraded. Can someone from the Ruiru area come to check the equipment urgently, or at least advise me on immediate steps to prevent spoilage?",
      status: "Open" as const,
      priority: "High",
      category: "General",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },

    // Farmer 5 — Thika — Extra collection request
    {
      farmerID: farmerRows[4].customerID,
      subject: "Request for Sunday collection — Thika farm",
      description:
        "My Thika farm herd has grown to 10 Sahiwal cows producing 30+ litres daily. My storage cannot handle the full weekend without collection. I would like to formally request a Sunday collector to cover the Thika route in addition to weekdays.",
      status: "Open" as const,
      priority: "Medium",
      category: "General",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },

    // Farmer 6 — Lari — Feeding advice
    {
      farmerID: farmerRows[5].customerID,
      subject: "Which feeds improve fat content for Jersey cows in Lari?",
      description:
        "My Jersey cows at my Lari farm are producing Grade A milk but I want to improve the fat percentage from 4.0% to above 4.5%. What additional feeds do you recommend and where can I source them within Lari or nearby Limuru?",
      status: "Resolved" as const,
      priority: "Medium",
      category: "General",
      assignedTo: admin.customerID,
      response:
        "Hi Faith! For Jersey cows in the Lari highlands targeting higher fat content: (1) Increase Lucerne to 10kg/day — it grows well in the Lari area, (2) Add Cotton Seed Cake 2kg each afternoon, (3) Try Brewers Grain 3kg/day if available. You can source these from Limuru Agrovet on Limuru Road or the Lari market cooperative. Ensure 50L+ of clean water per cow daily.",
      resolution:
        "Farmer received specific feeding recommendations with local Lari/Limuru sourcing details. Follow-up scheduled April 30th. Ticket closed.",
      resolvedAt: "2026-04-12 09:00:00",
    },

    // Farmer 7 — Gatundu — Payment method change
    {
      farmerID: farmerRows[6].customerID,
      subject: "Change payment method to bank transfer — Gatundu farm",
      description:
        "I would like to change my payment from M-Pesa to direct bank transfer for my Gatundu farm payments going forward. My details: Equity Bank, Gatundu Branch, Account Number 0260299467384.",
      status: "In Progress" as const,
      priority: "Medium",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Hi David, thank you for your request. For security we need to verify your Equity Bank Gatundu branch account details before updating our records. Please bring your bank statement or passbook to the collection centre on your next visit to verify. We will process the change within 3 business days of verification.",
      resolution: null,
      resolvedAt: null,
    },

    // Farmer 8 — Kabete — Grade improvement
    {
      farmerID: farmerRows[7].customerID,
      subject: "How to improve from Grade B to Grade A — Kabete farm",
      description:
        "My Kabete farm collections keep being graded Grade B and I keep getting deductions. I have 4 Guernsey cows and want to reach Grade A consistently. What specific feeding and farm management changes should I make for the Kabete climate?",
      status: "Resolved" as const,
      priority: "Medium",
      category: "Collection Issue",
      assignedTo: admin.customerID,
      response:
        "Hi Agnes! For your Guernsey cows at Kabete: (1) Increase Dairy Meal from 3kg to 5kg/day, (2) Add Lucerne 8kg each evening — readily available from Kabete Agrovet, (3) Cool milk below 4°C within 1 hour of milking (Kabete's cool climate actually helps with this), (4) Clean milking equipment with hot water and sanitizer after every session, (5) Wash and dry udder before milking. Guernsey cows naturally produce high-fat milk so the main issue is likely temperature control and hygiene.",
      resolution:
        "Comprehensive advice given with Kabete-specific sourcing. Farm visit scheduled April 20th. Ticket closed.",
      resolvedAt: "2026-04-14 11:30:00",
    },

    // Farmer 9 — Kiambaa — Pending payment
    {
      farmerID: farmerRows[8].customerID,
      subject:
        "Weeks 2-3 payment still Pending — Kiambaa farm (4 days overdue)",
      description:
        "My payment for April Weeks 2 and 3 from my Kiambaa farm has been showing as Pending in the app for 4 days. The expected processing date was April 22nd and the funds have not arrived. Can you confirm the status and when I will receive the payment?",
      status: "Open" as const,
      priority: "High",
      category: "Payment Query",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },

    // Farmer 10 — Karuri — Maintenance schedule
    {
      farmerID: farmerRows[9].customerID,
      subject: "Next equipment maintenance visit — Karuri area",
      description:
        "I would like to know the schedule for the next equipment maintenance visit covering the Karuri area. My milk cooling tank is due for a full service check — it has been 6 months since the last service and with the April long rains expected I want to ensure everything is in order.",
      status: "Open" as const,
      priority: "Low",
      category: "General",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },
  ];

  await db.insert(CustomerSupportTicketsTable).values(ticketInserts);
  console.log(`   ✅  ${ticketInserts.length} support tickets inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  SUMMARY
  // ══════════════════════════════════════════════════════════════════════════

  console.log(
    "\n════════════════════════════════════════════════════════════════",
  );
  console.log("✅  Seed complete — April 2026 | Kiambu County");
  console.log(
    "════════════════════════════════════════════════════════════════",
  );
  console.log("👤  Admin:    brysongathuku189@gmail.com  /  bryson20");
  console.log(
    "🧑‍🌾  Farmers:  farmer1@gmail.com → farmer10@gmail.com  /  bryson20",
  );
  console.log(
    "────────────────────────────────────────────────────────────────",
  );
  console.log(
    `🥛  Milk records:     ${milkRecords.length}  (10 farmers × 30 days)`,
  );
  console.log(`🌿  Feeding habits:   ${feedInserts.length}`);
  console.log(
    `🌤️   Weather records:  ${weatherInserts.length}  (10 farmers × 30 days)`,
  );
  console.log(`💰  Payments:         ${paymentInserts.length}  (2 per farmer)`);
  console.log(`🎫  Support tickets:  ${ticketInserts.length}`);
  console.log(
    "────────────────────────────────────────────────────────────────",
  );
  console.log("📍  Farmer locations (all Kiambu County):");
  FARMER_PROFILES.forEach((p) => {
    console.log(
      `    ${p.email.padEnd(24)}  ${p.farmLocation.padEnd(30)}  ${p.numberOfCows} cows  ${p.cowBreed}`,
    );
  });
  console.log(
    "════════════════════════════════════════════════════════════════\n",
  );

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
