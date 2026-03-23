CREATE TYPE "public"."cow_breed" AS ENUM('Friesian', 'Ayrshire', 'Jersey', 'Guernsey', 'Brown Swiss', 'Holstein', 'Sahiwal', 'Crossbreed', 'Other');--> statement-breakpoint
CREATE TYPE "public"."feed_type" AS ENUM('Napier Grass', 'Maize Silage', 'Dairy Meal', 'Rhodes Grass', 'Lucerne', 'Wheat Bran', 'Cotton Seed Cake', 'Soya Bean Meal', 'Hay', 'Brewers Grain', 'Molasses', 'Mineral Supplement', 'Other');--> statement-breakpoint
CREATE TYPE "public"."feeding_time" AS ENUM('Morning', 'Afternoon', 'Evening', 'Night');--> statement-breakpoint
CREATE TYPE "public"."milk_collection_status" AS ENUM('Recorded', 'Verified', 'Disputed');--> statement-breakpoint
CREATE TYPE "public"."milk_quality" AS ENUM('Grade A', 'Grade B', 'Grade C', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Completed', 'Failed', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('Open', 'In Progress', 'Resolved', 'Closed');--> statement-breakpoint
CREATE TABLE "customer_support_tickets" (
	"ticket_id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"subject" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'Open',
	"priority" varchar(20) DEFAULT 'Medium',
	"category" varchar(50),
	"assigned_to" integer,
	"response" text,
	"resolution" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"customer_id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"address" varchar(255),
	"farm_location" varchar(255),
	"farm_size" varchar(50),
	"number_of_cows" integer,
	"cow_breed" varchar(255),
	"image_url" varchar(500),
	"role" "role" DEFAULT 'user',
	"is_verified" boolean DEFAULT false,
	"verification_code" varchar(10),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "feeding_habits" (
	"feeding_id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"milk_id" integer,
	"feed_type" "feed_type" NOT NULL,
	"amount_kg" numeric(8, 2) NOT NULL,
	"feeding_time" "feeding_time" NOT NULL,
	"feeding_date" date NOT NULL,
	"supplement_name" varchar(100),
	"cost_per_kg" numeric(8, 2),
	"notes" text,
	"recorded_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milk" (
	"milk_id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"collector_id" integer,
	"quantity_in_liters" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"price_per_liter" numeric(10, 2) DEFAULT '50.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"collection_date" date NOT NULL,
	"collection_time" varchar(20),
	"collection_status" "milk_collection_status" DEFAULT 'Recorded',
	"quality_grade" "milk_quality" DEFAULT 'Grade A',
	"fat_content" numeric(5, 2),
	"temperature" numeric(5, 2),
	"notes" text,
	"is_disputed" boolean DEFAULT false,
	"dispute_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"processed_by" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'Pending',
	"payment_date" timestamp DEFAULT now(),
	"payment_method" varchar(50),
	"transaction_id" varchar(100),
	"payment_period" varchar(50) NOT NULL,
	"total_liters_supplied" numeric(10, 2),
	"average_price_per_liter" numeric(10, 2),
	"deductions" numeric(10, 2) DEFAULT '0.00',
	"deduction_reason" text,
	"bonuses" numeric(10, 2) DEFAULT '0.00',
	"net_amount" numeric(10, 2) NOT NULL,
	"payment_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weather_records" (
	"weather_id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"record_date" date NOT NULL,
	"temperature_celsius" numeric(5, 2),
	"rainfall_mm" numeric(6, 2),
	"humidity" numeric(5, 2),
	"weather_condition" varchar(50),
	"wind_speed_kph" numeric(5, 2),
	"location" varchar(255),
	"data_source" varchar(50) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_support_tickets" ADD CONSTRAINT "customer_support_tickets_farmer_id_customers_customer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."customers"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_support_tickets" ADD CONSTRAINT "customer_support_tickets_assigned_to_customers_customer_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."customers"("customer_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeding_habits" ADD CONSTRAINT "feeding_habits_farmer_id_customers_customer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."customers"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeding_habits" ADD CONSTRAINT "feeding_habits_milk_id_milk_milk_id_fk" FOREIGN KEY ("milk_id") REFERENCES "public"."milk"("milk_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeding_habits" ADD CONSTRAINT "feeding_habits_recorded_by_customers_customer_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."customers"("customer_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk" ADD CONSTRAINT "milk_farmer_id_customers_customer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."customers"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk" ADD CONSTRAINT "milk_collector_id_customers_customer_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."customers"("customer_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_farmer_id_customers_customer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."customers"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_customers_customer_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."customers"("customer_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_records" ADD CONSTRAINT "weather_records_farmer_id_customers_customer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."customers"("customer_id") ON DELETE cascade ON UPDATE no action;