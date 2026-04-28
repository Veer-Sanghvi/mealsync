"use client";

import { useEffect, useMemo, useState } from "react";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, Copy, Printer, Sparkles, Trash2 } from "lucide-react";

import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeaturedWithImageOnRight } from "@/components/ui/featured-with-image-on-right";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { Input } from "@/components/ui/input";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Skeleton } from "@/components/ui/skeleton";
import { TextReveal } from "@/components/ui/text-reveal";
import { Textarea } from "@/components/ui/textarea";
import { TiltedCard } from "@/components/ui/tilted-card";
import {
  CUISINES,
  DEFAULT_DAY_NAMES,
  GROCERY_CATEGORIES,
  ROOMMATE_COLORS,
  RESTRICTIONS,
  SKILL_LEVELS,
} from "@/lib/constants";
import {
  MealPlanSchema,
  type MealDay,
  type MealPlan,
  type PlanInput,
  type Restriction,
  type RoommateInput,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RoommateCardData = RoommateInput & {
  id: string;
  color: string;
};

type GroceryOpenState = Record<string, boolean>;

const demoRoommates: RoommateCardData[] = [
  {
    id: "demo-asha",
    name: "Asha",
    dietaryRestrictions: ["Vegan", "Nut-Free"],
    foodDislikes: "eggplant, olives",
    color: ROOMMATE_COLORS[0],
  },
  {
    id: "demo-leo",
    name: "Leo",
    dietaryRestrictions: ["Gluten-Free", "Dairy-Free"],
    foodDislikes: "mushrooms",
    color: ROOMMATE_COLORS[1],
  },
  {
    id: "demo-samir",
    name: "Samir",
    dietaryRestrictions: ["Halal", "No Beef"],
    foodDislikes: "raw onions",
    color: ROOMMATE_COLORS[2],
  },
];

const restrictionTone: Record<Restriction, string> = {
  Vegetarian: "bg-emerald-100 text-emerald-900",
  Vegan: "bg-lime-100 text-lime-900",
  "Gluten-Free": "bg-amber-100 text-amber-900",
  "Dairy-Free": "bg-sky-100 text-sky-900",
  "Nut-Free": "bg-orange-100 text-orange-900",
  Halal: "bg-violet-100 text-violet-900",
  Kosher: "bg-indigo-100 text-indigo-900",
  "No Pork": "bg-rose-100 text-rose-900",
  "No Beef": "bg-red-100 text-red-900",
};

type ConfettiPiece = {
  id: number;
  left: number;
  color: string;
  drift: number;
  delay: number;
};

export function MealSyncApp() {
  const [roommates, setRoommates] = useState<RoommateCardData[]>([]);
  const [name, setName] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState<Restriction[]>(
    [],
  );
  const [budget, setBudget] = useState("145");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    "Mediterranean",
    "Indian",
  ]);
  const [skillLevel, setSkillLevel] = useState<PlanInput["cookingSkillLevel"]>(
    "Moderate",
  );
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [groceryOpen, setGroceryOpen] = useState<GroceryOpenState>({
    Produce: true,
    Protein: true,
    "Dairy/Alt": true,
    Pantry: true,
    Frozen: true,
  });
  const [splitOpen, setSplitOpen] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [swapLoadingDay, setSwapLoadingDay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    object,
    submit,
    isLoading,
    error,
    clear,
  } = useObject<typeof MealPlanSchema, MealPlan, PlanInput>({
    api: "/api/plan",
    schema: MealPlanSchema,
    onFinish: ({ object: finalObject }) => {
      if (!finalObject) return;
      setGeneratedPlan(finalObject);
      burstConfetti();
    },
  });

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!confetti.length) return;
    const timeout = window.setTimeout(() => setConfetti([]), 2400);
    return () => window.clearTimeout(timeout);
  }, [confetti]);

  const planPreview = (generatedPlan ?? object) as Partial<MealPlan> | null;
  const weekPlan = planPreview?.weekPlan ?? [];
  const groupedGroceries = useMemo(() => {
    const seeded = Object.fromEntries(
      GROCERY_CATEGORIES.map((category) => [category, [] as MealPlan["groceryList"]]),
    ) as Record<(typeof GROCERY_CATEGORIES)[number], MealPlan["groceryList"]>;

    for (const item of planPreview?.groceryList ?? []) {
      if (!item?.category) continue;
      seeded[item.category].push(item);
    }
    return seeded;
  }, [planPreview?.groceryList]);

  const householdPayload = useMemo<PlanInput | null>(() => {
    const parsedBudget = Number(budget);
    if (!roommates.length || Number.isNaN(parsedBudget) || parsedBudget <= 0) {
      return null;
    }

    return {
      roommates: roommates.map((roommate) => ({
        name: roommate.name,
        dietaryRestrictions: roommate.dietaryRestrictions,
        foodDislikes: roommate.foodDislikes,
      })),
      budget: parsedBudget,
      cuisinePreferences: selectedCuisines,
      cookingSkillLevel: skillLevel,
    };
  }, [budget, roommates, selectedCuisines, skillLevel]);

  function burstConfetti() {
    setConfetti(
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        color: ["#2D6A4F", "#E07A5F", "#D9A441", "#5D8577"][index % 4],
        drift: (Math.random() - 0.5) * 220,
        delay: Math.random() * 260,
      })),
    );
  }

  function handleRestrictionToggle(value: Restriction) {
    setSelectedRestrictions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function resetForm() {
    setName("");
    setDislikes("");
    setSelectedRestrictions([]);
  }

  function handleAddRoommate() {
    if (!name.trim()) return;
    if (roommates.length >= 6) return;

    setRoommates((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        dietaryRestrictions: selectedRestrictions,
        foodDislikes: dislikes.trim(),
        color: ROOMMATE_COLORS[current.length % ROOMMATE_COLORS.length],
      },
    ]);
    resetForm();
  }

  function handleDeleteRoommate(id: string) {
    setRoommates((current) => current.filter((roommate) => roommate.id !== id));
  }

  function toggleCuisine(value: string) {
    setSelectedCuisines((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      if (current.length >= 3) return current;
      return [...current, value];
    });
  }

  function handleGenerate(payload = householdPayload) {
    if (!payload) return;
    setGeneratedPlan(null);
    setExpandedDay(null);
    setCheckedItems({});
    clear();
    submit(payload);
  }

  function handleDemoHouse() {
    const payload: PlanInput = {
      roommates: demoRoommates.map((roommate) => ({
        name: roommate.name,
        dietaryRestrictions: roommate.dietaryRestrictions,
        foodDislikes: roommate.foodDislikes,
      })),
      budget: 145,
      cuisinePreferences: ["Mediterranean", "Indian", "Thai"],
      cookingSkillLevel: "Moderate",
    };

    setRoommates(demoRoommates);
    setBudget("145");
    setSelectedCuisines(payload.cuisinePreferences);
    setSkillLevel("Moderate");
    handleGenerate(payload);
  }

  async function handleSwapMeal(day: MealDay) {
    if (!householdPayload) return;
    setSwapLoadingDay(day.dayName);

    try {
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          household: householdPayload,
          dayName: day.dayName,
          currentMealName: day.mealName,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to swap that meal right now.");
      }

      const replacement = (await response.json()) as MealDay;
      setGeneratedPlan((current) => {
        const source = current ?? (planPreview as MealPlan | null);
        if (!source) return current;
        return {
          ...source,
          weekPlan: source.weekPlan.map((meal) =>
            meal.dayName === day.dayName ? replacement : meal,
          ),
        };
      });
    } catch (swapError) {
      console.error(swapError);
    } finally {
      setSwapLoadingDay(null);
    }
  }

  async function handleCopyList() {
    if (!planPreview?.groceryList?.length) return;
    const lines = [
      "MealSync Grocery List",
      ...GROCERY_CATEGORIES.flatMap((category) => {
        const items = groupedGroceries[category];
        if (!items.length) return [];
        return [
          "",
          category,
          ...items.map(
            (item) =>
              `- ${item.item}: ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`,
          ),
        ];
      }),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
  }

  function budgetTone(status?: MealPlan["budgetStatus"]) {
    if (status === "Under") return "text-emerald-700";
    if (status === "Over") return "text-red-600";
    return "text-amber-600";
  }

  const perPersonCost =
    generatedPlan?.totalEstimatedCost && roommates.length
      ? generatedPlan.totalEstimatedCost / roommates.length
      : 0;

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={
              {
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}ms`,
                "--confetti-drift": `${piece.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-6 md:px-8">
        <FloatingNavbar
          items={[
            { label: "Setup", href: "#setup" },
            { label: "Calendar", href: "#calendar" },
            { label: "Groceries", href: "#groceries" },
          ]}
        />

        <section
          id="hero"
          className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 px-6 py-8 shadow-[0_22px_70px_rgba(54,43,31,0.12)] backdrop-blur md:px-8 md:py-10"
        >
          <BackgroundBeams />
          <FeaturedWithImageOnRight
            content={
              <div className="relative z-10 space-y-6">
                <Badge className="rounded-full bg-emerald-100 px-4 py-1 text-emerald-900">
                  <AnimatedGradientText className="text-xs font-semibold uppercase tracking-[0.26em]">
                    MealSync • Shared-House AI Meal Planning
                  </AnimatedGradientText>
                </Badge>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-stone-900 sm:text-5xl lg:text-6xl">
                    One weekly plan. Zero roommate food chaos.
                  </h1>
                  <TextReveal
                    className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg"
                    text="Balance conflicting dietary restrictions, keep the weekly grocery run under budget, and generate one shared dinner plan the whole house can actually cook."
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-[#E07A5F] text-white hover:bg-[#cf6a50] font-semibold px-6 py-3 rounded-full"
                    onClick={handleDemoHouse}
                  >
                    Demo House
                  </Button>
                  <ShimmerButton
                    className="bg-[#2D6A4F] text-white hover:bg-[#245a42] font-semibold px-6 py-3 rounded-full"
                    onClick={() => handleGenerate()}
                    disabled={!householdPayload || isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate Meal Plan"}
                  </ShimmerButton>
                </div>
              </div>
            }
            visual={
              <motion.div
                className="relative z-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {[
                  "Up to 6 roommates",
                  "7 nights",
                  "Shared list",
                ].map((stat) => (
                  <motion.div
                    key={stat}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="relative overflow-hidden rounded-[1.6rem] border-white/60 bg-[#fffaf4]/90">
                      <BorderBeam />
                      <CardContent className="p-5">
                        <p className="text-sm uppercase tracking-[0.22em] text-stone-500">
                          Household stat
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-stone-900">
                          {stat}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            }
          />
        </section>

        <BlurFade id="setup" className="mt-8">
          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(54,43,31,0.10)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Household Setup
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-stone-900">
                  Build the house profile.
                </h2>
              </div>
              <Badge className="rounded-full bg-stone-100 px-4 py-1 text-stone-600">
                {roommates.length} / 6 roommates
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9]">
                <CardContent className="space-y-4 p-5">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Roommate name"
                  />
                  <Textarea
                    value={dislikes}
                    onChange={(event) => setDislikes(event.target.value)}
                    placeholder="Food dislikes (mushrooms, olives, raw onion...)"
                    className="min-h-24"
                  />
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-stone-700">
                      Dietary restrictions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {RESTRICTIONS.map((restriction) => {
                        const active = selectedRestrictions.includes(restriction);
                        return (
                          <motion.button
                            key={restriction}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            type="button"
                            onClick={() => handleRestrictionToggle(restriction)}
                            className={cn(
                              "rounded-full border px-3 py-2 text-sm font-medium transition",
                              active
                                ? "border-emerald-800 bg-emerald-900 text-white"
                                : "border-stone-200 bg-white text-stone-700 hover:border-stone-400",
                            )}
                          >
                            {restriction}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    className="rounded-full bg-stone-900 px-5 text-white hover:bg-stone-700"
                    onClick={handleAddRoommate}
                    disabled={!name.trim() || roommates.length >= 6}
                  >
                    Add Roommate
                  </Button>
                </CardContent>
              </Card>

              <LayoutGroup>
                <div className="grid gap-3">
                  <AnimatePresence>
                    {roommates.length ? (
                      roommates.map((roommate) => (
                        <motion.div
                          key={roommate.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <TiltedCard>
                            <Card className="rounded-[1.6rem] border-white/60 bg-white">
                              <CardContent className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
                                      style={{ backgroundColor: roommate.color }}
                                    >
                                      {roommate.name.slice(0, 1)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-stone-900">
                                        {roommate.name}
                                      </p>
                                      <p className="text-sm text-stone-500">
                                        {roommate.foodDislikes || "No dislikes noted"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full"
                                    onClick={() => handleDeleteRoommate(roommate.id)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {roommate.dietaryRestrictions.length ? (
                                    roommate.dietaryRestrictions.map((restriction) => (
                                      <span
                                        key={restriction}
                                        className={cn(
                                          "rounded-full px-3 py-1 text-xs font-semibold",
                                          restrictionTone[restriction],
                                        )}
                                      >
                                        {restriction}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                                      Flexible eater
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </TiltedCard>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-stone-500"
                      >
                        Add roommates or click Demo House to see the full experience.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9] lg:col-span-1">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-stone-700">
                      Weekly grocery budget
                    </p>
                    <Input
                      type="number"
                      min="1"
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      placeholder="145"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700">
                      Cooking skill level
                    </p>
                    <div className="mt-3 grid gap-2">
                      {SKILL_LEVELS.map((option) => {
                        const active = skillLevel === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSkillLevel(option.value)}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-left transition",
                              active
                                ? "border-[#E07A5F] bg-[#fff1ea]"
                                : "border-stone-200 bg-white",
                            )}
                          >
                            <p className="font-semibold text-stone-900">
                              {option.value}
                            </p>
                            <p className="text-sm text-stone-500">{option.detail}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9] lg:col-span-2">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-700">
                        Cuisine favorites
                      </p>
                      <p className="text-sm text-stone-500">
                        Pick up to 3 for the week.
                      </p>
                    </div>
                    <Badge className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">
                      {selectedCuisines.length} / 3 selected
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {CUISINES.map((cuisine) => {
                      const active = selectedCuisines.includes(cuisine.name);
                      return (
                        <button
                          key={cuisine.name}
                          type="button"
                          onClick={() => toggleCuisine(cuisine.name)}
                          className={cn(
                            "rounded-[1.35rem] border px-4 py-4 text-left transition",
                            active
                              ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-400",
                          )}
                        >
                          <p className="text-2xl">{cuisine.emoji}</p>
                          <p className="mt-2 font-semibold">{cuisine.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </BlurFade>

        <BlurFade id="calendar" className="mt-8" delay={0.04}>
          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(54,43,31,0.10)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Meal Calendar
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-stone-900">
                  Watch the week stream in.
                </h2>
              </div>
              {error ? (
                <p className="text-sm text-red-600">{error.message}</p>
              ) : (
                <p className="text-sm text-stone-500">
                  Click a card to expand the full description.
                </p>
              )}
            </div>

            <ScrollArea className="mt-6 w-full whitespace-nowrap">
              <motion.div
                className="flex gap-4 pb-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
              >
                {DEFAULT_DAY_NAMES.map((fallbackDay, index) => {
                  const meal = weekPlan[index];
                  if (!meal && isLoading) {
                    return (
                      <motion.div
                        key={fallbackDay}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        <Card className="flex h-[18rem] w-[21rem] rounded-[1.6rem] border-white/60 bg-[#fffdf9]">
                          <CardContent className="flex w-full flex-col gap-4 p-5">
                            <Skeleton className="h-4 w-20 rounded-full" />
                            <Skeleton className="h-8 w-48 rounded-2xl" />
                            <Skeleton className="h-4 w-24 rounded-full" />
                            <div className="mt-2 flex gap-2">
                              <Skeleton className="h-7 w-20 rounded-full" />
                              <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                            <div className="mt-auto space-y-2">
                              <Skeleton className="h-4 w-full rounded-full" />
                              <Skeleton className="h-4 w-5/6 rounded-full" />
                              <Skeleton className="h-10 w-32 rounded-full" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  }

                  if (!meal) {
                    return (
                      <div
                        key={fallbackDay}
                        className="flex h-[18rem] w-[21rem] items-center justify-center rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50 px-5 text-center text-stone-500"
                      >
                        Generate a plan to fill all 7 nights.
                      </div>
                    );
                  }

                  const expanded = expandedDay === meal.dayName;
                  return (
                    <motion.div
                      key={meal.dayName}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <Card
                        className="flex h-auto w-[21rem] cursor-pointer rounded-[1.6rem] border-white/60 bg-[#fffdf9]"
                        onClick={() =>
                          setExpandedDay(expanded ? null : meal.dayName)
                        }
                      >
                        <CardContent className="flex h-full flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
                                {meal.dayName}
                              </p>
                              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-stone-900">
                                {meal.mealName}
                              </h3>
                            </div>
                            <div className="rounded-2xl bg-stone-100 px-3 py-2 text-2xl">
                              {meal.cuisineEmoji}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {meal.dietaryTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-500">
                            <span>${meal.estimatedCost.toFixed(2)}</span>
                            <span>{meal.prepTime}</span>
                            <span>{meal.servings} servings</span>
                          </div>

                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="mt-4 leading-7 text-stone-600">
                                  {meal.description}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="mt-5 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSwapMeal(meal);
                              }}
                              disabled={swapLoadingDay === meal.dayName || !generatedPlan}
                            >
                              {swapLoadingDay === meal.dayName
                                ? "Swapping..."
                                : "Swap This Meal"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        </BlurFade>

        <BlurFade id="groceries" className="mt-8" delay={0.08}>
          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(54,43,31,0.10)] backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Grocery List
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-stone-900">
                  One shared list for the whole house.
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleCopyList}
                  disabled={!planPreview?.groceryList?.length}
                >
                  {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                  {copied ? "Copied" : "Copy List"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setSplitOpen(true)}
                  disabled={!generatedPlan}
                >
                  Split Cost
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => window.print()}
                  disabled={!generatedPlan}
                >
                  <Printer className="mr-2 size-4" />
                  Print Week
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-4">
                <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9]">
                  <CardContent className="space-y-3 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
                      Running total
                    </p>
                    <div className="text-4xl font-black tracking-[-0.05em] text-stone-900">
                      <NumberTicker
                        prefix="$"
                        decimals={2}
                        value={planPreview?.totalEstimatedCost ?? 0}
                      />
                    </div>
                    <p className={cn("text-sm font-medium", budgetTone(planPreview?.budgetStatus))}>
                      {planPreview?.budgetStatus ?? "On Track"}
                    </p>
                    <p className="text-sm leading-6 text-stone-500">
                      {planPreview?.budgetNote ??
                        "Generate a plan to compare the weekly grocery total against your shared budget."}
                    </p>
                    <Separator />
                    <p className="text-sm leading-6 text-stone-600">
                      <Sparkles className="mr-2 inline size-4 text-[#E07A5F]" />
                      {planPreview?.mealPrepTip ??
                        "A prep tip for the full week will appear here once meals start streaming in."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9]">
                  <CardContent className="p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
                      Cost overview
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Budget", value: `$${Number(budget || 0).toFixed(0)}` },
                        { label: "Roommates", value: `${roommates.length || 0}` },
                        {
                          label: "Per person",
                          value: roommates.length && generatedPlan
                            ? `$${perPersonCost.toFixed(2)}`
                            : "--",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl bg-stone-100 px-4 py-4 text-center"
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            {item.label}
                          </p>
                          <p className="mt-2 text-xl font-bold text-stone-900">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[1.6rem] border-white/60 bg-[#fffdf9]">
                <CardContent className="p-5">
                  {!planPreview?.groceryList?.length && !isLoading ? (
                    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-14 text-center text-stone-500">
                      Generate a plan to build your consolidated grocery list.
                    </div>
                  ) : (
                    <AnimatedList>
                      {GROCERY_CATEGORIES.map((category) => {
                        const items = groupedGroceries[category];
                        if (!items.length && !isLoading) return null;
                        return (
                          <AnimatedListItem key={category}>
                            <div className="overflow-hidden rounded-[1.4rem] border border-stone-200">
                              <button
                                type="button"
                                onClick={() =>
                                  setGroceryOpen((current) => ({
                                    ...current,
                                    [category]: !current[category],
                                  }))
                                }
                                className="flex w-full items-center justify-between bg-stone-50 px-4 py-4 text-left"
                              >
                                <span className="font-semibold text-stone-900">
                                  {category}
                                </span>
                                <span className="text-sm text-stone-500">
                                  {items.length ? `${items.length} items` : isLoading ? "Streaming..." : "0 items"}
                                </span>
                              </button>
                              <AnimatePresence initial={false}>
                                {groceryOpen[category] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-2 px-4 py-4">
                                      {items.length ? (
                                        items.map((item, index) => {
                                          const itemKey = `${category}-${item.item}-${index}`;
                                          const checked = checkedItems[itemKey];
                                          return (
                                            <label
                                              key={itemKey}
                                              className="flex items-center justify-between gap-3 rounded-2xl border border-stone-100 px-3 py-3"
                                            >
                                              <div className="flex items-center gap-3">
                                                <input
                                                  type="checkbox"
                                                  checked={checked ?? false}
                                                  onChange={(event) =>
                                                    setCheckedItems((current) => ({
                                                      ...current,
                                                      [itemKey]: event.target.checked,
                                                    }))
                                                  }
                                                  className="size-4 accent-[#2D6A4F]"
                                                />
                                                <div>
                                                  <p
                                                    className={cn(
                                                      "font-medium text-stone-900",
                                                      checked && "text-stone-400 line-through",
                                                    )}
                                                  >
                                                    {item.item}
                                                  </p>
                                                  <p className="text-sm text-stone-500">
                                                    {item.quantity}
                                                    {item.unit ? ` ${item.unit}` : ""}
                                                  </p>
                                                </div>
                                              </div>
                                              <span className="text-sm font-semibold text-stone-700">
                                                ${item.estimatedCost.toFixed(2)}
                                              </span>
                                            </label>
                                          );
                                        })
                                      ) : (
                                        <div className="space-y-2">
                                          <Skeleton className="h-12 rounded-2xl" />
                                          <Skeleton className="h-12 rounded-2xl" />
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </AnimatedListItem>
                        );
                      })}
                    </AnimatedList>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </BlurFade>
      </main>

      <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
        <DialogContent className="rounded-[1.8rem] border-white/60 bg-[#fffdf9]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-[-0.04em] text-stone-900">
              Fair cost split
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {roommates.map((roommate) => (
              <div
                key={roommate.id}
                className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-stone-900">{roommate.name}</p>
                  <p className="text-sm text-stone-500">
                    {roommate.dietaryRestrictions.join(", ") || "No special restrictions"}
                  </p>
                </div>
                <p className="text-lg font-bold text-stone-900">
                  ${perPersonCost.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
