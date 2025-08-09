export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea, story } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Content idea is required" });
  }

  try {
    const prompt = `
You are an expert social media content creator.

Main Task:
Generate 5 unique, engaging social media posts based on the content idea:
"${idea}"
${story ? `\nInclude this personal story (Pain → Turning Point → Freedom): ${story}` : ""}

Follow these RULES:
1. Use simple English.
2. Create engaging notes.
3. Suggest a virtual idea with each note.
4. Align with user's profile and ideas.
5. Use engaging hooks in first line.
6. Produce 5 posts with different hooks and structures.
7. Mix between provided templates and your own creative ones.

Templates from Post Pack 1:
[It's not [X] it's [Y], I used to think..., [X] would have you believe that, I hate it when..., [X] think that... But [Y] know that..., Bad [X] do [Y], good [X] do [Z], It's OK to do..., The more you [good thing], the less you [bad thing], Beginners do [X], intermediates do [Y], experts do [Z], Good [X] do [Y], great [X] do [Z], Using dialogues, Real talk..., Stop [X], Start [Y], [X] is [Y] disguised as [Z], You were not born for [X]].

Templates from Post Pack 2:
[unpopular_opinion, dont_do_this_do_that, the_best_something, dont_need_you_need, unspoken_truth, life_hack, compelling_story, complaint, beginner_mistakes, comparison, numbered_list, challenge, transformation, hidden_truth].

Output Format:
Numbered list of 5 posts, each with Hook + Body + Call-to-action.
    `;

    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-qwen-14b:free",
        messages: [
          { role: "system", content: "You are a helpful AI that writes high-quality social media posts." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await apiRes.json();
    const output = data?.choices?.[0]?.message?.content || "";

    const posts = output.split(/\n\d+\.\s*/).filter(Boolean).map(p => p.trim());

    res.status(200).json({ posts });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
