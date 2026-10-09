import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "CreatorAI backend running"
  });
});

app.post("/api/script", async (req, res) => {
  try {
    const { topic, language = "English",
      type = "Long Video" } = req.body;

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({
        ok: false,
        error: "Topic is required"
      });
    }

    if (!genAI) {
      return res.status(500).json({
        ok: false,
        error: "GEMINI_API_KEY is missing"
      });
    }

    const prompt = `
Create an original YouTube ${type} script.
Topic: ${topic}
Language: ${language}
Include a strong hook, useful information,
and a clear ending. Do not copy existing content.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);

    res.json({
      ok: true,
      output: result.response.text()
    });

  } catch (err) {
    console.error("Script error:", err);

    res.status(500).json({
      ok: false,
      error: "Script generation failed",
      details: String(err.message || err)
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CreatorAI running on port ${PORT}`);
});
