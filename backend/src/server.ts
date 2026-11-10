import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import studyRoutes from "./routes/study.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import { setupWebSocketServer } from "./realtime/websocket.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend clients (Cloudflare Pages, localhost, mobile browsers)
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id", "x-client-id"],
  })
);

// Body parsing with safe size limit
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Request logging in development
if (config.nodeEnv === "development") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/study", studyRoutes);
app.use("/api/v1/tutor", tutorRoutes);
app.use("/api/v1/sync", syncRoutes);
app.use("/api/v1/events", eventsRoutes);

// Root fallback route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "LearnLite Backend API",
    status: "online",
    docs: "/health",
    version: "0.1.0",
  });
});

// 404 Handler
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

// Setup WebSocket server
setupWebSocketServer(server);

// Start server
server.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 LearnLite Backend running on port ${config.port}`);
  console.log(`📡 Connected to AI Service at: ${config.aiServiceUrl}`);
  console.log(`⚡ Real-time SSE available at /api/v1/events/:sessionId`);
  console.log(`🔌 WebSockets available at ws://localhost:${config.port}/ws`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
