import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { MealDaySchema, SwapMealRequestSchema } from "@/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
  const json = await request.json();
  const payload = SwapMealRequestSchema.parse(json);

  const result = await generateObject({
    model: openai("gpt-4o"),
    schema: MealDaySchema,
    system: `You are a meal planning expert for shared student households.
Generate exactly one replacement dinner that still satisfies all dietary restrictions and fits the same general budget and skill level.`,
    prompt: JSON.stringify({
      task: "Swap one dinner without regenerating the rest of the week.",
      payload,
    }),
  });

  return Response.json(result.object);
}
