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

async function seed() {
  console.log("🌱 Seeding database...");

  // ── 1. Hash password ──────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("bryson", 10);

  // ── 2. Insert Admin ───────────────────────────────────────────────────────
  console.log("👤 Creating admin...");
  const [admin] = await db
    .insert(CustomersTable)
    .values({
      firstName: "Bryson",
      lastName: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      contactPhone: "0700000001",
      address: "Nairobi, Kenya",
      role: "admin",
      isVerified: true,
      isActive: true,
    })
    .returning();

  // ── 3. Insert Farmers ─────────────────────────────────────────────────────
  console.log("🧑‍🌾 Creating farmers...");
  const farmersData = [
    {
      firstName: "John",
      lastName: "Kamau",
      email: "farmer1@gmail.com",
      password: hashedPassword,
      contactPhone: "0711111111",
      address: "Kiambu, Kenya",
      farmLocation: "Kiambu County",
      farmSize: "5 acres",
      numberOfCows: 8,
      cowBreed: "Friesian", // ← plain string, no as const
      role: "user" as const,
      isVerified: true,
      isActive: true,
    },
    {
      firstName: "Mary",
      lastName: "Wanjiku",
      email: "farmer2@gmail.com",
      password: hashedPassword,
      contactPhone: "0722222222",
      address: "Nakuru, Kenya",
      farmLocation: "Nakuru County",
      farmSize: "3 acres",
      numberOfCows: 5,
      cowBreed: "Ayrshire",
      role: "user" as const,
      isVerified: true,
      isActive: true,
    },
    {
      firstName: "Peter",
      lastName: "Mwangi",
      email: "farmer3@gmail.com",
      password: hashedPassword,
      contactPhone: "0733333333",
      address: "Meru, Kenya",
      farmLocation: "Meru County",
      farmSize: "8 acres",
      numberOfCows: 12,
      cowBreed: "Holstein",
      role: "user" as const,
      isVerified: true,
      isActive: true,
    },
    {
      firstName: "Grace",
      lastName: "Njeri",
      email: "farmer4@gmail.com",
      password: hashedPassword,
      contactPhone: "0744444444",
      address: "Nyeri, Kenya",
      farmLocation: "Nyeri County",
      farmSize: "4 acres",
      numberOfCows: 6,
      cowBreed: "Crossbreed",
      role: "user" as const,
      isVerified: true,
      isActive: true,
    },
    {
      firstName: "Samuel",
      lastName: "Ochieng",
      email: "farmer5@gmail.com",
      password: hashedPassword,
      contactPhone: "0755555555",
      address: "Kisumu, Kenya",
      farmLocation: "Kisumu County",
      farmSize: "6 acres",
      numberOfCows: 10,
      cowBreed: "Sahiwal",
      role: "user" as const,
      isVerified: true,
      isActive: true,
    },
  ];

  const farmers = await db
    .insert(CustomersTable)
    .values(farmersData)
    .returning();

  const [f1, f2, f3, f4, f5] = farmers;

  // ── 4. Insert Milk Collections ────────────────────────────────────────────
  console.log("🥛 Creating milk collections...");
  const milkData = [
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "28.50",
      pricePerLiter: "50.00",
      totalAmount: "1425.00",
      collectionDate: "2026-03-01",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.20",
      temperature: "4.50",
      notes: "Good quality morning collection",
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "18.00",
      pricePerLiter: "50.00",
      totalAmount: "900.00",
      collectionDate: "2026-03-01",
      collectionTime: "07:00",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.80",
      temperature: "4.20",
      notes: null,
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "35.00",
      pricePerLiter: "50.00",
      totalAmount: "1750.00",
      collectionDate: "2026-03-02",
      collectionTime: "06:45",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.50",
      temperature: "4.00",
      notes: "Excellent fat content",
    },
    {
      farmerID: f4.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "22.00",
      pricePerLiter: "50.00",
      totalAmount: "1100.00",
      collectionDate: "2026-03-02",
      collectionTime: "07:15",
      collectionStatus: "Recorded" as const,
      qualityGrade: "Grade B" as const,
      fatContent: "3.20",
      temperature: "5.10",
      notes: "Slightly warm on delivery",
    },
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "30.50",
      pricePerLiter: "50.00",
      totalAmount: "1525.00",
      collectionDate: "2026-03-03",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.10",
      temperature: "4.30",
      notes: null,
    },
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "26.00",
      pricePerLiter: "50.00",
      totalAmount: "1300.00",
      collectionDate: "2026-03-04",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.00",
      temperature: "4.40",
      notes: null,
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "16.50",
      pricePerLiter: "50.00",
      totalAmount: "825.00",
      collectionDate: "2026-03-04",
      collectionTime: "07:00",
      collectionStatus: "Disputed" as const,
      qualityGrade: "Grade C" as const,
      fatContent: "2.80",
      temperature: "6.50",
      isDisputed: true,
      disputeReason: "Temperature too high at delivery",
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "32.00",
      pricePerLiter: "50.00",
      totalAmount: "1600.00",
      collectionDate: "2026-03-05",
      collectionTime: "06:30",
      collectionStatus: "Recorded" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.30",
      temperature: "4.10",
      notes: null,
    },
  ];

  const milkRecords = await db.insert(MilkTable).values(milkData).returning();
  const [m1, m2, m3, m4, m5, m6, m7, m8] = milkRecords;

  // ── 5. Insert Feeding Habits ──────────────────────────────────────────────
  console.log("🌿 Creating feeding habits...");
  const feedingData = [
    // Farmer 1 — March 1 (linked to m1)
    {
      farmerID: f1.customerID,
      milkID: m1.milkID,
      feedType: "Napier Grass" as const,
      amountKg: "25.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-01",
      costPerKg: "5.00",
      notes: "Fresh cut Napier, cows fed well",
      recordedBy: admin.customerID,
    },
    {
      farmerID: f1.customerID,
      milkID: m1.milkID,
      feedType: "Dairy Meal" as const,
      amountKg: "4.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-01",
      costPerKg: "65.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    // Farmer 2 — March 1 (linked to m2)
    {
      farmerID: f2.customerID,
      milkID: m2.milkID,
      feedType: "Maize Silage" as const,
      amountKg: "20.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-01",
      costPerKg: "8.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f2.customerID,
      milkID: m2.milkID,
      feedType: "Mineral Supplement" as const,
      amountKg: "0.50",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-01",
      costPerKg: "120.00",
      notes: "Weekly mineral supplement",
      recordedBy: admin.customerID,
    },
    // Farmer 3 — March 2 (linked to m3)
    {
      farmerID: f3.customerID,
      milkID: m3.milkID,
      feedType: "Napier Grass" as const,
      amountKg: "30.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-02",
      costPerKg: "5.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f3.customerID,
      milkID: m3.milkID,
      feedType: "Dairy Meal" as const,
      amountKg: "5.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-02",
      costPerKg: "65.00",
      notes: "High dairy meal due to excellent fat content",
      recordedBy: admin.customerID,
    },
    {
      farmerID: f3.customerID,
      milkID: m3.milkID,
      feedType: "Lucerne" as const,
      amountKg: "10.00",
      feedingTime: "Evening" as const,
      feedingDate: "2026-03-02",
      costPerKg: "20.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    // Farmer 4 — March 2 (linked to m4)
    {
      farmerID: f4.customerID,
      milkID: m4.milkID,
      feedType: "Rhodes Grass" as const,
      amountKg: "18.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-02",
      costPerKg: "6.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f4.customerID,
      milkID: m4.milkID,
      feedType: "Wheat Bran" as const,
      amountKg: "3.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-02",
      costPerKg: "35.00",
      notes: "Reduced dairy meal due to Grade B quality",
      recordedBy: admin.customerID,
    },
    // Farmer 5 — March 3 (linked to m5)
    {
      farmerID: f5.customerID,
      milkID: m5.milkID,
      feedType: "Maize Silage" as const,
      amountKg: "28.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-03",
      costPerKg: "8.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f5.customerID,
      milkID: m5.milkID,
      feedType: "Dairy Meal" as const,
      amountKg: "4.50",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-03",
      costPerKg: "65.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f5.customerID,
      milkID: m5.milkID,
      feedType: "Molasses" as const,
      amountKg: "1.00",
      feedingTime: "Evening" as const,
      feedingDate: "2026-03-03",
      costPerKg: "30.00",
      notes: "Energy supplement",
      recordedBy: admin.customerID,
    },
    // Farmer 1 — March 4 (linked to m6)
    {
      farmerID: f1.customerID,
      milkID: m6.milkID,
      feedType: "Napier Grass" as const,
      amountKg: "22.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-04",
      costPerKg: "5.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f1.customerID,
      milkID: m6.milkID,
      feedType: "Dairy Meal" as const,
      amountKg: "4.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-04",
      costPerKg: "65.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    // Farmer 2 — March 4 (linked to m7 — disputed)
    {
      farmerID: f2.customerID,
      milkID: m7.milkID,
      feedType: "Hay" as const,
      amountKg: "15.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-04",
      costPerKg: "10.00",
      notes: "Low quality feed — possibly related to disputed milk",
      recordedBy: admin.customerID,
    },
    // Farmer 3 — March 5 (linked to m8)
    {
      farmerID: f3.customerID,
      milkID: m8.milkID,
      feedType: "Napier Grass" as const,
      amountKg: "28.00",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-05",
      costPerKg: "5.00",
      notes: null,
      recordedBy: admin.customerID,
    },
    {
      farmerID: f3.customerID,
      milkID: m8.milkID,
      feedType: "Cotton Seed Cake" as const,
      amountKg: "3.50",
      feedingTime: "Morning" as const,
      feedingDate: "2026-03-05",
      costPerKg: "55.00",
      notes: "Protein supplement",
      recordedBy: admin.customerID,
    },
  ];

  await db.insert(FeedingHabitsTable).values(feedingData);

  // ── 6. Insert Weather Records ─────────────────────────────────────────────
  console.log("🌤️  Creating weather records...");
  const weatherData = [
    {
      farmerID: f1.customerID,
      recordDate: "2026-03-01",
      temperatureCelsius: "18.50",
      rainfallMm: "0.00",
      humidity: "72.00",
      weatherCondition: "Sunny",
      windSpeedKph: "12.00",
      location: "Kiambu County",
      dataSource: "manual",
    },
    {
      farmerID: f1.customerID,
      recordDate: "2026-03-04",
      temperatureCelsius: "19.20",
      rainfallMm: "2.50",
      humidity: "78.00",
      weatherCondition: "Partly Cloudy",
      windSpeedKph: "10.00",
      location: "Kiambu County",
      dataSource: "manual",
    },
    {
      farmerID: f2.customerID,
      recordDate: "2026-03-01",
      temperatureCelsius: "22.00",
      rainfallMm: "0.00",
      humidity: "65.00",
      weatherCondition: "Sunny",
      windSpeedKph: "15.00",
      location: "Nakuru County",
      dataSource: "manual",
    },
    {
      farmerID: f2.customerID,
      recordDate: "2026-03-04",
      temperatureCelsius: "28.50",
      rainfallMm: "0.00",
      humidity: "55.00",
      weatherCondition: "Hot & Dry",
      windSpeedKph: "8.00",
      location: "Nakuru County",
      dataSource: "manual",
    },
    {
      farmerID: f3.customerID,
      recordDate: "2026-03-02",
      temperatureCelsius: "20.00",
      rainfallMm: "5.00",
      humidity: "80.00",
      weatherCondition: "Cloudy",
      windSpeedKph: "9.00",
      location: "Meru County",
      dataSource: "manual",
    },
    {
      farmerID: f3.customerID,
      recordDate: "2026-03-05",
      temperatureCelsius: "21.50",
      rainfallMm: "0.00",
      humidity: "75.00",
      weatherCondition: "Partly Cloudy",
      windSpeedKph: "11.00",
      location: "Meru County",
      dataSource: "manual",
    },
    {
      farmerID: f4.customerID,
      recordDate: "2026-03-02",
      temperatureCelsius: "17.00",
      rainfallMm: "12.00",
      humidity: "88.00",
      weatherCondition: "Rainy",
      windSpeedKph: "18.00",
      location: "Nyeri County",
      dataSource: "manual",
    },
    {
      farmerID: f5.customerID,
      recordDate: "2026-03-03",
      temperatureCelsius: "26.00",
      rainfallMm: "0.00",
      humidity: "70.00",
      weatherCondition: "Sunny",
      windSpeedKph: "14.00",
      location: "Kisumu County",
      dataSource: "manual",
    },
  ];

  const weatherRecords = await db
    .insert(WeatherRecordsTable)
    .values(weatherData)
    .returning();

  // ── 7. Insert Payments ────────────────────────────────────────────────────
  console.log("💰 Creating payments...");
  const paymentsData = [
    {
      farmerID: f1.customerID,
      processedBy: admin.customerID,
      amount: "6500.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "M-Pesa",
      transactionID: "MPE001234567",
      paymentPeriod: "February 2026",
      totalLitersSupplied: "130.00",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "500.00",
      netAmount: "7000.00",
      paymentNotes: "Bonus for consistent Grade A quality",
    },
    {
      farmerID: f2.customerID,
      processedBy: admin.customerID,
      amount: "4500.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "Bank Transfer",
      transactionID: "TRF00987654",
      paymentPeriod: "February 2026",
      totalLitersSupplied: "90.00",
      averagePricePerLiter: "50.00",
      deductions: "200.00",
      deductionReason: "Quality deduction for 2 disputed batches",
      bonuses: "0.00",
      netAmount: "4300.00",
      paymentNotes: null,
    },
    {
      farmerID: f3.customerID,
      processedBy: admin.customerID,
      amount: "8750.00",
      paymentStatus: "Pending" as const,
      paymentMethod: "M-Pesa",
      transactionID: null,
      paymentPeriod: "March 2026",
      totalLitersSupplied: "175.00",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "875.00",
      netAmount: "9625.00",
      paymentNotes: "Awaiting M-Pesa processing",
    },
    {
      farmerID: f4.customerID,
      processedBy: admin.customerID,
      amount: "5500.00",
      paymentStatus: "Pending" as const,
      paymentMethod: "Cash",
      transactionID: null,
      paymentPeriod: "March 2026",
      totalLitersSupplied: "110.00",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "0.00",
      netAmount: "5500.00",
      paymentNotes: null,
    },
    {
      farmerID: f5.customerID,
      processedBy: admin.customerID,
      amount: "7625.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "M-Pesa",
      transactionID: "MPE005678901",
      paymentPeriod: "February 2026",
      totalLitersSupplied: "152.50",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "375.00",
      netAmount: "8000.00",
      paymentNotes: "Bonus for high volume",
    },
  ];

  await db.insert(PaymentsTable).values(paymentsData);

  // ── 8. Insert Support Tickets ─────────────────────────────────────────────
  console.log("🎫 Creating support tickets...");
  const ticketsData = [
    {
      farmerID: f1.customerID,
      subject: "Payment not received for February",
      description:
        "I have not received my February 2026 payment. It has been 5 days since the period ended.",
      status: "Resolved" as const,
      priority: "High",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Your payment was processed on March 3rd via M-Pesa. Transaction ID: MPE001234567.",
      resolution: "Payment confirmed sent. Farmer acknowledged receipt.",
      resolvedAt: "2026-03-05 10:30:00",
    },
    {
      farmerID: f2.customerID,
      subject: "Dispute on milk collection quality grading",
      description:
        "My March 4th collection was graded as Grade C and disputed. My milk was in good condition when I handed it over.",
      status: "In Progress" as const,
      priority: "High",
      category: "Collection Issue",
      assignedTo: admin.customerID,
      response:
        "We are reviewing the temperature logs and collection records for that date.",
      resolution: null,
      resolvedAt: null,
    },
    {
      farmerID: f4.customerID,
      subject: "How do I improve my milk fat content?",
      description:
        "My collections keep getting Grade B. I want to know what changes to make to feeding to improve fat content.",
      status: "Resolved" as const,
      priority: "Medium",
      category: "General",
      assignedTo: admin.customerID,
      response:
        "Consider increasing Dairy Meal to 5KG per day and adding Lucerne in the evening. Also ensure cows have clean water access.",
      resolution:
        "Farmer advised on improved feeding regimen. Follow-up in 2 weeks.",
      resolvedAt: "2026-03-06 14:00:00",
    },
    {
      farmerID: f3.customerID,
      subject: "Request for early payment this month",
      description:
        "I have an emergency and would like to request early release of my March payment.",
      status: "Open" as const,
      priority: "Medium",
      category: "Payment Query",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },
    {
      farmerID: f5.customerID,
      subject: "Collection time change request",
      description:
        "Can the morning collection time be moved to 7:00 AM instead of 6:30 AM for my farm?",
      status: "Open" as const,
      priority: "Low",
      category: "General",
      assignedTo: null,
      response: null,
      resolution: null,
      resolvedAt: null,
    },
  ];

  await db.insert(CustomerSupportTicketsTable).values(ticketsData);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("✅ Seeding complete!");
  console.log("─────────────────────────────────────────");
  console.log("👤 Admin:    admin@gmail.com / bryson");
  console.log("🧑‍🌾 Farmers: farmer1@gmail.com → farmer5@gmail.com / bryson");
  console.log(`🥛 Milk records:     ${milkRecords.length}`);
  console.log(`🌿 Feeding records:  ${feedingData.length}`);
  console.log(`🌤️  Weather records:  ${weatherRecords.length}`);
  console.log(`💰 Payments:         ${paymentsData.length}`);
  console.log(`🎫 Tickets:          ${ticketsData.length}`);
  console.log("─────────────────────────────────────────");
  console.log("🐄 Cow breeds seeded:");
  console.log("   farmer1 → Friesian");
  console.log("   farmer2 → Ayrshire");
  console.log("   farmer3 → Holstein");
  console.log("   farmer4 → Crossbreed");
  console.log("   farmer5 → Sahiwal");
  console.log("─────────────────────────────────────────");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
