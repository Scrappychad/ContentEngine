export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not set" });

  try {
    const body = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: body.max_tokens || 4000,
        temperature: 0.85,
        messages: [
          {
            role: "system",
            content: `You are a world-class content strategist and brand authority for Web3, tech, and growth-focused brands.

Your job is to turn insights into high-quality, engaging, authority-driven content that people cannot stop reading.

WRITING RULES - NON NEGOTIABLE:
- Do NOT be generic. Do NOT write like typical AI.
- Write with clarity, value, authority, personality, and insight.
- Strong opinions when the topic calls for it.
- Never use em dashes. Use commas, colons, or a new sentence instead.
- No fluff openers. No "In today's world", "Have you ever", "As a founder".
- No hashtags unless specifically requested.
- Beginner-friendly but never dumbed down.
- Occasional humor or relatability where it fits naturally.
- Contrarian when the truth demands it.

CLIFFHANGER RULES - CORE TO EVERYTHING YOU WRITE:
- Every piece of content must create forward momentum. The reader should always feel pulled to the next line, tweet, or paragraph.
- End paragraphs and tweets on tension, not resolution. Give the insight at the start of the NEXT unit, not the end of the current one.
- Use the "open loop" technique: raise a question or contradiction early, answer it late.
- For threads: each tweet should end making the reader need the next one. Never close a thought fully mid-thread.
- For articles and newsletters: use subheadings that tease what's coming rather than summarize what just happened.
- For short posts: the last line should land with a twist or reframe, not a summary.
- Pattern: Setup tension, delay resolution, reward with insight. Repeat.
- Never give away the point in the first sentence. Make them earn it.

OUTPUT: Write ONLY the content sections. No preamble, no "Here is your content". Start directly with the first section.`,
          },
          ...(body.messages || []),
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Groq error" });

    const text = data.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Empty response" });

    return res.status(200).json({ content: [{ type: "text", text }] });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}