import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { TICustomer, CustomersTable, TSCustomer } from "../Drizzle/schema";

// Register a customer (farmer or admin)
export const createCustomerService = async (user: TICustomer) => {
  const result = await db.insert(CustomersTable).values(user).returning(); // ✅ FIXED: returns the created row so controller knows it succeeded
  return result[0] ?? null;
};

// Verify customer account
export const verifyCustomerService = async (email: string) => {
  await db
    .update(CustomersTable)
    .set({ isVerified: true, verificationCode: null })
    .where(eq(CustomersTable.email, email)); // ✅ FIXED: use eq() instead of raw sql
};

// Customer login service (not currently used but kept for consistency)
export const customerLoginService = async (customer: TSCustomer) => {
  const { email } = customer;

  return await db.query.CustomersTable.findFirst({
    columns: {
      customerID: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      role: true,
      isVerified: true,
      isActive: true,
    },
    where: eq(CustomersTable.email, email), // ✅ FIXED: use eq() instead of raw sql
  });
};

// Get all customers (both farmers and admins)
export const getCustomerService = async () => {
  const customers = await db.query.CustomersTable.findMany({
    columns: {
      customerID: true,
      firstName: true,
      lastName: true,
      email: true,
      contactPhone: true,
      address: true,
      farmLocation: true,
      farmSize: true,
      numberOfCows: true,
      imageUrl: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Exclude password and verificationCode from results
    },
  });
  return customers;
};

// Get customer by ID
export const getCustomerByIdService = async (id: number) => {
  const customer = await db.query.CustomersTable.findFirst({
    where: eq(CustomersTable.customerID, id),
  });
  return customer;
};

// Get customer by email
export const getCustomerByEmailService = async (email: string) => {
  return await db.query.CustomersTable.findFirst({
    where: eq(CustomersTable.email, email), // ✅ FIXED: use eq() instead of raw sql
  });
};

// Update customer by ID
export const updateCustomerService = async (
  id: number,
  customer: TICustomer,
) => {
  await db
    .update(CustomersTable)
    .set(customer)
    .where(eq(CustomersTable.customerID, id))
    .returning();
  return "Customer updated successfully";
};

// Delete customer by ID
export const deleteCustomerService = async (id: number) => {
  await db
    .delete(CustomersTable)
    .where(eq(CustomersTable.customerID, id))
    .returning();
  return "Customer deleted successfully";
};

// Get all farmers (users only)
export const getFarmersService = async () => {
  const farmers = await db.query.CustomersTable.findMany({
    where: eq(CustomersTable.role, "user"), // ✅ FIXED: use eq() instead of raw sql
    columns: {
      customerID: true,
      firstName: true,
      lastName: true,
      email: true,
      contactPhone: true,
      address: true,
      farmLocation: true,
      farmSize: true,
      numberOfCows: true,
      imageUrl: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return farmers;
};

// Get all admins/collectors (admins only)
export const getAdminsService = async () => {
  const admins = await db.query.CustomersTable.findMany({
    where: eq(CustomersTable.role, "admin"), // ✅ FIXED: use eq() instead of raw sql
    columns: {
      customerID: true,
      firstName: true,
      lastName: true,
      email: true,
      contactPhone: true,
      address: true,
      imageUrl: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return admins;
};
