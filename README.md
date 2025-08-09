# AI Post Backend

Backend API for generating social media posts using OpenRouter API.

## Deployment
1. Push this folder to a GitHub repo.
2. Connect the repo to Vercel.
3. In Vercel **Environment Variables**, add:
   - `OPENROUTER_API_KEY` = your key from OpenRouter
4. Deploy.

## Endpoint
POST https://<your-vercel-project>.vercel.app/api/generate

Body:
```json
{
  "idea": "Your content idea",
  "story": "Optional personal story"
}
