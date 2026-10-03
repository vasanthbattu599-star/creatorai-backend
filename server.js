import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const port = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
// AI script route
app.post("/api/script", async (req, res) => {
  try {
    const topic = req.body?.topic;
    const language = req.body?.language || "English";
    const type = req.body?.type || "Long Video";

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({
        error: "topic is required"
      });
    }

    const prompt = `
You are a YouTube content assistant.

Create an original ${type} script about:
${topic}

Language: ${language}

Make it engaging, natural and easy to understand.
Do not copy existing content.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt
    });

    res.json({
      ok: true,
      output: response.text
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Gemini request failed",
      details: String(err.message || err)
    });
  }
});

app.listen(port, () => {
  console.log(`CreatorAI backend running on ${port}`);
});
