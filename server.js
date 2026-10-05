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

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/script", async (req, res) => {
  try {
    const topic = req.body.topic;
    const language = req.body.language || "English";
    const type = req.body.type || "Long Video";

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    const prompt = `
You are a YouTube content assistant.

Create an original ${type} script about:
${topic}

Language: ${language}

Make it engaging, natural and easy to understand.
Do not copy existing content.
Include a strong hook, useful information and a clear ending.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const output = response.text();

    res.json({
      ok: true,
      output: output
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
  console.log(`CreatorAI backend running on port ${port}`);
});
