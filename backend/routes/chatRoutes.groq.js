import express from "express";
const router = express.Router();

const API_KEY = process.env.GROQ_API_KEY;
const MODEL  = process.env.GROQ_MODEL || "llama-3.2-3b-preview";

// Debug — prove which file is active
console.log("🔌 [GROQ] chat route loaded with model:", MODEL);
console.log("🔑 [GROQ] key present?", Boolean(API_KEY));
console.log("🔑 [GROQ] key length:", API_KEY ? API_KEY.length : 0);
console.log("📄 [GROQ] route file:", import.meta.url);

// quick health endpoint so we can verify which route is mounted
router.get("/_whoami", (req, res) => res.json({ route: "groq", model: MODEL }));

router.post("/", async (req, res) => {
  console.log("🚏 [GROQ] /api/chat hit", new Date().toISOString());
  console.log("🔑 [GROQ] API_KEY available:", Boolean(API_KEY));
  console.log("📝 [GROQ] Request body:", req.body);
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 256,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for an online e-book store. Recommend books by genre, author, or mood, and keep replies concise.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("Groq API error:", r.status, text);
      return res.status(502).json({ 
        error: "groq api error", 
        status: r.status, 
        body: text 
      });
    }

    const data = await r.json();
    return res.json({ reply: data?.choices?.[0]?.message?.content ?? "" });
  } catch (err) {
    console.error("Chat route error:", err);
    return res.status(500).json({ 
      error: "internal server error", 
      message: err.message 
    });
  }
});


export default router;
