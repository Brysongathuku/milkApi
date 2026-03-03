import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import customerRoutes from "./auth/auth.router";
import milkRoutes from "./milk/milk.router";
import supportRoutes from "./support/support.router";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "🥛 Smart Daily API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login",
        verify: "POST /auth/verify",
        customers: "GET /customers",
        farmers: "GET /farmers",
        admins: "GET /admins",
      },
      milk: {
        create: "POST /milk/collection",
        getAll: "GET /milk/collections",
        getById: "GET /milk/collection/:id",
        getByFarmer: "GET /milk/farmer/:farmerId",
        getByCollector: "GET /milk/collector/:collectorId",
        getSummary: "GET /milk/farmer/:farmerId/summary",
      },
      support: {
        create: "POST /support/ticket",
        getAll: "GET /support/tickets",
        getById: "GET /support/ticket/:id",
        getByFarmer: "GET /support/farmer/:farmerId",
        statistics: "GET /support/statistics",
      },
    },
  });
});

// API Routes
customerRoutes(app); // Auth routes (/auth/*, /customers/*, /customer/:id)
milkRoutes(app); // Milk collection routes (/milk/*)
supportRoutes(app); // Support ticket routes (/support/*)

// 404 handler - Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🥛  Smart Daily API Server");
  console.log("=".repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/`);
  console.log("=".repeat(50));
  console.log("📍 Available Endpoints:");
  console.log("   Auth:");
  console.log("     POST   /auth/register");
  console.log("     POST   /auth/login");
  console.log("     POST   /auth/verify");
  console.log("     GET    /customers");
  console.log("     GET    /farmers");
  console.log("     GET    /admins");
  console.log("     GET    /customer/:id");
  console.log("     PUT    /customer/:id");
  console.log("     DELETE /customer/:id");
  console.log("");
  console.log("   Milk Collections:");
  console.log("     POST   /milk/collection");
  console.log("     GET    /milk/collections");
  console.log("     GET    /milk/collection/:id");
  console.log("     GET    /milk/farmer/:farmerId");
  console.log("     GET    /milk/collector/:collectorId");
  console.log("     GET    /milk/farmer/:farmerId/summary");
  console.log("     PUT    /milk/collection/:id");
  console.log("     PATCH  /milk/collection/:id/status");
  console.log("     PATCH  /milk/collection/:id/dispute");
  console.log("     PATCH  /milk/collection/:id/resolve");
  console.log("     DELETE /milk/collection/:id");
  console.log("");
  console.log("   Support Tickets:");
  console.log("     POST   /support/ticket");
  console.log("     GET    /support/tickets");
  console.log("     GET    /support/ticket/:id");
  console.log("     GET    /support/farmer/:farmerId");
  console.log("     GET    /support/admin/:adminId");
  console.log("     GET    /support/statistics");
  console.log("     PUT    /support/ticket/:id");
  console.log("     PATCH  /support/ticket/:id/assign");
  console.log("     PATCH  /support/ticket/:id/response");
  console.log("     PATCH  /support/ticket/:id/resolve");
  console.log("     DELETE /support/ticket/:id");
  console.log("=".repeat(50));
  console.log("🚀 Server is ready to accept requests!");
  console.log("=".repeat(50));
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT signal received: closing HTTP server");
  process.exit(0);
});

export default app;
