// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ضع مفتاحك هنا بنفسك ↓↓↓
const OPENROUTER_API_KEY = "<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>";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o";

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("Server is running. Use POST /api/chat");
});

// API الرئيسي
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const payload = {
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 800,
    };

    let response;
    try {
      response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Fetch failed:", err);
      return res.status(500).json({
        error: "fetch failed",
        details: String(err),
      });
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", text);
      return res.status(502).json({
        error: "OpenRouter API error",
        details: text,
      });
    }

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content ?? data;
    return res.json({ ok: true, reply, raw: data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error", details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
