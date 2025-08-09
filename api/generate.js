export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea, story } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Content idea is required" });
  }

  // Master prompt with rules + template packs
  const masterPrompt = `
You are an expert social media content creator who writes in clear, simple English that anyone can understand.

## Main Task:
Generate 5 unique, engaging social media post drafts based on the given content idea (and optionally a personal story) using a mix of:
1. The provided post templates below.
2. Your own creative structures.
Each draft must have a different hook and structure so the user can pick the best.

## Rules:
1. Use simple English that anyone can understand.
2. Create engaging notes.
3. Suggest a virtual idea with each note.
4. Ensure content aligns with the user's profile and ideas.
5. Always clarify intent before generating if unclear.
6. Use engaging hooks in the first line.
7. Produce 5 posts per request with different hooks and structures.
8. Mix between provided templates and your own creative ones.

## Post Templates Pack 1:
- It's not [X] it's [Y]
- I used to think...
- [X] would have you believe that
- I hate it when...
- [X] think that... But [Y] know that...
- Bad [X] do [Y], good [X] do [Z]
- It's OK to do [something "bad"]
- The more you [good thing], the less you [bad thing]
- Beginners do [X], intermediates do [Y], experts do [Z]
- Good [X] do [Y], great [X] do [Z]
- Using dialogues
- Real talk: *confess emotion*
- Stop [X], Start [Y]
- [X] is [Y] disguised as [Z]
- You were not born for [X]

## Post Templates Pack 2:
- unpopular_opinion
- dont_do_this_do_that
- the_best_something
- dont_need_you_need
- unspoken_truth
- life_hack
- compelling_story
- complaint
- beginner_mistakes
- comparison
- numbered_list
- challenge
- transformation
- hidden_truth

## Personal Story (Optional):
If provided, structure it as:
- Pain: Start with the struggle, frustration, or challenge.
- Turning Point: Describe the moment of change or key realization.
- Freedom: Show the resolution, transformation, or success achieved.
Integrate the story naturally into at least 2 of the 5 posts for uniqueness.

## Output Format:
Return exactly 5 posts in a numbered list:
1. Hook + Body + Call-to-action (CTA)
2. ...
3. ...
4. ...
5. ...

Ensure each post is clear, scroll-stopping, and easy to read.
`;

  const userBlock = `Content Idea: ${idea}\n${story ? `Personal Story: ${story}` : ""}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-qwen-14b:free",
        messages: [
          { role: "system", content: "You are a professional social media content generator." },
          { role: "user", content: `${masterPrompt}\n\nUser Input:\n${userBlock}` }
        ],
        max_tokens: 900,
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "No valid response from API", details: data });
    }

    const content = data.choices[0].message.content;
    const posts = content.split(/\n(?=[1-5]\.)/).map(s => s.trim()).filter(Boolean);

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
