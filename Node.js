import fetch from "node-fetch"; // فقط إذا نسخة Node <18
// إذا Node >=18، fetch مدمج تلقائيًا

const run = async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer <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>',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API error:", text);
      return;
    }

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
};

run();

app.get("/", (req, res) => {
  res.send("Server is running! Use POST /api/chat to send messages.");
});
