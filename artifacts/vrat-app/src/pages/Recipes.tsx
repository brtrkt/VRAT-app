import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import PageFooter from "@/components/PageFooter";

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  prepMins: number;
  cookMins: number;
  serves: number;
  energy: "Light" | "Medium" | "Heavy";
  tags: string[];
  ingredients: string[];
  steps: string[];
  tip: string;
}

const RECIPES: Recipe[] = [
  {
    id: "sabudana-khichdi",
    name: "Sabudana Khichdi",
    emoji: "🫙",
    desc: "The most beloved vrat dish — light, filling, and ready in minutes once the sabudana is soaked.",
    prepMins: 5,
    cookMins: 10,
    serves: 2,
    energy: "Medium",
    tags: ["Hindu Fast", "Navratri", "Ekadashi", "Shivratri"],
    ingredients: [
      "1 cup sabudana (tapioca pearls), soaked 4–6 hours",
      "3 tbsp roasted peanuts, coarsely crushed",
      "2 medium potatoes, boiled and cubed",
      "1 tbsp ghee",
      "1 tsp cumin seeds",
      "2 green chillies, finely chopped",
      "Sendha namak (rock salt) to taste",
      "1 tbsp lemon juice",
      "2 tbsp fresh coriander, chopped",
    ],
    steps: [
      "Drain the soaked sabudana well. Spread on a plate and let it air-dry for 5 minutes — this prevents sticking.",
      "Heat ghee in a wide pan on medium flame. Add cumin seeds; let them splutter.",
      "Add green chillies and sauté for 30 seconds. Add the boiled potato cubes and cook for 2 minutes.",
      "Add sabudana and crushed peanuts. Mix gently so the pearls don't break. Cook for 6–8 minutes, stirring every minute.",
      "Season with sendha namak and lemon juice. Finish with fresh coriander. Serve hot.",
    ],
    tip: "Soak the sabudana the night before for best results. If it still feels hard after soaking, sprinkle a little water and rest for 30 more minutes.",
  },
  {
    id: "kuttu-ki-puri",
    name: "Kuttu Ki Puri",
    emoji: "🫓",
    desc: "Crispy, golden puris made from buckwheat flour — the most satisfying main meal on a fast day.",
    prepMins: 10,
    cookMins: 15,
    serves: 2,
    energy: "Heavy",
    tags: ["Hindu Fast", "Navratri", "Shivratri", "Ekadashi"],
    ingredients: [
      "1 cup kuttu atta (buckwheat flour)",
      "1 medium potato, boiled and mashed",
      "Sendha namak to taste",
      "½ tsp ajwain (carom seeds)",
      "Water as needed to bind",
      "Oil or ghee for deep frying",
    ],
    steps: [
      "Mix kuttu atta, mashed potato, sendha namak, and ajwain in a bowl. The potato acts as a binding agent.",
      "Add water little by little and knead into a firm, smooth dough — it should not stick to your hands.",
      "Divide into 8 equal portions. Roll each into a 4-inch circle on a lightly floured surface.",
      "Heat oil in a kadai until a small piece of dough rises immediately when dropped in.",
      "Fry the puris one at a time, pressing gently with a slotted spoon so they puff. Flip and fry until golden. Drain on paper.",
      "Serve hot with aloo sabzi made with sendha namak.",
    ],
    tip: "Kuttu dough dries quickly — cover with a damp cloth while rolling. Add a pinch of ground black pepper for extra flavour.",
  },
  {
    id: "singhara-halwa",
    name: "Singhara Halwa",
    emoji: "🍮",
    desc: "A warm, fragrant sweet made from water chestnut flour — lighter than suji halwa and deeply comforting.",
    prepMins: 2,
    cookMins: 12,
    serves: 2,
    energy: "Heavy",
    tags: ["Hindu Fast", "Navratri", "Ekadashi", "Prasad"],
    ingredients: [
      "½ cup singhara atta (water chestnut flour)",
      "3 tbsp ghee",
      "½ cup sugar (adjust to taste)",
      "1½ cups warm water",
      "4–5 green cardamoms, crushed",
      "10 cashews, halved",
      "10 raisins",
    ],
    steps: [
      "Heat ghee in a heavy-bottomed pan on low-medium flame. Add cashews and raisins; fry until golden. Remove and set aside.",
      "In the same ghee, add singhara atta. Roast on low flame, stirring constantly, for 5–7 minutes until it turns golden and smells nutty.",
      "Carefully pour in the warm water (it will splutter). Stir quickly to avoid lumps.",
      "Add sugar and cardamom. Cook, stirring, until the halwa leaves the sides of the pan — about 4 minutes.",
      "Top with the fried cashews and raisins. Serve warm.",
    ],
    tip: "Low and slow is the key — rushing the roasting step leads to raw-smelling halwa. The atta should turn a shade darker and smell toasty.",
  },
  {
    id: "makhana-kheer",
    name: "Makhana Kheer",
    emoji: "🥛",
    desc: "Creamy, delicate kheer made with fox nuts — lighter than rice kheer and considered especially pure for fasting.",
    prepMins: 5,
    cookMins: 20,
    serves: 3,
    energy: "Heavy",
    tags: ["Hindu Fast", "Navratri", "Ekadashi", "Purnima", "Prasad"],
    ingredients: [
      "1 cup makhana (fox nuts)",
      "1 litre full-fat milk",
      "3–4 tbsp sugar",
      "¼ tsp cardamom powder",
      "1 tbsp ghee",
      "10 almonds, thinly sliced",
      "A few strands of saffron (optional)",
    ],
    steps: [
      "Heat ghee in a pan. Roast makhana on low flame for 5 minutes, stirring, until crisp. Cool and crush half of them coarsely.",
      "Bring milk to a boil in a heavy pan. Reduce to a simmer.",
      "Add whole and crushed makhana to the milk. Simmer, stirring occasionally, for 12–15 minutes until the makhana softens and the milk thickens.",
      "Add sugar, cardamom, and saffron. Stir for 2 more minutes.",
      "Top with sliced almonds. Serve warm or chilled.",
    ],
    tip: "For extra richness, add 2 tbsp condensed milk in place of half the sugar. Makhana kheer thickens as it cools — add a splash of warm milk when reheating.",
  },
  {
    id: "sama-rice-pulao",
    name: "Sama Rice Pulao",
    emoji: "🍚",
    desc: "Barnyard millet cooked like a fragrant pulao — the most digestible 'rice' alternative for long fasts.",
    prepMins: 5,
    cookMins: 15,
    serves: 2,
    energy: "Medium",
    tags: ["Hindu Fast", "Navratri", "Ekadashi"],
    ingredients: [
      "1 cup sama rice (barnyard millet / samvat ke chawal)",
      "2 cups water",
      "1 tbsp ghee",
      "1 tsp cumin seeds",
      "1 medium potato, diced small",
      "1 green chilli, slit",
      "Sendha namak to taste",
      "Fresh coriander to garnish",
    ],
    steps: [
      "Rinse sama rice twice in cold water. Soak for 15 minutes, then drain.",
      "Heat ghee in a pressure cooker or heavy pot. Add cumin seeds and let them splutter.",
      "Add green chilli and diced potato. Cook for 2 minutes.",
      "Add drained sama rice and stir gently. Add 2 cups water and sendha namak.",
      "Pressure cook for 1 whistle (or simmer covered for 12 minutes) until grains are cooked through. Fluff gently.",
      "Garnish with coriander and serve with dahi.",
    ],
    tip: "Use a 1:2 ratio of sama to water. Unlike regular rice, sama becomes mushy if overcooked — 1 whistle in the pressure cooker is enough.",
  },
  {
    id: "aloo-jeera",
    name: "Vrat Wale Aloo",
    emoji: "🥔",
    desc: "Simple, spiced potatoes made with sendha namak and cumin — pairs perfectly with kuttu puri or as a standalone snack.",
    prepMins: 5,
    cookMins: 15,
    serves: 2,
    energy: "Medium",
    tags: ["Hindu Fast", "All Vrats"],
    ingredients: [
      "3 medium potatoes, boiled and peeled",
      "1 tbsp ghee",
      "1 tsp cumin seeds",
      "½ tsp black pepper powder",
      "Sendha namak to taste",
      "1 tsp lemon juice",
      "Fresh coriander",
      "1 green chilli, finely chopped",
    ],
    steps: [
      "Cut boiled potatoes into bite-size chunks. Avoid cutting too small — they'll break up when cooked.",
      "Heat ghee in a pan. Add cumin seeds; let them darken slightly.",
      "Add green chilli, then the potatoes. Toss gently to coat with ghee.",
      "Cook on medium-high for 5 minutes, letting the potatoes get a little golden crust on the edges.",
      "Season with sendha namak, black pepper, and lemon juice. Toss. Garnish with coriander.",
    ],
    tip: "Cook the potatoes a day ahead and refrigerate. Cold boiled potatoes hold their shape much better than freshly boiled ones.",
  },
  {
    id: "rajgira-ladoo",
    name: "Rajgira Ladoo",
    emoji: "🟤",
    desc: "Energy-packed amaranth and peanut balls — perfect as a mid-morning snack that keeps hunger away for hours.",
    prepMins: 10,
    cookMins: 10,
    serves: 12,
    energy: "Heavy",
    tags: ["Hindu Fast", "Navratri", "Snack"],
    ingredients: [
      "1 cup rajgira (amaranth) flour",
      "¼ cup roasted peanuts, coarsely crushed",
      "3–4 tbsp jaggery or sugar",
      "2 tbsp ghee",
      "¼ tsp cardamom powder",
      "2 tbsp desiccated coconut (optional)",
    ],
    steps: [
      "Dry roast rajgira flour in a pan on low flame for 4–5 minutes, stirring, until it smells nutty and turns one shade darker.",
      "Add ghee and mix well. Remove from heat.",
      "Add crushed peanuts, jaggery, cardamom, and coconut. Mix while the mixture is still warm.",
      "When cool enough to handle, wet your palms slightly with water and shape into golf-ball-sized ladoos.",
      "If the mixture is too dry to hold shape, add a little more ghee (not water). Store in an airtight box for up to 5 days.",
    ],
    tip: "Work quickly — the mixture sets as it cools and becomes hard to shape. If it hardens, warm it briefly in the pan.",
  },
  {
    id: "banana-lassi",
    name: "Banana & Cardamom Lassi",
    emoji: "🥤",
    desc: "Thick, naturally sweet lassi that replenishes energy and keeps you hydrated — a complete snack in a glass.",
    prepMins: 5,
    cookMins: 0,
    serves: 2,
    energy: "Medium",
    tags: ["Hindu Fast", "All Vrats", "Drink"],
    ingredients: [
      "2 ripe bananas",
      "1 cup thick dahi (curd / yogurt)",
      "½ cup cold milk",
      "1 tsp sugar or mishri (optional)",
      "¼ tsp cardamom powder",
      "A few ice cubes",
    ],
    steps: [
      "Peel bananas and break into chunks. Add to a blender.",
      "Add dahi, cold milk, sugar (if using), and cardamom.",
      "Blend for 30 seconds until smooth and frothy.",
      "Pour over ice and serve immediately.",
    ],
    tip: "Use overripe bananas for natural sweetness — you may not need any added sugar. Add 2–3 strands of saffron for an extra festive touch.",
  },
  {
    id: "sweet-potato-chaat",
    name: "Shakarkand Chaat",
    emoji: "🍠",
    desc: "Roasted sweet potato with tangy lemon and spice — a beloved street food converted for vrat days.",
    prepMins: 5,
    cookMins: 20,
    serves: 2,
    energy: "Medium",
    tags: ["Hindu Fast", "Navratri", "All Vrats"],
    ingredients: [
      "2 medium sweet potatoes",
      "1 tsp lemon juice",
      "½ tsp black pepper",
      "Sendha namak to taste",
      "Fresh coriander",
      "½ tsp roasted cumin powder (jeera powder)",
    ],
    steps: [
      "Wash sweet potatoes. Pierce with a fork a few times. Microwave for 8–10 minutes, turning once, until a skewer passes through easily.",
      "Alternatively, roast directly on a gas flame for a smoky flavour — turn with tongs until charred on all sides and soft inside.",
      "Peel and slice into thick rounds or cubes.",
      "Toss with sendha namak, black pepper, cumin powder, and lemon juice.",
      "Garnish with coriander. Serve warm.",
    ],
    tip: "Roasting directly on a flame gives a beautiful smoky taste that elevates this dish completely. Allow 15 minutes on the flame, turning every 3 minutes.",
  },
  {
    id: "fruit-chaat",
    name: "Vrat Fruit Chaat",
    emoji: "🍇",
    desc: "A refreshing medley of seasonal fruits with a hint of cardamom and lemon — the lightest, most cooling fast-day dish.",
    prepMins: 10,
    cookMins: 0,
    serves: 2,
    energy: "Light",
    tags: ["Hindu Fast", "Jain Fast", "All Vrats"],
    ingredients: [
      "1 banana, sliced",
      "1 apple, diced",
      "1 cup pomegranate arils",
      "1 cup papaya, cubed",
      "½ cup seedless grapes",
      "1 tsp lemon juice",
      "¼ tsp cardamom powder",
      "1 tsp mishri (rock candy) or sugar",
    ],
    steps: [
      "Wash, peel, and chop all fruits into bite-size pieces. Combine in a bowl.",
      "Add lemon juice, cardamom powder, and mishri.",
      "Toss gently so the fruits don't bruise. Taste and adjust lemon or sweetness.",
      "Chill for 10 minutes before serving for best flavour.",
    ],
    tip: "Use whatever fruits are in season. Avoid fruits that oxidise quickly like pears and bananas if preparing ahead — add those just before serving.",
  },
];

const ENERGY_STYLE: Record<string, { bg: string; text: string }> = {
  Light:  { bg: "rgba(21,128,61,0.10)",  text: "#15803D" },
  Medium: { bg: "rgba(180,83,9,0.10)",   text: "#B45309" },
  Heavy:  { bg: "rgba(185,28,28,0.08)",  text: "#B91C1C" },
};

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const es = ENERGY_STYLE[recipe.energy];
  const totalMins = recipe.prepMins + recipe.cookMins;

  return (
    <div
      className="rounded-3xl mb-4 overflow-hidden"
      style={{ border: "1px solid rgba(212,160,23,0.20)", background: "white" }}
      data-testid={`recipe-${recipe.id}`}
    >
      {/* Header row */}
      <button
        className="w-full text-left px-5 pt-5 pb-4 flex items-start gap-3"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-3xl flex-shrink-0 mt-0.5" aria-hidden="true">{recipe.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-foreground leading-tight">{recipe.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{recipe.desc}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: es.bg, color: es.text }}
            >
              {recipe.energy}
            </span>
            <span className="text-xs text-muted-foreground">⏱ {totalMins} min</span>
            <span className="text-xs text-muted-foreground">· Serves {recipe.serves}</span>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1 text-muted-foreground">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="px-5 pb-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(212,160,23,0.10)", color: "#92400E" }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Prep", val: `${recipe.prepMins} min` },
              { label: "Cook", val: recipe.cookMins === 0 ? "No cook" : `${recipe.cookMins} min` },
              { label: "Serves", val: `${recipe.serves}` },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl text-center py-2"
                style={{ background: "rgba(212,160,23,0.08)" }}
              >
                <p className="text-xs text-amber-600">{m.label}</p>
                <p className="text-sm font-semibold text-amber-900">{m.val}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Ingredients
          </p>
          <ul className="mb-4 space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-400" aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>

          {/* Steps */}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Method
          </p>
          <ol className="mb-4 space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ background: "linear-gradient(135deg, #E07B2A, #C86B1A)" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {/* Tip */}
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2"
            style={{ background: "rgba(212,160,23,0.09)" }}
          >
            <span className="text-base mt-0.5" aria-hidden="true">💡</span>
            <p className="text-xs text-amber-800 leading-relaxed">{recipe.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Recipes() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"All" | "Light" | "Medium" | "Heavy">("All");

  const filtered = filter === "All" ? RECIPES : RECIPES.filter((r) => r.energy === filter);

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation("/eat")}
            className="w-10 h-10 rounded-full bg-card border border-card-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Fasting Recipes</h1>
            <p className="text-muted-foreground text-xs mt-0.5">10 traditional recipes for fast days</p>
          </div>
        </div>

        {/* Intro */}
        <div
          className="rounded-2xl px-5 py-4 mb-5"
          style={{ background: "rgba(212,160,23,0.09)", border: "1px solid rgba(212,160,23,0.18)" }}
        >
          <p className="text-sm text-amber-800 leading-relaxed">
            All recipes use only <span className="font-semibold">vrat-approved ingredients</span> — sendha namak instead of regular salt, no onion or garlic, and only fasting-safe flours and grains.
          </p>
        </div>

        {/* Energy filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {(["All", "Light", "Medium", "Heavy"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                filter === f
                  ? { background: "linear-gradient(135deg, #E07B2A, #C86B1A)", color: "white" }
                  : { background: "rgba(212,160,23,0.10)", color: "#92400E" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Recipes */}
        {filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}

        <div className="mt-2">
          <PageFooter />
        </div>
      </div>
    </div>
  );
}
