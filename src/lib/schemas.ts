import { z } from "zod";

import { GROCERY_CATEGORIES, RESTRICTIONS } from "@/lib/constants";

export const RestrictionSchema = z.enum(RESTRICTIONS);

export const RoommateSchema = z.object({
  name: z.string().min(1).max(40),
  dietaryRestrictions: z.array(RestrictionSchema).max(9),
  foodDislikes: z.string().max(200).default(""),
});

export const PlanInputSchema = z.object({
  roommates: z.array(RoommateSchema).min(1).max(6),
  budget: z.number().positive(),
  cuisinePreferences: z.array(z.string()).max(3),
  cookingSkillLevel: z.enum(["Quick and Easy", "Moderate", "Adventurous"]),
});

export const MealDaySchema = z.object({
  dayName: z.string(),
  mealName: z.string(),
  description: z.string(),
  servings: z.number(),
  estimatedCost: z.number(),
  prepTime: z.string(),
  dietaryTags: z.array(z.string()),
  cuisineEmoji: z.string(),
});

export const MealPlanSchema = z.object({
  weekPlan: z.array(MealDaySchema).length(7),
  groceryList: z.array(
    z.object({
      item: z.string(),
      quantity: z.string(),
      unit: z.string(),
      estimatedCost: z.number(),
      category: z.enum(GROCERY_CATEGORIES),
    }),
  ),
  totalEstimatedCost: z.number(),
  budgetStatus: z.enum(["Under", "On Track", "Over"]),
  budgetNote: z.string(),
  mealPrepTip: z.string(),
});

export const SwapMealRequestSchema = z.object({
  household: PlanInputSchema,
  dayName: z.string(),
  currentMealName: z.string(),
});

export type Restriction = z.infer<typeof RestrictionSchema>;
export type RoommateInput = z.infer<typeof RoommateSchema>;
export type PlanInput = z.infer<typeof PlanInputSchema>;
export type MealDay = z.infer<typeof MealDaySchema>;
export type MealPlan = z.infer<typeof MealPlanSchema>;
