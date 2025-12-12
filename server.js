// server.js
// يتطلب Node.js 18+ (يوجد fetch مدمج). لو نسخة أقدم، ثبّت node-fetch أو استخدم axios.
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// إعدادات عبر متغيرات البيئة
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
// يمكنك تعديل الـ endpoint أو جعله من متغير بيئة إذا اختلف
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || "https://api.openrouter.ai/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "mistral"; // مثال - عدّله حسب ما تريد

if (!OPENROUTER_API_KEY) {
  console.error("ERROR: ضع OPENROUTER_API_KEY في متغيرات البيئة.");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body; // نتوقع مصفوفة رسائل مشابهة لـ [{role:"user", content:"..."}]
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages (array) required in request body" });
    }

    // بناء الطلب إلى OpenRouter
    const payload = {
      model: MODEL,
      messages: messages,
      // يمكنك إضافة إعدادات أخرى هنا مثل temperature, max_tokens...
      temperature: 0.2,
      max_tokens: 800
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      return res.status(502).json({ error: "OpenRouter API error", details: text });
    }

    const data = await response.json();
    // بناء استجابة مبسطة للفرونتند
    // تفقد بنية الـ data حسب المستجيب من OpenRouter، هنا قد يكون result.choices[0].message.content
    const reply = data?.choices?.[0]?.message?.content ?? data;
    return res.json({ ok: true, raw: data, reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error", details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
