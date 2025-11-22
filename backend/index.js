// index.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ Correct import for ESM

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- CORS ----------------
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- MONGO CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ---------------- SCHEMA ----------------
const AuditSchema = new mongoose.Schema({
  filename: String,
  uploadDate: { type: Date, default: Date.now },
  rules: [String],
  results: Array,
});

const AuditLog = mongoose.model("AuditLog", AuditSchema);

// ---------------- MULTER ----------------
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- GEMINI ----------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------- ROUTES ----------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", db: mongoose.connection.readyState });
});

// PDF Audit
app.post("/api/audit", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const rules = JSON.parse(req.body.rules || "[]");
    if (!rules.length) return res.status(400).json({ error: "Rules required" });

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text) {
      return res.status(400).json({
        error: "Unable to extract text. PDF may be scanned.",
      });
    }

    // AI Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Prompts
    const systemPrompt = `
You are a compliance auditor. Return JSON ONLY in the shape:
{
  "results": [
    {
      "rule": "",
      "status": "PASS" | "FAIL",
      "evidence": "",
      "reasoning": "",
      "confidence": 0-100
    }
  ]
}`;

    const userPrompt = `
DOCUMENT:
${text.substring(0, 25000)}

RULES:
${JSON.stringify(rules)}
`;

    // Gemini Request
    const generated = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" },
    });

    const json = JSON.parse(generated.response.text());

    // Save in DB
    const audit = await AuditLog.create({
      filename: req.file.originalname,
      rules,
      results: json.results,
    });

    res.json({
      success: true,
      id: audit._id,
      results: json.results,
    });
  } catch (err) {
    console.error("❌ Audit Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get latest audits
app.get("/api/history", async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ uploadDate: -1 }).limit(10);
    res.json(logs);
  } catch (err) {
    console.error("❌ History Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});