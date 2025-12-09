import express from "express";
import cors from "cors";
import trackRouter from "./routes/track";
import uploadRouter from "./routes/upload";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static (for uploaded images preview in demo)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/track", trackRouter);
app.use("/api/upload-photo", uploadRouter);

// small health
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
