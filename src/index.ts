import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import customerRoutes from "./auth/auth.router";
import milkRoutes from "./milk/milk.router";
import supportRoutes from "./support/support.router";
import feedingRouter from "./feeding/feeding.router"; // ← added
import weatherRouter from "./weather/weather.router";
import geminiRouter from "./gemini/gemini.router";
import notificationRouter from "./notifications/notification.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
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
      feeding: {
        create: "POST /feeding",
        getAll: "GET /feeding/all",
        getById: "GET /feeding/:id",
        getByFarmer: "GET /feeding/farmer/:farmerID",
        getByFarmerAndDate: "GET /feeding/farmer/:farmerID/date/:date",
        getByMilkID: "GET /feeding/milk/:milkID",
        update: "PUT /feeding/:id",
        delete: "DELETE /feeding/:id",
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

// ── Routes ────────────────────────────────────────────────────────────────────
customerRoutes(app);
milkRoutes(app);
supportRoutes(app);
app.use("/feeding", feedingRouter); // ← added
app.use("/weather", weatherRouter);

app.use("/gemini", geminiRouter);
app.use("/notifications", notificationRouter);
// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🥛  Smart Daily API Server");
  console.log("=".repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "../uploads")}`);
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
  console.log("   Feeding Habits:");
  console.log("     POST   /feeding");
  console.log("     GET    /feeding/all");
  console.log("     GET    /feeding/:id");
  console.log("     GET    /feeding/farmer/:farmerID");
  console.log("     GET    /feeding/farmer/:farmerID/date/:date");
  console.log("     GET    /feeding/milk/:milkID");
  console.log("     PUT    /feeding/:id");
  console.log("     DELETE /feeding/:id");
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
  console.log("");
  console.log("   Static Files:");
  console.log("     GET    /uploads/:filename");
  console.log("=".repeat(50));
  console.log("🚀 Server is ready to accept requests!");
  console.log("=".repeat(50));
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT signal received: closing HTTP server");
  process.exit(0);
});

export default app;
