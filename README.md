# MealSync

MealSync is a Next.js App Router web app for shared student households. It uses the Vercel AI SDK to stream a 7-day dinner plan that satisfies multiple dietary restrictions at once, keeps an eye on the weekly grocery budget, and consolidates everything into one shopping list.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel AI SDK with `streamObject`
- Framer Motion
- shadcn/ui with local 21st-style UI primitives

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` with:

```bash
OPENAI_API_KEY=your_key_here
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add `OPENAI_API_KEY` in Vercel Environment Variables.
4. Deploy.
