import "dotenv/config"; // ← MUST be first — fixes the SASL/password error

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import {
  CustomersTable,
  MilkTable,
  PaymentsTable,
  CustomerSupportTicketsTable,
} from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Apr 1–13 only. Apr 14 onwards recorded manually via the app.
function getAprilDates(): string[] {
  const dates: string[] = [];
  for (let d = 1; d <= 13; d++) {
    dates.push(`2026-04-${String(d).padStart(2, "0")}`);
  }
  return dates;
}

function rand(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

async function main() {
  console.log("🌱 Seeding database...");

  const hashed = await bcrypt.hash("bryson20", 10);
  const dates = getAprilDates();

  // ── 1. ADMIN ────────────────────────────────────────────────────────────────
  const [admin] = await db
    .insert(CustomersTable)
    .values({
      firstName: "Bryson",
      lastName: "Gathuku",
      email: "brysongathuku189@gmail.com",
      password: hashed,
      contactPhone: "+254700000001",
      address: "Limuru Town, Kiambu County",
      farmLocation: "Limuru",
      role: "admin" as const,
      isVerified: true,
      isActive: true,
      unreadNotifications: 0,
    })
    .returning();
  console.log("✅ Admin:", admin.email);

  // ── 2. FARMERS ──────────────────────────────────────────────────────────────
  const farmers = await db
    .insert(CustomersTable)
    .values([
      {
        firstName: "James",
        lastName: "Kamau",
        email: "james.kamau@gmail.com",
        password: hashed,
        contactPhone: "+254711000001",
        farmLocation: "Tigoni Village, Limuru",
        farmSize: "Small (1-5 acres)",
        numberOfCows: 4,
        cowBreed: "Friesian",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Mary",
        lastName: "Wanjiru",
        email: "mary.wanjiru@gmail.com",
        password: hashed,
        contactPhone: "+254711000002",
        farmLocation: "Ndeiya Village, Limuru",
        farmSize: "Medium (5-20 acres)",
        numberOfCows: 8,
        cowBreed: "Ayrshire",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Peter",
        lastName: "Mwangi",
        email: "peter.mwangi@gmail.com",
        password: hashed,
        contactPhone: "+254711000003",
        farmLocation: "Kikuyu-Limuru, Limuru",
        farmSize: "Medium (5-20 acres)",
        numberOfCows: 12,
        cowBreed: "Holstein",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Grace",
        lastName: "Njeri",
        email: "grace.njeri@gmail.com",
        password: hashed,
        contactPhone: "+254711000004",
        farmLocation: "Kamirithu Village, Limuru",
        farmSize: "Small (1-5 acres)",
        numberOfCows: 3,
        cowBreed: "Jersey",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Samuel",
        lastName: "Kariuki",
        email: "samuel.kariuki@gmail.com",
        password: hashed,
        contactPhone: "+254711000005",
        farmLocation: "Limuru Town Centre",
        farmSize: "Large (20+ acres)",
        numberOfCows: 20,
        cowBreed: "Crossbreed",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Faith",
        lastName: "Wambui",
        email: "faith.wambui@gmail.com",
        password: hashed,
        contactPhone: "+254711000006",
        farmLocation: "Bibirioni Village, Limuru",
        farmSize: "Medium (5-20 acres)",
        numberOfCows: 10,
        cowBreed: "Friesian",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "David",
        lastName: "Gacheru",
        email: "david.gacheru@gmail.com",
        password: hashed,
        contactPhone: "+254711000007",
        farmLocation: "Kinale Village, Limuru",
        farmSize: "Small (1-5 acres)",
        numberOfCows: 5,
        cowBreed: "Sahiwal",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Esther",
        lastName: "Wairimu",
        email: "esther.wairimu@gmail.com",
        password: hashed,
        contactPhone: "+254711000008",
        farmLocation: "Ngecha Village, Limuru",
        farmSize: "Medium (5-20 acres)",
        numberOfCows: 7,
        cowBreed: "Ayrshire",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "John",
        lastName: "Njoroge",
        email: "john.njoroge@gmail.com",
        password: hashed,
        contactPhone: "+254711000009",
        farmLocation: "Uplands Village, Limuru",
        farmSize: "Medium (5-20 acres)",
        numberOfCows: 9,
        cowBreed: "Brown Swiss",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
      {
        firstName: "Agnes",
        lastName: "Muthoni",
        email: "agnes.muthoni@gmail.com",
        password: hashed,
        contactPhone: "+254711000010",
        farmLocation: "Githirioni Village, Limuru",
        farmSize: "Small (1-5 acres)",
        numberOfCows: 6,
        cowBreed: "Guernsey",
        role: "user" as const,
        isVerified: true,
        isActive: true,
        unreadNotifications: 0,
      },
    ])
    .returning();
  console.log(`✅ ${farmers.length} farmers`);

  // ── 3. MILK COLLECTIONS (Apr 1–13, morning + evening per farmer) ────────────
  const milkRows: (typeof MilkTable.$inferInsert)[] = [];

  for (const farmer of farmers) {
    for (const date of dates) {
      // Morning
      const mL = parseFloat(rand(8, 20));
      milkRows.push({
        farmerID: farmer.customerID,
        collectorID: admin.customerID,
        quantityInLiters: mL.toFixed(2),
        pricePerLiter: "55.00",
        totalAmount: (mL * 55).toFixed(2),
        collectionDate: date,
        collectionTime: "06:00",
        collectionStatus: "Verified" as const,
        qualityGrade: "Grade A" as const,
        fatContent: rand(3.5, 5.5),
        temperature: rand(3.0, 6.0),
        notes: "Morning collection",
        isDisputed: false,
      });

      // Evening
      const eL = parseFloat(rand(6, 16));
      milkRows.push({
        farmerID: farmer.customerID,
        collectorID: admin.customerID,
        quantityInLiters: eL.toFixed(2),
        pricePerLiter: "55.00",
        totalAmount: (eL * 55).toFixed(2),
        collectionDate: date,
        collectionTime: "17:00",
        collectionStatus: "Verified" as const,
        qualityGrade: (Math.random() > 0.85 ? "Grade B" : "Grade A") as
          | "Grade A"
          | "Grade B",
        fatContent: rand(3.2, 5.0),
        temperature: rand(3.0, 6.5),
        notes: "Evening collection",
        isDisputed: false,
      });
    }
  }

  const milk = await db.insert(MilkTable).values(milkRows).returning();
  console.log(`✅ ${milk.length} milk records (Apr 1–13)`);

  // ── 4. PAYMENTS ──────────────────────────────────────────────────────────────
  const paymentRows: (typeof PaymentsTable.$inferInsert)[] = [];

  for (const farmer of farmers) {
    const farmerMilk = milk.filter((m) => m.farmerID === farmer.customerID);
    const totalLiters = farmerMilk.reduce(
      (s, m) => s + parseFloat(m.quantityInLiters as string),
      0,
    );
    const gross = totalLiters * 55;
    const bonus = totalLiters > 200 ? 500 : 0;

    paymentRows.push({
      farmerID: farmer.customerID,
      processedBy: admin.customerID,
      amount: gross.toFixed(2),
      paymentStatus: "Completed" as const,
      paymentMethod: "M-Pesa",
      transactionID: `TXN-${farmer.customerID}-APR2026`,
      paymentPeriod: "April 1–13, 2026",
      totalLitersSupplied: totalLiters.toFixed(2),
      averagePricePerLiter: "55.00",
      deductions: "0.00",
      bonuses: bonus.toFixed(2),
      netAmount: (gross + bonus).toFixed(2),
      paymentNotes: "Payment for April 1–13, 2026 collections",
    });
  }

  const payments = await db
    .insert(PaymentsTable)
    .values(paymentRows)
    .returning();
  console.log(`✅ ${payments.length} payments`);

  // ── 5. SUPPORT TICKETS ───────────────────────────────────────────────────────
  const tickets = await db
    .insert(CustomerSupportTicketsTable)
    .values([
      {
        farmerID: farmers[0].customerID,
        subject: "Milk collection delayed on April 3rd",
        description:
          "The collector did not show up for the morning session on April 3rd. My milk spoiled.",
        status: "Resolved" as const,
        priority: "High",
        category: "Collection Issue",
        assignedTo: admin.customerID,
        response:
          "We apologize for the inconvenience. Compensation has been added to your next payment.",
        resolution: "Compensated KES 550 added to April payment.",
        resolvedAt: "2026-04-12T10:00:00Z",
      },
      {
        farmerID: farmers[1].customerID,
        subject: "Payment not received for Week 1",
        description:
          "I supplied milk from April 1 to 7 but have not received any payment to my M-Pesa yet.",
        status: "Resolved" as const,
        priority: "High",
        category: "Payment Issue",
        assignedTo: admin.customerID,
        response:
          "Payment was processed on April 10. Please check your M-Pesa message history.",
        resolution: "Payment confirmed delivered via M-Pesa.",
        resolvedAt: "2026-04-12T10:00:00Z",
      },
      {
        farmerID: farmers[2].customerID,
        subject: "Milk graded Grade B unfairly on April 5th",
        description:
          "My evening milk was graded Grade B but I maintain high hygiene standards. I want it reviewed.",
        status: "In Progress" as const,
        priority: "Medium",
        category: "Quality Dispute",
        assignedTo: admin.customerID,
        response:
          "We have raised this with the quality team and are reviewing the testing records.",
        resolution: null,
        resolvedAt: null,
      },
      {
        farmerID: farmers[3].customerID,
        subject: "Request for subsidized feed supply",
        description:
          "I would like to know if the cooperative can supply Dairy Meal at subsidized prices.",
        status: "Open" as const,
        priority: "Low",
        category: "General Inquiry",
        assignedTo: admin.customerID,
        response: null,
        resolution: null,
        resolvedAt: null,
      },
      {
        farmerID: farmers[4].customerID,
        subject: "Collector rude during morning session on April 8th",
        description:
          "The collector was very rude and aggressive. This is unacceptable behavior.",
        status: "In Progress" as const,
        priority: "High",
        category: "Complaint",
        assignedTo: admin.customerID,
        response:
          "We take this very seriously. An internal review has been opened.",
        resolution: null,
        resolvedAt: null,
      },
      {
        farmerID: farmers[5].customerID,
        subject: "Update farm size on my profile",
        description:
          "I have expanded my farm from medium to large. Please update my profile.",
        status: "Resolved" as const,
        priority: "Low",
        category: "Account Update",
        assignedTo: admin.customerID,
        response: "Your farm size has been updated to Large (20+ acres).",
        resolution: "Profile updated successfully.",
        resolvedAt: "2026-04-12T10:00:00Z",
      },
      {
        farmerID: farmers[6].customerID,
        subject: "Incorrect number of cows on profile",
        description:
          "My profile shows 5 cows but I now have 8 after purchasing 3 more last month.",
        status: "Resolved" as const,
        priority: "Medium",
        category: "Account Update",
        assignedTo: admin.customerID,
        response: "Number of cows updated from 5 to 8 on your profile.",
        resolution: "Profile updated.",
        resolvedAt: "2026-04-12T10:00:00Z",
      },
      {
        farmerID: farmers[7].customerID,
        subject: "No collection on April 11th",
        description:
          "There was no milk collection on April 11th for both morning and evening sessions.",
        status: "Open" as const,
        priority: "High",
        category: "Collection Issue",
        assignedTo: admin.customerID,
        response: null,
        resolution: null,
        resolvedAt: null,
      },
    ])
    .returning();
  console.log(`✅ ${tickets.length} support tickets`);

  // ── DONE ─────────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log(`👤 Admin    : brysongathuku189@gmail.com`);
  console.log(`🔑 Password : bryson20 (all users)`);
  console.log(`👨‍🌾 Farmers  : ${farmers.length}`);
  console.log(`🥛 Milk     : ${milk.length} records (Apr 1–13)`);
  console.log(`💰 Payments : ${payments.length}`);
  console.log(`🎫 Tickets  : ${tickets.length}`);
  console.log("─────────────────────────────────────────");
  console.log("📌 Apr 14 onwards → record manually via the app");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
