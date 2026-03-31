import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import {
  text,
  varchar,
  serial,
  pgTable,
  decimal,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const RoleEnum = pgEnum("role", ["admin", "user"]);

export const PaymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Completed",
  "Failed",
  "Refunded",
]);

export const TicketStatusEnum = pgEnum("ticket_status", [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
]);

export const MilkCollectionStatusEnum = pgEnum("milk_collection_status", [
  "Recorded",
  "Verified",
  "Disputed",
]);

export const MilkQualityEnum = pgEnum("milk_quality", [
  "Grade A",
  "Grade B",
  "Grade C",
  "Rejected",
]);

export const FeedTypeEnum = pgEnum("feed_type", [
  "Napier Grass",
  "Maize Silage",
  "Dairy Meal",
  "Rhodes Grass",
  "Lucerne",
  "Wheat Bran",
  "Cotton Seed Cake",
  "Soya Bean Meal",
  "Hay",
  "Brewers Grain",
  "Molasses",
  "Mineral Supplement",
  "Other",
]);

export const FeedingTimeEnum = pgEnum("feeding_time", [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
]);

// ── NEW: Cow Breed Enum ───────────────────────────────────────────────────────
export const CowBreedEnum = pgEnum("cow_breed", [
  "Friesian",
  "Ayrshire",
  "Jersey",
  "Guernsey",
  "Brown Swiss",
  "Holstein",
  "Sahiwal",
  "Crossbreed",
  "Other",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

// Customers Table (Farmers and Admin/Collectors)
export const CustomersTable = pgTable("customers", {
  customerID: serial("customer_id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  farmLocation: varchar("farm_location", { length: 255 }),
  farmSize: varchar("farm_size", { length: 50 }),
  numberOfCows: integer("number_of_cows"),
  cowBreed: varchar("cow_breed", { length: 255 }),
  imageUrl: varchar("image_url", { length: 500 }),
  role: RoleEnum("role").default("user"), // "user" = Farmer, "admin" = Collector
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 10 }),
  isActive: boolean("is_active").default(true),
  unreadNotifications: integer("unread_notifications").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Milk Table
export const MilkTable = pgTable("milk", {
  milkID: serial("milk_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  collectorID: integer("collector_id").references(
    () => CustomersTable.customerID,
    { onDelete: "set null" },
  ),
  quantityInLiters: decimal("quantity_in_liters", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 })
    .notNull()
    .default("50.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  collectionDate: date("collection_date").notNull(),
  collectionTime: varchar("collection_time", { length: 20 }),
  collectionStatus:
    MilkCollectionStatusEnum("collection_status").default("Recorded"),
  qualityGrade: MilkQualityEnum("quality_grade").default("Grade A"),
  fatContent: decimal("fat_content", { precision: 5, scale: 2 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  notes: text("notes"),
  isDisputed: boolean("is_disputed").default(false),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Feeding Habits Table
export const FeedingHabitsTable = pgTable("feeding_habits", {
  feedingID: serial("feeding_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  milkID: integer("milk_id").references(() => MilkTable.milkID, {
    onDelete: "set null",
  }),
  feedType: FeedTypeEnum("feed_type").notNull(),
  amountKg: decimal("amount_kg", { precision: 8, scale: 2 }).notNull(),
  feedingTime: FeedingTimeEnum("feeding_time").notNull(),
  feedingDate: date("feeding_date").notNull(),
  supplementName: varchar("supplement_name", { length: 100 }),
  costPerKg: decimal("cost_per_kg", { precision: 8, scale: 2 }),
  notes: text("notes"),
  recordedBy: integer("recorded_by").references(
    () => CustomersTable.customerID,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// ── NEW: Weather Records Table ────────────────────────────────────────────────
export const WeatherRecordsTable = pgTable("weather_records", {
  weatherID: serial("weather_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  recordDate: date("record_date").notNull(),
  temperatureCelsius: decimal("temperature_celsius", {
    precision: 5,
    scale: 2,
  }), // e.g. 24.50
  rainfallMm: decimal("rainfall_mm", {
    precision: 6,
    scale: 2,
  }), // millimeters
  humidity: decimal("humidity", {
    precision: 5,
    scale: 2,
  }), // percentage 0-100
  weatherCondition: varchar("weather_condition", { length: 50 }),
  // e.g. "Sunny", "Cloudy", "Rainy", "Partly Cloudy"
  windSpeedKph: decimal("wind_speed_kph", { precision: 5, scale: 2 }),
  location: varchar("location", { length: 255 }), // farm location at time of record
  dataSource: varchar("data_source", { length: 50 }).default("manual"),
  // "manual" | "openweather" | "weatherapi" — set by backend when API used
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Payments Table
export const PaymentsTable = pgTable("payments", {
  paymentID: serial("payment_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  processedBy: integer("processed_by").references(
    () => CustomersTable.customerID,
    { onDelete: "set null" },
  ),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: PaymentStatusEnum("payment_status").default("Pending"),
  paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionID: varchar("transaction_id", { length: 100 }),
  paymentPeriod: varchar("payment_period", { length: 50 }).notNull(),
  totalLitersSupplied: decimal("total_liters_supplied", {
    precision: 10,
    scale: 2,
  }),
  averagePricePerLiter: decimal("average_price_per_liter", {
    precision: 10,
    scale: 2,
  }),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  deductionReason: text("deduction_reason"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0.00"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentNotes: text("payment_notes"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Customer Support Tickets Table
export const CustomerSupportTicketsTable = pgTable("customer_support_tickets", {
  ticketID: serial("ticket_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: TicketStatusEnum("status").default("Open"),
  priority: varchar("priority", { length: 20 }).default("Medium"),
  category: varchar("category", { length: 50 }),
  assignedTo: integer("assigned_to").references(
    () => CustomersTable.customerID,
    { onDelete: "set null" },
  ),
  response: text("response"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const CustomersRelations = relations(CustomersTable, ({ many }) => ({
  milkCollectionsAsFarmer: many(MilkTable, { relationName: "farmer" }),
  milkCollectionsAsCollector: many(MilkTable, { relationName: "collector" }),
  feedingHabitsAsFarmer: many(FeedingHabitsTable, {
    relationName: "farmerFeeding",
  }),
  feedingHabitsRecorded: many(FeedingHabitsTable, {
    relationName: "recorderFeeding",
  }),
  weatherRecords: many(WeatherRecordsTable, {
    // ← NEW
    relationName: "farmerWeather",
  }),
  paymentsReceived: many(PaymentsTable, { relationName: "farmerPayments" }),
  paymentsProcessed: many(PaymentsTable, { relationName: "adminProcessed" }),
  supportTickets: many(CustomerSupportTicketsTable, {
    relationName: "farmerTickets",
  }),
  assignedTickets: many(CustomerSupportTicketsTable, {
    relationName: "adminAssigned",
  }),
}));

export const MilkRelations = relations(MilkTable, ({ one, many }) => ({
  farmer: one(CustomersTable, {
    fields: [MilkTable.farmerID],
    references: [CustomersTable.customerID],
    relationName: "farmer",
  }),
  collector: one(CustomersTable, {
    fields: [MilkTable.collectorID],
    references: [CustomersTable.customerID],
    relationName: "collector",
  }),
  feedingHabits: many(FeedingHabitsTable, { relationName: "milkFeeding" }),
}));

export const FeedingHabitsRelations = relations(
  FeedingHabitsTable,
  ({ one }) => ({
    farmer: one(CustomersTable, {
      fields: [FeedingHabitsTable.farmerID],
      references: [CustomersTable.customerID],
      relationName: "farmerFeeding",
    }),
    milkCollection: one(MilkTable, {
      fields: [FeedingHabitsTable.milkID],
      references: [MilkTable.milkID],
      relationName: "milkFeeding",
    }),
    recorder: one(CustomersTable, {
      fields: [FeedingHabitsTable.recordedBy],
      references: [CustomersTable.customerID],
      relationName: "recorderFeeding",
    }),
  }),
);

// ── NEW: Weather Relations ────────────────────────────────────────────────────
export const WeatherRecordsRelations = relations(
  WeatherRecordsTable,
  ({ one }) => ({
    farmer: one(CustomersTable, {
      fields: [WeatherRecordsTable.farmerID],
      references: [CustomersTable.customerID],
      relationName: "farmerWeather",
    }),
  }),
);

export const PaymentsRelations = relations(PaymentsTable, ({ one }) => ({
  farmer: one(CustomersTable, {
    fields: [PaymentsTable.farmerID],
    references: [CustomersTable.customerID],
    relationName: "farmerPayments",
  }),
  processedByAdmin: one(CustomersTable, {
    fields: [PaymentsTable.processedBy],
    references: [CustomersTable.customerID],
    relationName: "adminProcessed",
  }),
}));

export const CustomerSupportTicketsRelations = relations(
  CustomerSupportTicketsTable,
  ({ one }) => ({
    farmer: one(CustomersTable, {
      fields: [CustomerSupportTicketsTable.farmerID],
      references: [CustomersTable.customerID],
      relationName: "farmerTickets",
    }),
    assignedAdmin: one(CustomersTable, {
      fields: [CustomerSupportTicketsTable.assignedTo],
      references: [CustomersTable.customerID],
      relationName: "adminAssigned",
    }),
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type TICustomer = typeof CustomersTable.$inferInsert;
export type TSCustomer = typeof CustomersTable.$inferSelect;
export type TSCustomerLoginInput = { email: string; password: string };

export type TIMilk = typeof MilkTable.$inferInsert;
export type TSMilk = typeof MilkTable.$inferSelect;

export type TIFeedingHabit = typeof FeedingHabitsTable.$inferInsert;
export type TSFeedingHabit = typeof FeedingHabitsTable.$inferSelect;

export type TIWeatherRecord = typeof WeatherRecordsTable.$inferInsert; // ← NEW
export type TSWeatherRecord = typeof WeatherRecordsTable.$inferSelect; // ← NEW

export type TIPayment = typeof PaymentsTable.$inferInsert;
export type TSPayment = typeof PaymentsTable.$inferSelect;

export type TISupportTicket = typeof CustomerSupportTicketsTable.$inferInsert;
export type TSSupportTicket = typeof CustomerSupportTicketsTable.$inferSelect;
