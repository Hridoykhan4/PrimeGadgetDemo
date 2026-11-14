const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const colors = require("colors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Product images (served before the API rate limiter; heavily cached)
app.use("/media", require("./routes/media"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down" },
});
app.use("/api", limiter);

// Body parsing
// Stripe webhook needs the raw body for signature verification — must be before express.json
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentController").webhook,
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security
app.use(mongoSanitize());
app.use(compression());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://prime-gadget.vercel.app",
  "https://primegadgets.ae",
  "https://www.primegadgets.ae",
  "http://primegadgets.ae",
  "http://www.primegadgets.ae",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  }),
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/orders", require("./routes/orders"));
app.use("/api/v1/reviews", require("./routes/reviews"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/stats", require("./routes/stats"));
app.use("/api/v1/upload", require("./routes/upload"));
app.use("/api/v1/messages", require("./routes/messages"));

// Health
app.get("/api/v1/health", (req, res) =>
  res.json({
    status: "ok",
    service: "PrimeGadgets API",
    region: "Dubai, UAE",
    timestamp: new Date().toISOString(),
  }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 PrimeGadgets API → http://localhost:${PORT}`.green.bold),
);

// Release stock held by card orders that were never paid
const { sweepAbandonedCardOrders } = require("./controllers/orderController");
setInterval(() => {
  sweepAbandonedCardOrders()
    .then((n) => n && console.log(`Released ${n} unpaid card order(s)`))
    .catch((e) => console.error("sweep failed:", e.message));
}, 15 * 60 * 1000).unref();

process.on("unhandledRejection", (err) => {
  console.log(`💥 ${err.message}`.red);
  server.close(() => process.exit(1));
});
