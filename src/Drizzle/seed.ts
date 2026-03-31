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
      cowBreed: "Friesian",
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

  // ── 4. Insert Milk Collections (4+ per farmer) ────────────────────────────
  console.log("🥛 Creating milk collections...");
  const milkData = [
    // FARMER 1 - John Kamau (5 collections)
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "28.50",
      pricePerLiter: "50.00",
      totalAmount: "1425.00",
      collectionDate: "2026-03-18",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.20",
      temperature: "4.50",
      notes: "Good quality morning collection",
    },
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "26.00",
      pricePerLiter: "50.00",
      totalAmount: "1300.00",
      collectionDate: "2026-03-19",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.00",
      temperature: "4.40",
      notes: null,
    },
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "29.00",
      pricePerLiter: "50.00",
      totalAmount: "1450.00",
      collectionDate: "2026-03-20",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.30",
      temperature: "4.20",
      notes: "Excellent quality",
    },
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "27.50",
      pricePerLiter: "50.00",
      totalAmount: "1375.00",
      collectionDate: "2026-03-21",
      collectionTime: "06:30",
      collectionStatus: "Recorded" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.10",
      temperature: "4.60",
      notes: null,
    },
    {
      farmerID: f1.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "30.00",
      pricePerLiter: "50.00",
      totalAmount: "1500.00",
      collectionDate: "2026-03-22",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.40",
      temperature: "4.30",
      notes: "Best collection this week",
    },

    // FARMER 2 - Mary Wanjiku (5 collections)
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "18.00",
      pricePerLiter: "50.00",
      totalAmount: "900.00",
      collectionDate: "2026-03-18",
      collectionTime: "07:00",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.80",
      temperature: "4.20",
      notes: null,
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "16.50",
      pricePerLiter: "50.00",
      totalAmount: "825.00",
      collectionDate: "2026-03-19",
      collectionTime: "07:00",
      collectionStatus: "Disputed" as const,
      qualityGrade: "Grade C" as const,
      fatContent: "2.80",
      temperature: "6.50",
      isDisputed: true,
      disputeReason: "Temperature too high at delivery",
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "19.00",
      pricePerLiter: "50.00",
      totalAmount: "950.00",
      collectionDate: "2026-03-20",
      collectionTime: "07:00",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade B" as const,
      fatContent: "3.50",
      temperature: "5.00",
      notes: "Improved from yesterday",
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "17.50",
      pricePerLiter: "50.00",
      totalAmount: "875.00",
      collectionDate: "2026-03-21",
      collectionTime: "07:00",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.90",
      temperature: "4.40",
      notes: null,
    },
    {
      farmerID: f2.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "20.00",
      pricePerLiter: "50.00",
      totalAmount: "1000.00",
      collectionDate: "2026-03-22",
      collectionTime: "07:00",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.00",
      temperature: "4.30",
      notes: "Much better quality this week",
    },

    // FARMER 3 - Peter Mwangi (6 collections)
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "35.00",
      pricePerLiter: "50.00",
      totalAmount: "1750.00",
      collectionDate: "2026-03-17",
      collectionTime: "06:45",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.50",
      temperature: "4.00",
      notes: "Excellent fat content",
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "32.00",
      pricePerLiter: "50.00",
      totalAmount: "1600.00",
      collectionDate: "2026-03-18",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.30",
      temperature: "4.10",
      notes: null,
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "36.50",
      pricePerLiter: "50.00",
      totalAmount: "1825.00",
      collectionDate: "2026-03-19",
      collectionTime: "06:45",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.60",
      temperature: "3.90",
      notes: "Highest volume this month",
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "33.00",
      pricePerLiter: "50.00",
      totalAmount: "1650.00",
      collectionDate: "2026-03-20",
      collectionTime: "06:45",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.40",
      temperature: "4.20",
      notes: null,
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "34.50",
      pricePerLiter: "50.00",
      totalAmount: "1725.00",
      collectionDate: "2026-03-21",
      collectionTime: "06:45",
      collectionStatus: "Recorded" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.50",
      temperature: "4.00",
      notes: null,
    },
    {
      farmerID: f3.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "35.50",
      pricePerLiter: "50.00",
      totalAmount: "1775.00",
      collectionDate: "2026-03-22",
      collectionTime: "06:45",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.55",
      temperature: "4.10",
      notes: "Consistently excellent quality",
    },

    // FARMER 4 - Grace Njeri (4 collections)
    {
      farmerID: f4.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "22.00",
      pricePerLiter: "50.00",
      totalAmount: "1100.00",
      collectionDate: "2026-03-19",
      collectionTime: "07:15",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade B" as const,
      fatContent: "3.20",
      temperature: "5.10",
      notes: "Slightly warm on delivery",
    },
    {
      farmerID: f4.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "21.00",
      pricePerLiter: "50.00",
      totalAmount: "1050.00",
      collectionDate: "2026-03-20",
      collectionTime: "07:15",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.60",
      temperature: "4.50",
      notes: "Better temperature control",
    },
    {
      farmerID: f4.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "23.50",
      pricePerLiter: "50.00",
      totalAmount: "1175.00",
      collectionDate: "2026-03-21",
      collectionTime: "07:15",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.80",
      temperature: "4.40",
      notes: null,
    },
    {
      farmerID: f4.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "24.00",
      pricePerLiter: "50.00",
      totalAmount: "1200.00",
      collectionDate: "2026-03-22",
      collectionTime: "07:15",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "3.90",
      temperature: "4.30",
      notes: "Good improvement this week",
    },

    // FARMER 5 - Samuel Ochieng (5 collections)
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "30.50",
      pricePerLiter: "50.00",
      totalAmount: "1525.00",
      collectionDate: "2026-03-18",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.10",
      temperature: "4.30",
      notes: null,
    },
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "29.00",
      pricePerLiter: "50.00",
      totalAmount: "1450.00",
      collectionDate: "2026-03-19",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.00",
      temperature: "4.40",
      notes: null,
    },
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "31.50",
      pricePerLiter: "50.00",
      totalAmount: "1575.00",
      collectionDate: "2026-03-20",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.20",
      temperature: "4.20",
      notes: "Very consistent quality",
    },
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "28.50",
      pricePerLiter: "50.00",
      totalAmount: "1425.00",
      collectionDate: "2026-03-21",
      collectionTime: "06:30",
      collectionStatus: "Recorded" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.15",
      temperature: "4.35",
      notes: null,
    },
    {
      farmerID: f5.customerID,
      collectorID: admin.customerID,
      quantityInLiters: "32.00",
      pricePerLiter: "50.00",
      totalAmount: "1600.00",
      collectionDate: "2026-03-22",
      collectionTime: "06:30",
      collectionStatus: "Verified" as const,
      qualityGrade: "Grade A" as const,
      fatContent: "4.25",
      temperature: "4.25",
      notes: "Strong finish to the week",
    },
  ];

  const milkRecords = await db.insert(MilkTable).values(milkData).returning();

  // ── 5. Insert Feeding Habits ──────────────────────────────────────────────
  console.log("🌿 Creating feeding habits...");
  const feedingData = [];

  // Create feeding records for each milk collection
  for (const milk of milkRecords) {
    // Morning feeds (every collection has morning feed)
    feedingData.push({
      farmerID: milk.farmerID,
      milkID: milk.milkID,
      feedType: "Napier Grass" as const,
      amountKg: "25.00",
      feedingTime: "Morning" as const,
      feedingDate: milk.collectionDate,
      costPerKg: "5.00",
      notes: "Fresh cut grass",
      recordedBy: admin.customerID,
    });

    feedingData.push({
      farmerID: milk.farmerID,
      milkID: milk.milkID,
      feedType: "Dairy Meal" as const,
      amountKg: "4.00",
      feedingTime: "Morning" as const,
      feedingDate: milk.collectionDate,
      costPerKg: "65.00",
      notes: null,
      recordedBy: admin.customerID,
    });

    // Add evening feed for Grade A milk (higher quality farmers feed better)
    if (milk.qualityGrade === "Grade A") {
      feedingData.push({
        farmerID: milk.farmerID,
        milkID: milk.milkID,
        feedType: "Lucerne" as const,
        amountKg: "8.00",
        feedingTime: "Evening" as const,
        feedingDate: milk.collectionDate,
        costPerKg: "20.00",
        notes: "Protein supplement",
        recordedBy: admin.customerID,
      });
    }

    // Add mineral supplement weekly (every 7th collection)
    const recordIndex = milkRecords.indexOf(milk);
    if (recordIndex % 7 === 0) {
      feedingData.push({
        farmerID: milk.farmerID,
        milkID: milk.milkID,
        feedType: "Mineral Supplement" as const,
        amountKg: "0.50",
        feedingTime: "Morning" as const,
        feedingDate: milk.collectionDate,
        costPerKg: "120.00",
        notes: "Weekly mineral dose",
        recordedBy: admin.customerID,
      });
    }
  }

  await db.insert(FeedingHabitsTable).values(feedingData);

  // ── 6. Insert Weather Records ─────────────────────────────────────────────
  console.log("🌤️  Creating weather records...");
  const weatherData = [
    // Farmer 1 - Kiambu
    {
      farmerID: f1.customerID,
      recordDate: "2026-03-18",
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
      recordDate: "2026-03-22",
      temperatureCelsius: "19.20",
      rainfallMm: "2.50",
      humidity: "78.00",
      weatherCondition: "Partly Cloudy",
      windSpeedKph: "10.00",
      location: "Kiambu County",
      dataSource: "manual",
    },

    // Farmer 2 - Nakuru
    {
      farmerID: f2.customerID,
      recordDate: "2026-03-18",
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
      recordDate: "2026-03-19",
      temperatureCelsius: "28.50",
      rainfallMm: "0.00",
      humidity: "55.00",
      weatherCondition: "Hot & Dry",
      windSpeedKph: "8.00",
      location: "Nakuru County",
      dataSource: "manual",
    },

    // Farmer 3 - Meru
    {
      farmerID: f3.customerID,
      recordDate: "2026-03-17",
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
      recordDate: "2026-03-22",
      temperatureCelsius: "21.50",
      rainfallMm: "0.00",
      humidity: "75.00",
      weatherCondition: "Partly Cloudy",
      windSpeedKph: "11.00",
      location: "Meru County",
      dataSource: "manual",
    },

    // Farmer 4 - Nyeri
    {
      farmerID: f4.customerID,
      recordDate: "2026-03-19",
      temperatureCelsius: "17.00",
      rainfallMm: "12.00",
      humidity: "88.00",
      weatherCondition: "Rainy",
      windSpeedKph: "18.00",
      location: "Nyeri County",
      dataSource: "manual",
    },
    {
      farmerID: f4.customerID,
      recordDate: "2026-03-21",
      temperatureCelsius: "18.50",
      rainfallMm: "3.00",
      humidity: "82.00",
      weatherCondition: "Partly Cloudy",
      windSpeedKph: "14.00",
      location: "Nyeri County",
      dataSource: "manual",
    },

    // Farmer 5 - Kisumu
    {
      farmerID: f5.customerID,
      recordDate: "2026-03-18",
      temperatureCelsius: "26.00",
      rainfallMm: "0.00",
      humidity: "70.00",
      weatherCondition: "Sunny",
      windSpeedKph: "14.00",
      location: "Kisumu County",
      dataSource: "manual",
    },
    {
      farmerID: f5.customerID,
      recordDate: "2026-03-20",
      temperatureCelsius: "27.50",
      rainfallMm: "0.00",
      humidity: "68.00",
      weatherCondition: "Clear",
      windSpeedKph: "12.00",
      location: "Kisumu County",
      dataSource: "manual",
    },
  ];

  await db.insert(WeatherRecordsTable).values(weatherData);

  // ── 7. Insert Payments ────────────────────────────────────────────────────
  console.log("💰 Creating payments...");
  const paymentsData = [
    {
      farmerID: f1.customerID,
      processedBy: admin.customerID,
      amount: "7050.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "M-Pesa",
      transactionID: "MPE001234567",
      paymentPeriod: "March 2026 - Week 3",
      totalLitersSupplied: "141.00",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "500.00",
      netAmount: "7550.00",
      paymentNotes: "Bonus for consistent Grade A quality",
    },
    {
      farmerID: f2.customerID,
      processedBy: admin.customerID,
      amount: "4550.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "Bank Transfer",
      transactionID: "TRF00987654",
      paymentPeriod: "March 2026 - Week 3",
      totalLitersSupplied: "91.00",
      averagePricePerLiter: "50.00",
      deductions: "200.00",
      deductionReason: "Quality deduction for 1 disputed batch",
      bonuses: "0.00",
      netAmount: "4350.00",
      paymentNotes: "Improved quality towards end of week",
    },
    {
      farmerID: f3.customerID,
      processedBy: admin.customerID,
      amount: "10325.00",
      paymentStatus: "Pending" as const,
      paymentMethod: "M-Pesa",
      transactionID: null,
      paymentPeriod: "March 2026 - Week 3",
      totalLitersSupplied: "206.50",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "1000.00",
      netAmount: "11325.00",
      paymentNotes: "Bonus for highest volume and consistent quality",
    },
    {
      farmerID: f4.customerID,
      processedBy: admin.customerID,
      amount: "4525.00",
      paymentStatus: "Pending" as const,
      paymentMethod: "Cash",
      transactionID: null,
      paymentPeriod: "March 2026 - Week 3",
      totalLitersSupplied: "90.50",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "0.00",
      netAmount: "4525.00",
      paymentNotes: "Good improvement in quality",
    },
    {
      farmerID: f5.customerID,
      processedBy: admin.customerID,
      amount: "7575.00",
      paymentStatus: "Completed" as const,
      paymentMethod: "M-Pesa",
      transactionID: "MPE005678901",
      paymentPeriod: "March 2026 - Week 3",
      totalLitersSupplied: "151.50",
      averagePricePerLiter: "50.00",
      deductions: "0.00",
      bonuses: "375.00",
      netAmount: "7950.00",
      paymentNotes: "Bonus for consistent high quality",
    },
  ];

  await db.insert(PaymentsTable).values(paymentsData);

  // ── 8. Insert Support Tickets ─────────────────────────────────────────────
  console.log("🎫 Creating support tickets...");
  const ticketsData = [
    {
      farmerID: f1.customerID,
      subject: "Payment confirmation for Week 3",
      description:
        "I would like to confirm that my payment for Week 3 has been processed correctly.",
      status: "Resolved" as const,
      priority: "Low",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Your payment of KSh 7,550 was processed on March 23rd via M-Pesa. Transaction ID: MPE001234567.",
      resolution: "Payment confirmed. Farmer satisfied with response.",
      resolvedAt: "2026-03-23 10:30:00",
    },
    {
      farmerID: f2.customerID,
      subject: "Dispute on March 19th collection quality grading",
      description:
        "My March 19th collection was graded as Grade C and disputed due to temperature. I believe my cooling system was working properly.",
      status: "In Progress" as const,
      priority: "High",
      category: "Collection Issue",
      assignedTo: admin.customerID,
      response:
        "We are reviewing the temperature logs and will visit your farm to check the cooling equipment.",
      resolution: null,
      resolvedAt: null,
    },
    {
      farmerID: f4.customerID,
      subject: "How do I improve my milk fat content?",
      description:
        "My collections have been Grade B. I want to improve to Grade A consistently. What feeding changes should I make?",
      status: "Resolved" as const,
      priority: "Medium",
      category: "General",
      assignedTo: admin.customerID,
      response:
        "Consider increasing Dairy Meal to 5kg per day and adding Lucerne (8kg) in the evening. Also ensure cows have constant access to clean water (40-60L per cow daily).",
      resolution:
        "Farmer advised on improved feeding regimen. Will follow up in 2 weeks to check results.",
      resolvedAt: "2026-03-22 14:00:00",
    },
    {
      farmerID: f3.customerID,
      subject: "Request for bonus payment details",
      description:
        "I see a bonus mentioned in my payment summary. Can you explain how the bonus system works?",
      status: "Resolved" as const,
      priority: "Low",
      category: "Payment Query",
      assignedTo: admin.customerID,
      response:
        "Bonuses are awarded for: (1) Consistent Grade A quality, (2) High volume (>200L per week), (3) Zero disputes. You earned all three this week!",
      resolution: "Farmer understands bonus system. Very satisfied.",
      resolvedAt: "2026-03-23 11:15:00",
    },
    {
      farmerID: f5.customerID,
      subject: "Equipment maintenance schedule",
      description:
        "When is the next maintenance visit for the cooling equipment?",
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
  console.log("════════════════════════════════════════════════════════");
  console.log("👤 Admin:    admin@gmail.com / bryson");
  console.log("🧑‍🌾 Farmers: farmer1@gmail.com → farmer5@gmail.com / bryson");
  console.log("────────────────────────────────────────────────────────");
  console.log(`🥛 Milk records:     ${milkRecords.length} total`);
  console.log(`   Farmer 1 (John):    5 collections`);
  console.log(`   Farmer 2 (Mary):    5 collections`);
  console.log(`   Farmer 3 (Peter):   6 collections`);
  console.log(`   Farmer 4 (Grace):   4 collections`);
  console.log(`   Farmer 5 (Samuel):  5 collections`);
  console.log("────────────────────────────────────────────────────────");
  console.log(`🌿 Feeding records:  ${feedingData.length}`);
  console.log(`🌤️  Weather records:  ${weatherData.length}`);
  console.log(`💰 Payments:         ${paymentsData.length}`);
  console.log(`🎫 Tickets:          ${ticketsData.length}`);
  console.log("────────────────────────────────────────────────────────");
  console.log("🐄 Cow breeds by farmer:");
  console.log("   farmer1@gmail.com → Friesian (8 cows)");
  console.log("   farmer2@gmail.com → Ayrshire (5 cows)");
  console.log("   farmer3@gmail.com → Holstein (12 cows)");
  console.log("   farmer4@gmail.com → Crossbreed (6 cows)");
  console.log("   farmer5@gmail.com → Sahiwal (10 cows)");
  console.log("════════════════════════════════════════════════════════");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
