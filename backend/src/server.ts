import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import trackRouter from "./routes/track";
import uploadRouter from "./routes/upload";
import adminRouter from "./routes/admin";   // ⭐ ADD THIS

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static folder for uploaded files (not used much, but ok)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ⭐ ROUTES
app.use("/api/track", trackRouter);
app.use("/api/upload-photo", uploadRouter);
app.use("/admin", adminRouter);             // ⭐ ADD THIS

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
