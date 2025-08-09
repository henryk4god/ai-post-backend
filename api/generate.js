export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all domains (or replace * with your domain)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea, story } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Content idea is required" });
  }

  try {
    // ✅ Master Prompt with Rules + Templates
    const prompt = `
You are an expert social media content creator.

MAIN TASK:
Generate 5 unique, high-converting, and engaging social media posts based on this content idea:
"${idea}"

${story ? `Include this personal story, written from PAIN → TURNING POINT → FREEDOM: ${story}` : ""}

RULES:
1. Use simple, conversational English.
2. Each post must be scroll-stopping in the first line (hook).
3. Format each post as: Hook → Body → Call-to-action.
4. Avoid generic advice — make it personal and relatable.
5. Inject curiosity so readers want to learn more.
6. Use storytelling when relevant.
7. Output in a numbered list (1–5).

TEMPLATES FROM POST PACK 1:
It's not [X], it's [Y].
I used to think [X], but now I know [Y].
[X] would have you believe that [Y].
I hate it when [X].
[X] think that..., but [Y] know that...
Bad [X] do [Y], good [X] do [Z].
It's OK to do [X].
The more you [good thing], the less you [bad thing].
Beginners do [X], intermediates do [Y], experts do [Z].
Using dialogues for impact.
Real talk: [X].
Stop [X], Start [Y].
[X] is [Y] disguised as [Z].
You were not born for [X].

TEMPLATES FROM POST PACK 2:
unpopular_opinion, dont_do_this_do_that, the_best_something, dont_need_you_need,
unspoken_truth, life_hack, compelling_story, complaint, beginner_mistakes, comparison,
numbered_list, challenge, transformation, hidden_truth.

OUTPUT:
- Return exactly 5 posts.
- Each post should start with its number (1., 2., etc.).
- Do not add explanations — only the posts.
    `;

    // ✅ Call OpenRouter API
    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // Keep secret in Vercel
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-30b-a3b:free",
        messages: [
          { role: "system", content: "You are a helpful AI that writes high-quality, engaging social media posts." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await apiRes.json();

    if (!data?.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "No response from AI model" });
    }

    // ✅ Split into numbered posts
    const output = data.choices[0].message.content;
    const posts = output.split(/\n\d+\.\s*/).filter(Boolean).map(p => p.trim());

    res.status(200).json({ posts });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
