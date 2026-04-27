import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import PageFooter from "@/components/PageFooter";

interface LangarRecipe {
  id: string;
  name: string;
  punjabiName: string;
  emoji: string;
  desc: string;
  occasion: string;
  dietaryNote: string;
  ingredients: string[];
  steps: string[];
  tip: string;
}

const LANGAR_RECIPES: LangarRecipe[] = [
  {
    id: "khichdi",
    name: "Khichdi",
    punjabiName: "ਖਿਚੜੀ",
    emoji: "🍚",
    desc: "Rice and lentils slow-cooked together into a warm, nourishing one-pot meal — the foundation of langar. Simple, humble, and deeply comforting.",
    occasion: "Daily langar — served every day at Gurdwaras across the world",
    dietaryNote: "Vegetarian · No onion or garlic · Cooked with pure ghee or oil",
    ingredients: [
      "1 cup rice, washed",
      "½ cup yellow moong dal (split yellow lentils), washed",
      "1 tsp ghee or oil",
      "1 tsp cumin seeds",
      "1 tsp turmeric powder",
      "Salt to taste",
      "4 cups water",
      "Fresh ginger, finely grated (optional)",
    ],
    steps: [
      "Wash the rice and dal together until the water runs clear. Drain and set aside.",
      "Heat ghee in a heavy pot on medium flame. Add cumin seeds and let them splutter for 30 seconds.",
      "Add grated ginger (if using) and cook for one minute, stirring gently.",
      "Add the rice and dal to the pot. Stir for a minute to lightly toast them.",
      "Pour in water. Add turmeric and salt. Stir well.",
      "Bring to a boil, then reduce heat to low, cover, and cook for 20–25 minutes until soft and thick.",
      "Stir once midway. Add a little more water if it is too dry — langar khichdi should be slightly runny.",
      "Serve hot with a small drizzle of ghee on top.",
    ],
    tip: "The key to langar khichdi is cooking it low and slow. A longer cook makes it smoother and more digestible — exactly how it is prepared in large Gurdwara degchi (cauldrons).",
  },
  {
    id: "saag",
    name: "Saag",
    punjabiName: "ਸਾਗ",
    emoji: "🥬",
    desc: "Mustard greens slow-cooked with spinach and mild spices — the soul of Punjabi winter cooking. Best eaten with makki di roti (cornbread) and a knob of fresh butter.",
    occasion: "Winter months, Lohri, Baisakhi langar, and everyday Gurdwara meals in Punjab",
    dietaryNote: "Vegetarian · No onion or garlic in sacred occasion variants · Cooked with pure ghee",
    ingredients: [
      "500 g mustard leaves (sarson), roughly chopped",
      "200 g spinach leaves, roughly chopped",
      "100 g bathua (lamb's quarters) or more spinach",
      "2 tbsp maize flour (makki di atta) or plain flour",
      "1-inch piece of ginger, grated",
      "2 green chillies, slit",
      "1 tbsp ghee",
      "Salt to taste",
      "Water as needed",
      "Fresh butter to serve",
    ],
    steps: [
      "Wash all the greens thoroughly. Boil mustard leaves, spinach, and bathua together with a little water, ginger, and green chillies for 20–25 minutes until completely soft.",
      "Remove from heat and let cool slightly. Use a wooden mathani (hand churner) or blender to roughly mash the greens — not too smooth, texture is important.",
      "Return to the pan on low heat. Sprinkle in the maize flour and stir well to thicken. Cook for 10–15 minutes, stirring often.",
      "In a small pan, heat ghee. Pour this tarka (seasoning) over the saag.",
      "Season with salt. Cook for another 5 minutes, stirring.",
      "Serve hot with a generous knob of fresh butter on top and makki di roti.",
    ],
    tip: "True Punjabi saag is cooked for at least 45 minutes on a low flame. The longer it simmers, the more the mustard bitterness mellows into a rich, earthy sweetness.",
  },
  {
    id: "meethe-chawal",
    name: "Meethe Chawal",
    punjabiName: "ਮਿੱਠੇ ਚਾਵਲ",
    emoji: "🟡",
    desc: "Fragrant saffron rice sweetened with sugar and studded with dry fruits — a festive langar preparation offered on special Gurpurab days to celebrate divine joy.",
    occasion: "Gurpurab days · Baisakhi · Hola Mohalla · Bandi Chhor Divas · Anand Karaj celebrations",
    dietaryNote: "Vegetarian · No onion or garlic · Cooked with pure ghee · Suitable for all sangat",
    ingredients: [
      "2 cups basmati rice, soaked 30 minutes",
      "1½ cups sugar",
      "A generous pinch of saffron (kesar), soaked in 2 tbsp warm milk",
      "3 tbsp ghee",
      "4 green cardamom pods, lightly crushed",
      "4 cloves",
      "1 cinnamon stick",
      "2 tbsp raisins (kismis)",
      "2 tbsp cashews, halved",
      "2 tbsp almonds, slivered",
      "¼ tsp turmeric (for colour, optional)",
      "3½ cups water",
    ],
    steps: [
      "Soak the rice for 30 minutes. Drain well.",
      "Heat ghee in a heavy pan. Add cardamom, cloves, and cinnamon. Let them bloom for 30 seconds.",
      "Add cashews and almonds. Fry for one minute until lightly golden. Remove and set aside.",
      "In the same pan, add the drained rice and stir gently for 2 minutes to coat in ghee.",
      "Add water, saffron-milk, and turmeric. Bring to a boil.",
      "Reduce heat to low, cover tightly, and cook for 15 minutes.",
      "When water is absorbed, sprinkle sugar over the rice. Dot with the remaining ghee. Cover again and cook for 5 more minutes on the lowest heat.",
      "Turn off the heat and rest for 5 minutes. Gently fluff the rice with a fork.",
      "Top with the fried dry fruits and raisins. Serve warm.",
    ],
    tip: "Adding the sugar after the rice is cooked prevents it from becoming mushy. The steam melts the sugar gently, keeping each grain separate and glossy.",
  },
  {
    id: "dal-makhani",
    name: "Dal Makhani",
    punjabiName: "ਦਾਲ ਮਖਣੀ",
    emoji: "🫘",
    desc: "Whole black lentils simmered overnight with butter and cream — the most celebrated langar dish. Rich, velvety, and deeply satisfying. Best when cooked slowly for hours.",
    occasion: "Gurpurab langar · Hola Mohalla · Bandi Chhor Divas · Special Gurdwara celebrations — also a daily staple at many large Gurdwaras",
    dietaryNote: "Vegetarian · No onion or garlic in sacred occasion variants · Cooked with pure butter",
    ingredients: [
      "1 cup whole black urad dal (whole black lentils), soaked overnight",
      "¼ cup red kidney beans (rajma), soaked overnight",
      "2 medium tomatoes, pureed or finely grated",
      "1-inch piece of ginger, grated",
      "3 tbsp butter",
      "2 tbsp cream (malai)",
      "1 tsp cumin seeds",
      "1 tsp red chilli powder",
      "1 tsp coriander powder",
      "½ tsp garam masala",
      "Salt to taste",
      "Fresh cream and butter to serve",
    ],
    steps: [
      "Drain the soaked lentils and kidney beans. Pressure cook with 3 cups water and salt for 25–30 minutes (or 8 whistles) until completely soft and slightly mushy.",
      "In a separate pan, heat butter on medium flame. Add cumin seeds; let them splutter.",
      "Add grated ginger and cook for one minute. Add tomato puree and cook for 8–10 minutes until the fat separates from the masala.",
      "Add red chilli powder and coriander powder. Cook the masala for another 2 minutes.",
      "Add the cooked lentils to the masala. Stir well and mix thoroughly.",
      "Simmer on low heat for at least 30–45 minutes, stirring every 10 minutes, until the dal turns deep brown and creamy.",
      "Stir in cream and garam masala. Cook for 5 more minutes.",
      "Serve hot topped with a knob of butter and a swirl of cream.",
    ],
    tip: "The real secret of langar dal makhani is time. At the Golden Temple, the dal is cooked on a slow wood fire for 12 hours or more. At home, the longer you simmer it — even overnight on the lowest heat — the better it tastes.",
  },
];

function RecipeCard({ recipe }: { recipe: LangarRecipe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-4 border"
      style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}
      data-testid={`langar-recipe-${recipe.id}`}
    >
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`recipe-body-${recipe.id}`}
      >
        <span className="text-4xl flex-shrink-0 mt-0.5" aria-hidden="true">{recipe.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold" style={{ color: "#1E3A8A" }}>
                {recipe.name}
              </h3>
              <p className="text-sm font-medium mt-0.5" style={{ color: "#F4A900" }}>
                {recipe.punjabiName}
              </p>
            </div>
            <div className="flex-shrink-0 mt-1" style={{ color: "#60A5FA" }}>
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{recipe.desc}</p>
          <div className="mt-2.5 flex items-start gap-1.5">
            <span className="text-xs" aria-hidden="true">📅</span>
            <p className="text-xs leading-relaxed" style={{ color: "#1E3A8A" }}>
              <span className="font-semibold">Occasion:</span> {recipe.occasion}
            </p>
          </div>
        </div>
      </button>

      {expanded && (
        <div id={`recipe-body-${recipe.id}`} className="px-5 pb-5 space-y-4">
          <div className="h-px" style={{ background: "#BFDBFE" }} />

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
            <span className="text-base mr-1.5" aria-hidden="true">🌿</span>
            <span className="font-semibold">Dietary note:</span> {recipe.dietaryNote}
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#1E3A8A" }}>
              Ingredients
            </h4>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "#003DA5" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#1E3A8A" }}>
              Method
            </h4>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "#F4A900" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "#FEF3C7", borderLeft: "3px solid #F4A900" }}
          >
            <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">💡</span>
            <p className="text-sm leading-relaxed" style={{ color: "#92400E" }}>
              <span className="font-semibold">Langar tip:</span> {recipe.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LangarRecipes() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "#EFF6FF" }}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation("/eat")}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#DBEAFE" }}
            aria-label="Go back"
          >
            <ChevronLeft size={20} style={{ color: "#1E3A8A" }} />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold" style={{ color: "#1E3A8A" }}>
              Langar Recipes
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>
              ਲੰਗਰ ਰੈਸਿਪੀਆਂ · 4 traditional dishes
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 mb-6 text-sm leading-relaxed"
          style={{ background: "#003DA5", color: "#FFFFFF" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#F4A900" }}>ਲੰਗਰ — The Sacred Community Kitchen</p>
          <p className="text-white/85 text-xs leading-relaxed">
            Langar is the free community meal served at every Gurdwara — open to all, regardless of faith, caste, or background. Founded by Guru Nanak Dev Ji, it embodies the Sikh principles of seva (selfless service), equality, and sharing. Every dish is vegetarian and prepared with love by volunteers.
          </p>
        </div>

        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#3B82F6" }}>
          4 Langar Classics
        </p>

        {LANGAR_RECIPES.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}

        <div
          className="rounded-2xl p-5 text-center mt-2"
          style={{ background: "#DBEAFE" }}
        >
          <p className="text-xs leading-relaxed italic" style={{ color: "#1E3A8A" }}>
            "Jo māngai ṭhākur apunai tai, so'ī so'ī dévai" — Whatever the devotee asks of the Lord, that is what is given. Food prepared with devotion and shared freely is the purest form of prayer.
          </p>
          <p className="text-xs mt-2 font-semibold" style={{ color: "#3B82F6" }}>— Guru Granth Sahib Ji</p>
        </div>

        <PageFooter />
      </div>
    </div>
  );
}
