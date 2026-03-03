import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import {
  createCustomerService,
  verifyCustomerService,
  customerLoginService,
  getCustomerService,
  getCustomerByIdService,
  getCustomerByEmailService,
  updateCustomerService,
  deleteCustomerService,
} from "./auth.service";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer/mailer";
import { TSCustomerLoginInput } from "../Drizzle/schema";

// Register customer controller (handles both farmers and admins)
export const registerCustomerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const customer = req.body;
    const password = customer.password;
    const hashedPassword = await bcrypt.hashSync(password, 10);
    customer.password = hashedPassword;

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    customer.verificationCode = verificationCode;
    customer.isVerified = false;

    // Set default role to 'user' (farmer) if not specified
    if (!customer.role) {
      customer.role = "user";
    }

    // Validate farmer-specific fields if role is 'user' (farmer)
    if (customer.role === "user") {
      // Optional: Add validation for farmer fields
      if (customer.numberOfCows && customer.numberOfCows < 0) {
        return res
          .status(400)
          .json({ message: "Number of cows cannot be negative" });
      }
    }

    const createUser = await createCustomerService(customer);
    if (!createUser) return res.json({ message: "User not created" });

    try {
      const roleText = customer.role === "admin" ? "Collector" : "Farmer";
      await sendEmail(
        customer.email,
        "Verify your account",
        `Hello ${customer.firstName} ${customer.lastName}, your verification code is: ${verificationCode}`,
        `<div>
          <h2>Hello ${customer.firstName} ${customer.lastName},</h2>
          <p>Welcome to Smart Dairy Management System as a <strong>${roleText}</strong>!</p>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>Enter this code to verify your account.</p>
        </div>`,
      );
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
    }

    return res
      .status(201)
      .json({ message: "User created. Verification code sent to email." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Verify customer controller

export const verifyCustomerController = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body;

    // Basic validation
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }

    const customer = await getCustomerByEmailService(email);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Already verified
    if (customer.isVerified) {
      return res.status(200).json({ message: "User is already verified" });
    }

    // Compare verification codes (trimmed, string)
    const storedCode = String(customer.verificationCode).trim();
    const receivedCode = String(verificationCode).trim();

    if (storedCode !== receivedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark customer as verified
    await verifyCustomerService(email);

    // Send verification success email (non-blocking)
    try {
      const roleText = customer.role === "admin" ? "Collector" : "Farmer";

      await sendEmail(
        customer.email,
        "Account Verified Successfully",
        `Hello ${customer.firstName} ${customer.lastName}, your account has been verified. You can now log in and use all features.`,
        `<div>
          <h2>Hello ${customer.firstName} ${customer.lastName},</h2>
          <p>Your <strong>${roleText}</strong> account has been <strong>successfully verified</strong>!</p>
          <p>You can now log in and enjoy our services.</p>
        </div>`,
      );
    } catch (emailError: any) {
      console.error("Failed to send verification success email:", emailError);
    }

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error: any) {
    console.error("Verification error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

// Login customer controller
export const loginCustomerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as TSCustomerLoginInput;

    if (!email || typeof email !== "string" || email.trim() === "") {
      return res
        .status(400)
        .json({ message: "Email is required and must be a non-empty string." });
    }
    if (!password || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({
        message: "Password is required and must be a non-empty string.",
      });
    }

    const customerExist = await getCustomerByEmailService(email);

    if (!customerExist) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is verified
    if (!customerExist.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your account first.",
      });
    }

    // Check if account is active
    if (!customerExist.isActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact support.",
      });
    }

    const userMatch = await bcrypt.compare(
      password,
      customerExist.password as string,
    );

    if (!userMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const secret = process.env.JWT_SECRET as string;

    if (!secret) {
      console.error(
        "Critical Error: JWT_SECRET environment variable is not defined!",
      );
      return res.status(500).json({
        message: "Server configuration error. Please try again later.",
      });
    }

    // Create the JWT payload
    const payload = {
      sub: customerExist.customerID,
      user_id: customerExist.customerID,
      first_name: customerExist.firstName,
      last_name: customerExist.lastName,
      email: customerExist.email,
      role: customerExist.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3, // 3 days expiration in seconds
    };

    // Generate the token
    const token = jwt.sign(payload, secret);

    // Prepare user data to return (including farmer-specific fields if applicable)
    const userData: any = {
      user_id: customerExist.customerID,
      first_name: customerExist.firstName,
      last_name: customerExist.lastName,
      email: customerExist.email,
      role: customerExist.role,
      contact_phone: customerExist.contactPhone,
      address: customerExist.address,
      image_url: customerExist.imageUrl,
    };

    // Add farmer-specific data if user is a farmer
    if (customerExist.role === "user") {
      userData.farm_location = customerExist.farmLocation;
      userData.farm_size = customerExist.farmSize;
      userData.number_of_cows = customerExist.numberOfCows;
    }

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: userData,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during login." });
  }
};

// Get all customers controller (admins and farmers)
export const getCustomerController = async (req: Request, res: Response) => {
  try {
    const customers = await getCustomerService();
    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Optionally filter by role using query parameter
    const { role } = req.query;
    let filteredCustomers = customers;

    if (role === "admin" || role === "user") {
      filteredCustomers = customers.filter(
        (customer) => customer.role === role,
      );
    }

    return res.status(200).json({ data: filteredCustomers });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get customer by ID controller
export const getCustomerByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;

    // Handle string array case
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const customer = await getCustomerByIdService(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Don't return password in response
    const { password, verificationCode, ...customerData } = customer;

    return res.status(200).json(customerData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update customer by ID controller
export const updateCustomerController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;

    // Handle string array case
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const customer = req.body;

    // Hash password if it's being updated
    if (customer.password) {
      customer.password = await bcrypt.hashSync(customer.password, 10);
    }

    // Validate farmer-specific fields if updating a farmer
    if (customer.numberOfCows && customer.numberOfCows < 0) {
      return res
        .status(400)
        .json({ message: "Number of cows cannot be negative" });
    }

    const existingCustomer = await getCustomerByIdService(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatedCustomer = await updateCustomerService(id, customer);
    if (!updatedCustomer) {
      return res.status(400).json({ message: "Customer not updated" });
    }

    return res.status(200).json({ message: "Customer updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete customer by ID controller
export const deleteCustomerController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;

    // Handle string array case
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingCustomer = await getCustomerByIdService(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const deleted = await deleteCustomerService(id);
    if (!deleted) {
      return res.status(400).json({ message: "Customer not deleted" });
    }

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all farmers controller (users only)
export const getFarmersController = async (req: Request, res: Response) => {
  try {
    const farmers = await getCustomerService();
    if (!farmers || farmers.length === 0) {
      return res.status(404).json({ message: "No farmers found" });
    }

    // Filter only farmers (role = 'user')
    const farmersList = farmers.filter((customer) => customer.role === "user");

    if (farmersList.length === 0) {
      return res.status(404).json({ message: "No farmers found" });
    }

    return res.status(200).json({ data: farmersList });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all admins controller (admins only)
export const getAdminsController = async (req: Request, res: Response) => {
  try {
    const admins = await getCustomerService();
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }

    // Filter only admins (role = 'admin')
    const adminsList = admins.filter((customer) => customer.role === "admin");

    if (adminsList.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }

    return res.status(200).json({ data: adminsList });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
