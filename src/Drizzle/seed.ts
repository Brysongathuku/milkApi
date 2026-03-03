import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...");
  console.log("=".repeat(50));

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await db.delete(schema.CustomerSupportTicketsTable);
    await db.delete(schema.PaymentsTable);
    await db.delete(schema.MilkTable);
    await db.delete(schema.CustomersTable);
    console.log("✅ Existing data cleared");
    console.log("");

    // Seed Admins/Collectors
    console.log("👤 Creating admins/collectors...");
    const hashedPassword = bcrypt.hashSync("admin123", 10);

    const admins = await db
      .insert(schema.CustomersTable)
      .values([
        {
          firstName: "Admin",
          lastName: "Collector",
          email: "admin@smartdairy.com",
          password: hashedPassword,
          contactPhone: "+254700000001",
          address: "123 Main Street, Nairobi",
          role: "admin",
          isVerified: true,
          isActive: true,
        },
        {
          firstName: "John",
          lastName: "Manager",
          email: "john.manager@smartdairy.com",
          password: hashedPassword,
          contactPhone: "+254700000002",
          address: "456 Business Ave, Nairobi",
          role: "admin",
          isVerified: true,
          isActive: true,
        },
      ])
      .returning();

    console.log(`✅ Created ${admins.length} admins`);
    console.log("");

    // Seed Farmers
    console.log("🌾 Creating farmers...");
    const farmerPassword = bcrypt.hashSync("farmer123", 10);

    const farmers = await db
      .insert(schema.CustomersTable)
      .values([
        {
          firstName: "James",
          lastName: "Kamau",
          email: "james.kamau@gmail.com",
          password: farmerPassword,
          contactPhone: "+254712345678",
          address: "Kiambu Road, Kiambu",
          farmLocation: "Kiambu County",
          farmSize: "Medium (5-20 acres)",
          numberOfCows: 15,
          role: "user",
          isVerified: true,
          isActive: true,
        },
        {
          firstName: "Mary",
          lastName: "Wanjiku",
          email: "mary.wanjiku@gmail.com",
          password: farmerPassword,
          contactPhone: "+254723456789",
          address: "Nakuru Town, Nakuru",
          farmLocation: "Nakuru County",
          farmSize: "Large (> 20 acres)",
          numberOfCows: 30,
          role: "user",
          isVerified: true,
          isActive: true,
        },
        {
          firstName: "Peter",
          lastName: "Ochieng",
          email: "peter.ochieng@gmail.com",
          password: farmerPassword,
          contactPhone: "+254734567890",
          address: "Kisumu City, Kisumu",
          farmLocation: "Kisumu County",
          farmSize: "Small (< 5 acres)",
          numberOfCows: 8,
          role: "user",
          isVerified: true,
          isActive: true,
        },
        {
          firstName: "Grace",
          lastName: "Mutua",
          email: "grace.mutua@gmail.com",
          password: farmerPassword,
          contactPhone: "+254745678901",
          address: "Machakos Town, Machakos",
          farmLocation: "Machakos County",
          farmSize: "Medium (5-20 acres)",
          numberOfCows: 12,
          role: "user",
          isVerified: true,
          isActive: true,
        },
        {
          firstName: "David",
          lastName: "Kipchoge",
          email: "david.kipchoge@gmail.com",
          password: farmerPassword,
          contactPhone: "+254756789012",
          address: "Eldoret Town, Uasin Gishu",
          farmLocation: "Uasin Gishu County",
          farmSize: "Large (> 20 acres)",
          numberOfCows: 25,
          role: "user",
          isVerified: true,
          isActive: true,
        },
      ])
      .returning();

    console.log(`✅ Created ${farmers.length} farmers`);
    console.log("");

    // Seed Milk Collections
    console.log("🥛 Creating milk collections...");
    const today = new Date();
    const milkCollections: (typeof schema.MilkTable.$inferInsert)[] = [];

    // Create collections for each farmer over the past 7 days
    for (let i = 0; i < 7; i++) {
      const collectionDate = new Date(today);
      collectionDate.setDate(today.getDate() - i);

      for (const farmer of farmers) {
        const quantity = Math.floor(Math.random() * 30) + 10; // 10-40 liters
        const pricePerLiter = 50.0;
        const fatContent = parseFloat((Math.random() * 2 + 3).toFixed(2)); // 3-5%
        const temperature = parseFloat((Math.random() * 2 + 3).toFixed(2)); // 3-5°C

        milkCollections.push({
          farmerID: farmer.customerID,
          collectorID: admins[i % admins.length].customerID, // Alternate between admins
          quantityInLiters: quantity.toString(),
          pricePerLiter: pricePerLiter.toString(),
          totalAmount: (quantity * pricePerLiter).toString(),
          collectionDate: collectionDate.toISOString().split("T")[0],
          collectionTime: `${6 + Math.floor(Math.random() * 4)}:${
            Math.floor(Math.random() * 6) * 10
          }0 AM`,
          collectionStatus: (i === 0 ? "Recorded" : "Verified") as
            | "Recorded"
            | "Verified"
            | "Disputed",
          qualityGrade: (fatContent > 4 ? "Grade A" : "Grade B") as
            | "Grade A"
            | "Grade B"
            | "Grade C"
            | "Rejected",
          fatContent: fatContent.toString(),
          temperature: temperature.toString(),
          notes:
            i % 3 === 0
              ? "Excellent quality milk"
              : i % 3 === 1
                ? "Good quality, slightly warm"
                : undefined,
          isDisputed: false,
        });
      }
    }

    const insertedCollections = await db
      .insert(schema.MilkTable)
      .values(milkCollections)
      .returning();

    console.log(`✅ Created ${insertedCollections.length} milk collections`);
    console.log("");

    // Seed Payments
    console.log("💰 Creating payments...");
    const payments: (typeof schema.PaymentsTable.$inferInsert)[] = [];

    for (const farmer of farmers) {
      // Calculate total for the farmer
      const farmerCollections = insertedCollections.filter(
        (c) => c.farmerID === farmer.customerID,
      );
      const totalLiters = farmerCollections.reduce(
        (sum, c) => sum + parseFloat(c.quantityInLiters),
        0,
      );
      const totalAmount = farmerCollections.reduce(
        (sum, c) => sum + parseFloat(c.totalAmount),
        0,
      );

      payments.push({
        farmerID: farmer.customerID,
        processedBy: admins[0].customerID,
        amount: totalAmount.toFixed(2),
        paymentStatus: "Completed" as
          | "Pending"
          | "Completed"
          | "Failed"
          | "Refunded",
        paymentMethod: "M-Pesa",
        transactionID: `MPESA${Math.floor(Math.random() * 1000000000)}`,
        paymentPeriod: "February 2026",
        totalLitersSupplied: totalLiters.toFixed(2),
        averagePricePerLiter: "50.00",
        deductions: "0.00",
        bonuses: "0.00",
        netAmount: totalAmount.toFixed(2),
        paymentNotes: "Payment for milk collections in February 2026",
      });
    }

    const insertedPayments = await db
      .insert(schema.PaymentsTable)
      .values(payments)
      .returning();

    console.log(`✅ Created ${insertedPayments.length} payments`);
    console.log("");

    // Seed Support Tickets
    console.log("🎫 Creating support tickets...");
    const tickets: (typeof schema.CustomerSupportTicketsTable.$inferInsert)[] =
      [
        {
          farmerID: farmers[0].customerID,
          subject: "Question about payment calculation",
          description:
            "I noticed the payment seems different from what I calculated. Can you help me understand how it's calculated?",
          status: "Open" as "Open" | "In Progress" | "Resolved" | "Closed",
          priority: "Medium",
          category: "Payment Query",
        },
        {
          farmerID: farmers[1].customerID,
          subject: "Milk collection time",
          description:
            "Can we schedule milk collection earlier in the morning? Around 5:30 AM would be better for me.",
          status: "In Progress" as
            | "Open"
            | "In Progress"
            | "Resolved"
            | "Closed",
          priority: "Low",
          category: "Collection Issue",
          assignedTo: admins[0].customerID,
          response:
            "We'll coordinate with the collector and get back to you shortly.",
        },
        {
          farmerID: farmers[2].customerID,
          subject: "Quality grade inquiry",
          description:
            "My milk was graded as Grade B yesterday. What can I do to improve to Grade A?",
          status: "Resolved" as "Open" | "In Progress" | "Resolved" | "Closed",
          priority: "Medium",
          category: "General",
          assignedTo: admins[1].customerID,
          response:
            "Grade is based on fat content. Aim for fat content above 4% for Grade A.",
          resolution:
            "Farmer advised on improving milk quality through better feed and cow care.",
          resolvedAt: new Date().toISOString(),
        },
      ];

    const insertedTickets = await db
      .insert(schema.CustomerSupportTicketsTable)
      .values(tickets)
      .returning();

    console.log(`✅ Created ${insertedTickets.length} support tickets`);
    console.log("");

    // Summary
    console.log("=".repeat(50));
    console.log("🎉 Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("");
    console.log("📊 Summary:");
    console.log(`   👤 Admins: ${admins.length}`);
    console.log(`   🌾 Farmers: ${farmers.length}`);
    console.log(`   🥛 Milk Collections: ${insertedCollections.length}`);
    console.log(`   💰 Payments: ${insertedPayments.length}`);
    console.log(`   🎫 Support Tickets: ${insertedTickets.length}`);
    console.log("");
    console.log("🔑 Login Credentials:");
    console.log("=".repeat(50));
    console.log("Admin/Collector:");
    console.log("  Email: admin@smartdairy.com");
    console.log("  Password: admin123");
    console.log("");
    console.log("Farmers (all use same password):");
    console.log("  Email: james.kamau@gmail.com");
    console.log("  Email: mary.wanjiku@gmail.com");
    console.log("  Email: peter.ochieng@gmail.com");
    console.log("  Email: grace.mutua@gmail.com");
    console.log("  Email: david.kipchoge@gmail.com");
    console.log("  Password: farmer123");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✅ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding process failed:", error);
    process.exit(1);
  });
