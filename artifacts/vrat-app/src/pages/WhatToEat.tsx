import { useState } from "react";
import { getVratsForDate, getNextVrat } from "@/data/vrats";
import type { Vrat } from "@/data/vrats";

function OmSymbol({ className = "" }: { className?: string }) {
  return <span className={`font-serif ${className}`} aria-hidden="true">ॐ</span>;
}

function FoodList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "allowed" | "avoided";
}) {
  const isAllowed = type === "allowed";
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${isAllowed ? "text-green-600" : "text-red-500"}`}>
          {isAllowed ? "✓" : "✗"}
        </span>
        <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-2.5 rounded-xl ${
              isAllowed
                ? "bg-green-50 border border-green-100"
                : "bg-red-50 border border-red-100"
            }`}
            data-testid={`food-${type}-${i}`}
          >
            <span
              className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                isAllowed
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {isAllowed ? "✓" : "✗"}
            </span>
            <span className="text-sm text-foreground leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealIdeasSection({ vrat }: { vrat: Vrat }) {
  return (
    <div className="vrat-card p-5 mb-4" data-testid="meal-ideas-section">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🍽</span>
        <h3 className="font-serif text-base font-semibold text-foreground">Meal Idea</h3>
      </div>
      <div className="bg-accent/40 rounded-2xl p-4">
        <p className="text-sm text-foreground leading-relaxed" data-testid="meal-idea-text">
          {vrat.mealIdea}
        </p>
      </div>
      <div className="mt-3 bg-muted/40 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground italic text-center">
          All vrat-friendly dishes use sendha namak (rock salt) and no onion or garlic.
          Your kitchen becomes your temple.
        </p>
      </div>
    </div>
  );
}

function VratFoodCard({ vrat }: { vrat: Vrat }) {
  return (
    <div data-testid={`vrat-food-card-${vrat.id}`}>
      <div className="saffron-gradient rounded-2xl p-4 mb-4 text-white">
        <p className="text-xs font-medium tracking-widest uppercase text-white/70 mb-1">Fasting Today</p>
        <h2 className="font-serif text-2xl font-bold">{vrat.name}</h2>
        <p className="text-white/80 text-sm mt-1">Deity: {vrat.deity}</p>
        <p className="text-white/70 text-xs mt-2 leading-relaxed">{vrat.description}</p>
      </div>

      <div className="vrat-card p-5 mb-4">
        <FoodList
          title="Foods Allowed"
          items={vrat.foodsAllowed}
          type="allowed"
        />
        <div className="h-px bg-border my-4" />
        <FoodList
          title="Foods to Avoid"
          items={vrat.foodsAvoided}
          type="avoided"
        />
      </div>

      <MealIdeasSection vrat={vrat} />
    </div>
  );
}

function NoFastToday({ nextVrat }: { nextVrat: { vrat: Vrat; date: string } | null }) {
  return (
    <div data-testid="no-fast-message">
      <div className="vrat-card p-6 mb-4 text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <OmSymbol className="text-primary text-2xl" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
          No fast today
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enjoy your meals with mindfulness and gratitude. Nourish your body as you would nourish your soul.
        </p>
      </div>

      {nextVrat && (
        <div className="vrat-card p-5 mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Prepare for Next Vrat
          </p>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            {nextVrat.vrat.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deity: {nextVrat.vrat.deity}
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Foods you'll need:</p>
            {nextVrat.vrat.foodsAllowed.slice(0, 5).map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
                data-testid={`upcoming-food-${i}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="bg-accent/40 rounded-xl p-3">
            <p className="text-xs text-foreground font-medium mb-1">Meal idea for that day:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{nextVrat.vrat.mealIdea}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatToEat() {
  const [today] = useState(new Date());
  const todayStr = today.toISOString().split("T")[0];
  const vratsToday = getVratsForDate(todayStr);
  const nextVrat = getNextVrat(today);

  const primaryVrat = vratsToday[0];

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">What to Eat</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {vratsToday.length > 0
              ? "Your fasting guide for today"
              : "Plan your meals with devotion"}
          </p>
        </div>

        {primaryVrat ? (
          <VratFoodCard vrat={primaryVrat} />
        ) : (
          <NoFastToday nextVrat={nextVrat} />
        )}

        <div className="vrat-card p-4 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "Ahaar shuddhi se chitta shuddhi hoti hai" — Pure food leads to a pure mind.
            Your fast is a gift you give to your spirit.
          </p>
        </div>
      </div>
    </div>
  );
}
