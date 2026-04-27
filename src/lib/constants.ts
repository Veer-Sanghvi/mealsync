export const RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
  "No Pork",
  "No Beef",
] as const;

export const CUISINES = [
  { name: "Italian", emoji: "🇮🇹" },
  { name: "Mexican", emoji: "🇲🇽" },
  { name: "Asian", emoji: "🥢" },
  { name: "Mediterranean", emoji: "🫒" },
  { name: "American", emoji: "🇺🇸" },
  { name: "Indian", emoji: "🇮🇳" },
  { name: "Middle Eastern", emoji: "🥙" },
  { name: "Korean", emoji: "🇰🇷" },
  { name: "Thai", emoji: "🇹🇭" },
] as const;

export const SKILL_LEVELS = [
  {
    value: "Quick and Easy",
    detail: "Under 30 minutes and weeknight friendly.",
  },
  {
    value: "Moderate",
    detail: "Balanced prep with 30 to 60 minute dinners.",
  },
  {
    value: "Adventurous",
    detail: "Bigger flavors and a little more effort.",
  },
] as const;

export const GROCERY_CATEGORIES = [
  "Produce",
  "Protein",
  "Dairy/Alt",
  "Pantry",
  "Frozen",
] as const;

export const ROOMMATE_COLORS = [
  "#2D6A4F",
  "#E07A5F",
  "#D9A441",
  "#5D8577",
  "#C96A4A",
  "#7B5E57",
] as const;

export const DEFAULT_DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
