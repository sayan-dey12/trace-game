// Load env FIRST before anything imports them
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import trackRouter from "./routes/track";
import uploadRouter from "./routes/upload";
import adminRouter from "./routes/admin";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// folder for uploaded files (local temp)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api/track", trackRouter);
app.use("/api/upload-photo", uploadRouter);
app.use("/admin", adminRouter);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
