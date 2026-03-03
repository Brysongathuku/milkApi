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

// Role Enum
export const RoleEnum = pgEnum("role", ["admin", "user"]);

// Payment Status Enum
export const PaymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Completed",
  "Failed",
  "Refunded",
]);

// Ticket Status Enum
export const TicketStatusEnum = pgEnum("ticket_status", [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
]);

// Milk Collection Status Enum
export const MilkCollectionStatusEnum = pgEnum("milk_collection_status", [
  "Recorded",
  "Verified",
  "Disputed",
]);

// Milk Quality Grade Enum
export const MilkQualityEnum = pgEnum("milk_quality", [
  "Grade A",
  "Grade B",
  "Grade C",
  "Rejected",
]);

// Customers Table (Farmers and Admin/Collectors)
export const CustomersTable = pgTable("customers", {
  customerID: serial("customer_id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  farmLocation: varchar("farm_location", { length: 255 }), // For farmers
  farmSize: varchar("farm_size", { length: 50 }), // e.g., "5 acres", "Small", "Medium"
  numberOfCows: integer("number_of_cows"), // For farmers
  imageUrl: varchar("image_url", { length: 500 }),
  role: RoleEnum("role").default("user"), // "user" = Farmer, "admin" = Collector
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 10 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Milk Table (Milk Collections from Farmers)
export const MilkTable = pgTable("milk", {
  milkID: serial("milk_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  collectorID: integer("collector_id").references(
    () => CustomersTable.customerID,
    { onDelete: "set null" },
  ), // Admin who recorded
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
  fatContent: decimal("fat_content", { precision: 5, scale: 2 }), // Fat percentage
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // Temperature at collection
  notes: text("notes"), // Any additional notes by collector
  isDisputed: boolean("is_disputed").default(false),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Payments Table (Monthly Payments to Farmers)
export const PaymentsTable = pgTable("payments", {
  paymentID: serial("payment_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  processedBy: integer("processed_by").references(
    () => CustomersTable.customerID,
    {
      onDelete: "set null",
    },
  ), // Admin who processed payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: PaymentStatusEnum("payment_status").default("Pending"),
  paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }), // e.g., "Bank Transfer", "M-Pesa", "Cash"
  transactionID: varchar("transaction_id", { length: 100 }),
  paymentPeriod: varchar("payment_period", { length: 50 }).notNull(), // e.g., "January 2026"
  totalLitersSupplied: decimal("total_liters_supplied", {
    precision: 10,
    scale: 2,
  }), // Total liters for the month
  averagePricePerLiter: decimal("average_price_per_liter", {
    precision: 10,
    scale: 2,
  }),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default(
    "0.00",
  ), // Any deductions
  deductionReason: text("deduction_reason"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0.00"), // Any bonuses for quality
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(), // Final amount paid
  paymentNotes: text("payment_notes"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// Customer Support Tickets Table (Farmers asking questions/issues to Admin)
export const CustomerSupportTicketsTable = pgTable("customer_support_tickets", {
  ticketID: serial("ticket_id").primaryKey(),
  farmerID: integer("farmer_id")
    .notNull()
    .references(() => CustomersTable.customerID, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: TicketStatusEnum("status").default("Open"),
  priority: varchar("priority", { length: 20 }).default("Medium"), // Low, Medium, High, Urgent
  category: varchar("category", { length: 50 }), // e.g., "Payment Query", "Collection Issue", "General"
  assignedTo: integer("assigned_to").references(
    () => CustomersTable.customerID,
    {
      onDelete: "set null",
    },
  ), // Admin handling the ticket
  response: text("response"), // Admin's response
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// RELATIONSHIPS

// CustomersTable Relationships
export const CustomersRelations = relations(CustomersTable, ({ many }) => ({
  milkCollectionsAsFarmer: many(MilkTable, { relationName: "farmer" }),
  milkCollectionsAsCollector: many(MilkTable, { relationName: "collector" }),
  paymentsReceived: many(PaymentsTable, { relationName: "farmerPayments" }),
  paymentsProcessed: many(PaymentsTable, { relationName: "adminProcessed" }),
  supportTickets: many(CustomerSupportTicketsTable, {
    relationName: "farmerTickets",
  }),
  assignedTickets: many(CustomerSupportTicketsTable, {
    relationName: "adminAssigned",
  }),
}));

// MilkTable Relationships
export const MilkRelations = relations(MilkTable, ({ one }) => ({
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
}));

// PaymentsTable Relationships
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

// CustomerSupportTicketsTable Relationships
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

// Types - Insert and Select for all tables

// Customer Types
export type TICustomer = typeof CustomersTable.$inferInsert;
export type TSCustomer = typeof CustomersTable.$inferSelect;

// Login input type
export type TSCustomerLoginInput = {
  email: string;
  password: string;
};

// Milk Types
export type TIMilk = typeof MilkTable.$inferInsert;
export type TSMilk = typeof MilkTable.$inferSelect;

// Payment Types
export type TIPayment = typeof PaymentsTable.$inferInsert;
export type TSPayment = typeof PaymentsTable.$inferSelect;

// Support Ticket Types
export type TISupportTicket = typeof CustomerSupportTicketsTable.$inferInsert;
export type TSSupportTicket = typeof CustomerSupportTicketsTable.$inferSelect;
