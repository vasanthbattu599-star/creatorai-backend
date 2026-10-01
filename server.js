import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const port = process.env.PORT || 3000;

app.get("/", (_req,res) => res.json({ok:true, service:"CreatorAI backend"}));

app.post("/api/script", async (req,res) => {
  try {const { topic, language = "English", type = "Long Video" } = req.body || {};
    if (!topic) return res.status(400).json({error:"topic is required"});
    const prompt = `You are a YouTube content assistant. Create an original ${type} plan for "${topic}" in ${language}. Return 3 title options, a strong first-10-second hook, a complete engaging script, a short description, 8 relevant hashtags, and a natural subscribe CTA. Do not promise views/subscribers or fabricate facts.`;
    const response = await ai.models.generateContent({
      model:"gemini-3.8-flash",
      contents:prompt
    });
    res.json({ok:true, output:response.text});
  } catch (err) {
    res.status(500).json({error:"Gemini request failed", details:String(err.message || err)});
  }
});

app.listen(port, () => console.log(`CreatorAI backend running on ${port}`));
