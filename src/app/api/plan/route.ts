import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

import { PlanInputSchema, MealPlanSchema } from "@/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
  const json = await request.json();
  const household = PlanInputSchema.parse(json);

  const result = streamObject({
    model: openai("gpt-4o"),
    schema: MealPlanSchema,
    system: `You are a meal planning expert for shared student households.
Generate a 7-day dinner plan that satisfies all roommate restrictions simultaneously.
Keep the plan budget-aware, student-friendly, and cohesive for one shared grocery run.
Prioritize dinners that feel appealing to the whole house, not separate meals per person.
Return exactly 7 dinners and a consolidated grocery list.`,
    prompt: JSON.stringify({
      task: "Generate a weekly shared-house dinner plan.",
      household,
      requirements: {
        dinners: 7,
        servingsPerMeal: household.roommates.length,
        groceryCategories: ["Produce", "Protein", "Dairy/Alt", "Pantry", "Frozen"],
        includeBudgetStatus:
          "Use Under, On Track, or Over based on the household budget and explain why in budgetNote.",
        style:
          "Meals should be realistic for students, avoid conflicts with dislikes, and balance cuisines through the week.",
      },
    }),
  });

  return result.toTextStreamResponse();
}
