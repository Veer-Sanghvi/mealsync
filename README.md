# MealSync

MealSync is a single-page AI meal planner for shared student households. It helps roommates with different dietary restrictions agree on a 7-day dinner plan and one consolidated grocery list.

## How To Use

1. Open `index.html` in a browser.
2. Add roommates with their dietary restrictions and dislikes, or click `Demo House`.
3. Set the total weekly grocery budget, choose up to 3 cuisines, and pick a cooking skill level.
4. Click `Generate Meal Plan`.
5. Review the weekly calendar, swap meals if needed, and use the grocery list tools to copy, print, or split the cost.

## OpenAI Setup

At the top of the script in `index.html`, update:

```js
const MealSyncConfig = {
  openAIApiKey: "YOUR_OPENAI_API_KEY",
  model: "gpt-4o",
  useMockDataIfNoApiKey: true
};
```

If no API key is set and `useMockDataIfNoApiKey` is `true`, the app uses built-in demo data so the experience still works for judges and local previews.
