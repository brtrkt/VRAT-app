import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import PageFooter from "@/components/PageFooter";
import { getUserTradition } from "@/hooks/useUserPrefs";

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

// =====================================================================
// Tradition-specific regional recipes.
// Each array is shown BELOW the universal RECIPES list when the user's
// selected tradition matches. Mirrors the regional FoodList pattern in
// WhatToEat.tsx so the user always sees: universal recipes first, then
// the regional layer for their tradition. Curated for fast-day use:
// no onion, no garlic, sendha namak (rock salt), and only ingredients
// that respect each tradition's own fasting conventions.
// =====================================================================

const LINGAYAT_RECIPES: Recipe[] = [
  {
    id: "lingayat-huggi",
    name: "Huggi (Sweet Pongal)",
    emoji: "🍚",
    desc: "A sacred sweet rice-and-moong-dal porridge offered on Lingayat fast days and Sankranti — slow-cooked in milk and jaggery with cardamom and ghee-roasted cashews.",
    prepMins: 5,
    cookMins: 30,
    serves: 3,
    energy: "Heavy",
    tags: ["Lingayat", "Karnataka", "Sankranti", "Festival"],
    ingredients: [
      "½ cup raw rice, washed",
      "¼ cup moong dal (split yellow), dry-roasted lightly",
      "2 cups whole milk + 2 cups water",
      "¾ cup jaggery (powdered)",
      "3 tbsp ghee",
      "10 cashews + 1 tbsp raisins",
      "¼ tsp cardamom powder",
      "Pinch of edible camphor (optional)",
    ],
    steps: [
      "Pressure-cook rice + roasted moong dal with milk and water for 4 whistles until very soft.",
      "Mash lightly with the back of a spoon while still warm.",
      "Melt jaggery in ¼ cup water on low heat until fully dissolved. Strain to remove impurities.",
      "Pour the strained jaggery syrup into the cooked rice-dal. Simmer 5–7 minutes, stirring continuously, until thick.",
      "Heat ghee in a small pan. Fry cashews until golden, add raisins until they puff. Pour over the huggi.",
      "Stir in cardamom and camphor. Offer to Ishtalinga, then serve warm.",
    ],
    tip: "The traditional Lingayat way is to use organic gud (jaggery) from sugarcane, not refined sugar. Edible camphor (pacha karpura) is used in tiny pinches — it transforms the offering and is considered essential for naivedya.",
  },
  {
    id: "lingayat-akki-rotti",
    name: "Akki Rotti (Vrat Style)",
    emoji: "🫓",
    desc: "Karnataka's beloved rice-flour flatbread, hand-patted on a hot tawa. The fast-day version uses sendha namak and skips onion — keeping the warmth of cumin, ginger and fresh coriander.",
    prepMins: 10,
    cookMins: 15,
    serves: 2,
    energy: "Medium",
    tags: ["Lingayat", "Karnataka", "Fast Day"],
    ingredients: [
      "1 cup rice flour",
      "2 green chillies, finely chopped",
      "1 tsp grated ginger",
      "1 tsp cumin seeds",
      "2 tbsp grated fresh coconut",
      "2 tbsp chopped coriander",
      "Sendha namak (rock salt) to taste",
      "1 tbsp ghee + extra for cooking",
      "¾ cup hot water (approx)",
    ],
    steps: [
      "In a bowl, mix rice flour with chillies, ginger, cumin, coconut, coriander and sendha namak.",
      "Add 1 tbsp ghee and gradually pour hot water. Knead into a soft, pliable dough — it should not crumble.",
      "Heat a flat tawa on medium-low. Take a lemon-sized ball of dough.",
      "Wet your fingertips with water. Pat the dough directly on the warm tawa into a thin disc, around 6 inches wide.",
      "Drizzle ghee around the edges. Cook on medium for 2 minutes, then flip and cook another 2 minutes until golden brown spots appear.",
      "Serve hot with a bowl of fresh curd or coconut chutney.",
    ],
    tip: "Patting the dough directly on a warm tawa (not a cold one) is the secret — too hot and it sticks, too cold and it cracks. If hand-patting feels tricky, roll it between two sheets of butter paper instead.",
  },
  {
    id: "lingayat-ragi-mudde",
    name: "Ragi Mudde",
    emoji: "🟫",
    desc: "Finger-millet balls — the staple of rural Karnataka. High in calcium and iron, eaten with a thin curd or saaru. A grounding, complete fast-day meal in just 15 minutes.",
    prepMins: 2,
    cookMins: 12,
    serves: 2,
    energy: "Heavy",
    tags: ["Lingayat", "Karnataka", "Millet"],
    ingredients: [
      "1 cup ragi flour (finger millet)",
      "2 cups water",
      "Pinch of sendha namak",
      "1 tsp ghee",
      "To serve: 1 cup fresh curd + sendha namak",
    ],
    steps: [
      "Boil 2 cups water with sendha namak in a heavy pot.",
      "Reduce to lowest flame. Add ragi flour all at once — do NOT stir yet. Cover and let it sit for 4 minutes.",
      "Now stir vigorously with a strong wooden spoon (mudde kolu), breaking lumps, until you get a smooth, thick, glossy mass — about 5 minutes.",
      "Add ghee. Stir for 1 more minute.",
      "Wet your palms with cold water. Take small portions and shape into smooth balls (mudde).",
      "Serve hot with curd seasoned with sendha namak. Swallow small pieces without chewing — that is the traditional way.",
    ],
    tip: "Ragi mudde is traditionally swallowed, not chewed — it slides down with the curd. A mudde and a glass of buttermilk is considered a complete farmer's meal in Karnataka, sustaining hours of work.",
  },
];

const WARKARI_RECIPES: Recipe[] = [
  {
    id: "warkari-shengdana-amti",
    name: "Shengdana Amti",
    emoji: "🥜",
    desc: "Maharashtra's classic upvas peanut curry — creamy, mildly sweet-spicy, served with varai bhaat or sabudana khichdi. The dish that fuels every Warkari pilgrim on the Pandharpur Wari.",
    prepMins: 5,
    cookMins: 15,
    serves: 2,
    energy: "Medium",
    tags: ["Warkari", "Maharashtra", "Ekadashi", "Upvas"],
    ingredients: [
      "¾ cup raw peanuts, dry-roasted and skinned",
      "1 boiled potato, mashed",
      "1 tbsp ghee",
      "1 tsp cumin seeds",
      "2 green chillies, slit",
      "½ tsp ginger paste",
      "1 tbsp jaggery",
      "1 tbsp tamarind pulp (or 1 tsp lemon juice)",
      "Sendha namak to taste",
      "2 tbsp chopped coriander",
    ],
    steps: [
      "Coarsely grind 2 tbsp roasted peanuts with ½ cup water into a smooth paste. Keep aside.",
      "Heat ghee. Add cumin and let it splutter. Add green chillies and ginger paste; sauté 30 seconds.",
      "Add the peanut paste and remaining whole peanuts. Cook 2 minutes.",
      "Add 1.5 cups water, mashed potato, jaggery, tamarind and sendha namak. Stir well.",
      "Simmer on low for 8 minutes — the curry will thicken slightly and become glossy.",
      "Garnish with coriander. Serve hot with varai bhaat.",
    ],
    tip: "The balance is everything: jaggery for sweetness, tamarind for sourness, peanuts for body. Skip the tomato (it's not vrat-traditional in Maharashtra) — tamarind is the authentic souring agent on upvas days.",
  },
  {
    id: "warkari-varai-bhaat",
    name: "Varai Bhaat",
    emoji: "🍚",
    desc: "Samo rice (barnyard millet) — Maharashtra's most beloved upvas grain. Cooked simply with cumin and ghee, this is the canvas for shengdana amti or a side of curd.",
    prepMins: 2,
    cookMins: 12,
    serves: 2,
    energy: "Light",
    tags: ["Warkari", "Maharashtra", "Ekadashi", "Upvas"],
    ingredients: [
      "½ cup varai (samo / barnyard millet), washed and drained",
      "1 tbsp ghee",
      "1 tsp cumin seeds",
      "1 green chilli, slit",
      "1.25 cups water",
      "Sendha namak to taste",
      "1 tbsp chopped coriander",
    ],
    steps: [
      "Heat ghee in a heavy pan. Add cumin; let it crackle.",
      "Add green chilli and the drained varai. Sauté for 1 minute on medium — the millet should turn slightly fragrant.",
      "Add water and sendha namak. Bring to a boil.",
      "Reduce flame to lowest. Cover tightly and cook for 8–10 minutes.",
      "Switch off the heat. Let it rest, covered, for 5 minutes — do not lift the lid.",
      "Fluff gently with a fork. Garnish with coriander. Serve hot with shengdana amti or fresh curd.",
    ],
    tip: "Varai cooks in roughly the same ratio as rice but is much faster. The 5-minute rest after cooking is what makes the grains separate and fluffy — opening the lid early releases steam and turns it sticky.",
  },
  {
    id: "warkari-rajgira-sheera",
    name: "Rajgira Sheera",
    emoji: "🍮",
    desc: "Amaranth-flour halwa — light, glossy, and ready in 10 minutes. The traditional sweet served at Warkari abhang sessions and on Tukaram Beej.",
    prepMins: 2,
    cookMins: 10,
    serves: 3,
    energy: "Medium",
    tags: ["Warkari", "Maharashtra", "Sweet", "Upvas"],
    ingredients: [
      "½ cup rajgira (amaranth) flour",
      "3 tbsp ghee",
      "½ cup jaggery, powdered",
      "1.25 cups hot water or warm milk",
      "¼ tsp cardamom powder",
      "1 tbsp slivered almonds",
    ],
    steps: [
      "Heat ghee in a heavy pan on medium-low. Add rajgira flour.",
      "Roast, stirring continuously, for 5–6 minutes until the flour turns a shade darker and gives a nutty aroma.",
      "Carefully pour in the hot water (it will splutter). Stir vigorously to break any lumps.",
      "Add jaggery. Cook on low, stirring, for 3 minutes until the mixture thickens and pulls away from the sides.",
      "Stir in cardamom and almonds. Switch off.",
      "Serve warm. It will set slightly as it cools.",
    ],
    tip: "Rajgira flour browns faster than wheat semolina — keep the flame low and stir constantly. Use jaggery, not sugar; it deepens the flavour and is the traditional choice for vrat sweets in the Warkari kitchen.",
  },
];

const SRI_VAISHNAVA_RECIPES: Recipe[] = [
  {
    id: "srivaishnava-sakkarai-pongal",
    name: "Sakkarai Pongal",
    emoji: "🍯",
    desc: "The sacred sweet pongal of Tamil Vaishnava temples — rice and moong dal slow-cooked in jaggery and milk, finished with ghee-fried cashews and cardamom. Offered to Perumal at Vaikuntha Ekadashi.",
    prepMins: 5,
    cookMins: 25,
    serves: 4,
    energy: "Heavy",
    tags: ["Sri Vaishnava", "Tamil Nadu", "Vaikuntha Ekadashi", "Prasadam"],
    ingredients: [
      "½ cup raw rice",
      "¼ cup moong dal, dry-roasted",
      "1 cup jaggery (powdered)",
      "1.5 cups whole milk + 1.5 cups water",
      "4 tbsp ghee",
      "12 cashews, broken",
      "1 tbsp raisins",
      "½ tsp cardamom powder",
      "Pinch of edible camphor",
      "Pinch of nutmeg",
    ],
    steps: [
      "Pressure-cook rice + roasted dal with milk and water for 5 whistles until completely soft. Mash gently.",
      "In a separate pan, melt jaggery in ½ cup water on low heat. Strain.",
      "Add the strained jaggery syrup to the cooked rice-dal. Simmer 6–8 minutes on low, stirring, until it thickens to a soft pudding.",
      "Heat 3 tbsp ghee in a small pan. Fry cashews to golden, then raisins until plump. Pour over the pongal with the ghee.",
      "Stir in cardamom, nutmeg, edible camphor and the last spoon of ghee.",
      "Offer to Perumal first, then distribute as prasadam.",
    ],
    tip: "Authentic temple-style sakkarai pongal uses pacha karpura (edible camphor) — just a pinch. It is the signature note of Sri Vaishnava prasadam. The pongal should be loose, not stiff; if it sets too thick, loosen with warm milk.",
  },
  {
    id: "srivaishnava-puliyodarai",
    name: "Puliyodarai (Tamarind Rice)",
    emoji: "🍚",
    desc: "Tamarind rice prasadam from Sri Vaishnava temples — tangy, mildly spiced, dense with sesame and curry leaves. Stays fresh for hours, which is why it travels in every pilgrim's bundle.",
    prepMins: 10,
    cookMins: 20,
    serves: 4,
    energy: "Medium",
    tags: ["Sri Vaishnava", "Tamil Nadu", "Prasadam"],
    ingredients: [
      "1.5 cups cooked rice (cooled, grains separate)",
      "Lemon-sized ball of tamarind, soaked in ½ cup hot water",
      "3 tbsp sesame oil (gingelly)",
      "1 tsp mustard seeds",
      "1 tsp chana dal",
      "1 tsp urad dal",
      "2 dry red chillies, broken",
      "10 curry leaves",
      "¼ tsp asafoetida (hing)",
      "¼ tsp turmeric",
      "1 tbsp roasted sesame seeds, ground",
      "Sendha namak to taste",
    ],
    steps: [
      "Squeeze the tamarind to extract a thick pulp. Discard fibres.",
      "Heat 2 tbsp sesame oil. Add mustard seeds; let them pop. Add chana dal, urad dal, red chillies, curry leaves and hing. Roast until dals turn golden.",
      "Add tamarind pulp + ¼ cup water + turmeric + sendha namak. Simmer 8–10 minutes until the mixture thickens into a glossy paste (pulikachal).",
      "Stir in the ground sesame powder. Cook 1 more minute. Switch off and let it cool slightly.",
      "Spread the cooled rice on a wide plate. Drizzle the remaining 1 tbsp sesame oil and pour over 3–4 spoons of pulikachal.",
      "Mix gently with a spatula so every grain is coated. Adjust salt. Rest 10 minutes before serving.",
    ],
    tip: "The pulikachal paste keeps in the fridge for 2 weeks — temple cooks make it in advance and toss it with fresh rice as needed. Use sesame oil, not any other; it is the soul of this prasadam.",
  },
  {
    id: "srivaishnava-daddojanam",
    name: "Daddojanam (Curd Rice)",
    emoji: "🍶",
    desc: "Cooling, comforting curd rice prasadam — the closing offering at every Sri Vaishnava temple meal. A balm for the stomach after the spiced courses, and a complete light meal on its own.",
    prepMins: 5,
    cookMins: 8,
    serves: 3,
    energy: "Light",
    tags: ["Sri Vaishnava", "Tamil Nadu", "Prasadam"],
    ingredients: [
      "1.5 cups cooked rice (slightly overcooked, mashed lightly)",
      "1.5 cups fresh curd",
      "½ cup milk",
      "Sendha namak to taste",
      "1 tbsp ghee",
      "1 tsp mustard seeds",
      "1 tsp urad dal",
      "1 dry red chilli",
      "8 curry leaves",
      "1 tbsp grated ginger",
      "1 green chilli, finely chopped",
      "2 tbsp pomegranate seeds (optional, for garnish)",
    ],
    steps: [
      "Mash the warm rice with a wooden spoon until soft. Let it cool to lukewarm.",
      "Add milk and curd. Mix gently. Add sendha namak. The texture should be creamy, slightly loose.",
      "Heat ghee in a small pan. Add mustard, urad dal, red chilli, curry leaves, ginger and green chilli.",
      "Once the dal turns golden, pour the tempering over the curd rice. Mix lightly.",
      "Garnish with pomegranate seeds. Serve at room temperature — never chilled.",
    ],
    tip: "Add the milk first, then the curd — milk softens the rice and prevents the curd from turning sour as it sits. Temple-style daddojanam is always loose; if it tightens, refresh it with a splash of milk.",
  },
];

const SHAIVA_SIDDHANTA_RECIPES: Recipe[] = [
  {
    id: "shaiva-ven-pongal",
    name: "Ven Pongal",
    emoji: "🍚",
    desc: "Savoury rice-and-moong-dal pongal — the morning prasadam at Shiva temples across Tamil Nadu. Black pepper, cumin, ghee and curry leaves. Offered to Lord Shiva on Pradosha and Aarudra Darshan.",
    prepMins: 5,
    cookMins: 25,
    serves: 3,
    energy: "Heavy",
    tags: ["Shaiva Siddhanta", "Tamil Nadu", "Pradosha", "Prasadam"],
    ingredients: [
      "½ cup raw rice",
      "¼ cup moong dal, dry-roasted",
      "3 cups water + 1 cup milk",
      "3 tbsp ghee",
      "1 tsp whole black pepper, lightly crushed",
      "1 tsp cumin seeds",
      "1 inch ginger, finely chopped",
      "10 cashews, broken",
      "10 curry leaves",
      "¼ tsp asafoetida",
      "Sendha namak to taste",
    ],
    steps: [
      "Pressure-cook rice + roasted dal with water and milk + sendha namak for 5 whistles. Mash to a soft, slightly loose porridge.",
      "Heat ghee in a small pan. Fry cashews until golden; remove and set aside.",
      "In the same ghee, add cumin, crushed pepper, ginger, hing and curry leaves. Sizzle 30 seconds.",
      "Pour the entire tempering over the cooked pongal. Add the cashews back.",
      "Mix gently. Adjust salt. The pongal should flow when scooped.",
      "Serve hot with coconut chutney or sambar.",
    ],
    tip: "Crush the pepper coarsely just before tempering — pre-ground pepper loses its punch. Temple ven pongal is generous with ghee; do not reduce it. The ghee is what carries the pepper-cumin aroma into every grain.",
  },
  {
    id: "shaiva-aval-payasam",
    name: "Aval Payasam",
    emoji: "🥛",
    desc: "Poha (flattened rice) kheer — quick, fragrant, ready in 15 minutes. The favoured payasam for Pradosha pujas because it can be made fresh between the evening sandhya and the abhishekam.",
    prepMins: 3,
    cookMins: 15,
    serves: 3,
    energy: "Medium",
    tags: ["Shaiva Siddhanta", "Tamil Nadu", "Pradosha", "Sweet"],
    ingredients: [
      "½ cup thick poha (aval)",
      "3 cups whole milk",
      "½ cup jaggery (powdered)",
      "2 tbsp ghee",
      "10 cashews + 1 tbsp raisins",
      "¼ tsp cardamom powder",
      "Pinch of edible camphor (optional)",
    ],
    steps: [
      "Heat 1 tbsp ghee in a heavy pan. Roast the poha for 2 minutes on low until lightly fragrant. Remove.",
      "In the same pan, bring milk to a gentle boil. Add roasted poha. Simmer 8 minutes on low, stirring, until poha softens and the milk thickens.",
      "Melt jaggery in 3 tbsp water. Strain. Switch off the heat under the milk. Pour in the strained jaggery and stir quickly (do this off the heat to prevent the milk from splitting).",
      "Heat the remaining 1 tbsp ghee. Fry cashews until golden, raisins until plump. Add to the payasam.",
      "Stir in cardamom and edible camphor. Serve warm or cold.",
    ],
    tip: "Always switch off the flame before adding jaggery to milk — direct heat curdles the milk. Edible camphor is the temple touch; even a tiny pinch transforms the payasam into prasadam.",
  },
  {
    id: "shaiva-karthigai-pori",
    name: "Karthigai Pori Urundai",
    emoji: "🍡",
    desc: "Puffed rice and jaggery balls offered on Karthigai Deepam — the festival of lamps in Shaiva tradition. Crunchy, warmly spiced with dry ginger, and made in 20 minutes.",
    prepMins: 5,
    cookMins: 15,
    serves: 12,
    energy: "Medium",
    tags: ["Shaiva Siddhanta", "Tamil Nadu", "Karthigai Deepam", "Festival"],
    ingredients: [
      "3 cups puffed rice (pori), lightly toasted",
      "¾ cup jaggery (powdered)",
      "2 tbsp water",
      "1 tbsp ghee",
      "¼ tsp cardamom powder",
      "¼ tsp dry ginger powder (sukku)",
      "2 tbsp grated dry coconut (optional)",
    ],
    steps: [
      "Dry-roast puffed rice in a wide pan for 2 minutes. Tip onto a plate.",
      "In the same pan, combine jaggery and water. Melt on low heat. Strain into a clean pan.",
      "Cook the strained syrup on medium until it reaches the firm-ball stage — drop a little into cold water; it should form a firm, non-sticky ball (about 5–7 minutes).",
      "Add ghee, cardamom and dry ginger powder. Stir for 10 seconds. Switch off.",
      "Quickly add the puffed rice and dry coconut. Mix fast — the syrup hardens within seconds.",
      "Grease your palms with ghee. While still warm, take small portions and shape into firm balls. Cool completely on a plate. Store in an airtight jar for up to a week.",
    ],
    tip: "The firm-ball stage is non-negotiable — under-cooked syrup gives sticky, soggy urundai; over-cooked turns brittle. Test by dropping a drop of syrup into a bowl of cold water every minute towards the end.",
  },
];

const SHAKTA_RECIPES: Recipe[] = [
  {
    id: "shakta-bhog-khichuri",
    name: "Bhoger Khichuri",
    emoji: "🍲",
    desc: "Bengal's sacred Durga Puja bhog khichuri — gobindobhog rice and roasted moong dal cooked with whole spices, ginger and ghee. Served at every pandal during Navami.",
    prepMins: 10,
    cookMins: 30,
    serves: 4,
    energy: "Heavy",
    tags: ["Shakta", "Bengal", "Durga Puja", "Bhog"],
    ingredients: [
      "1 cup gobindobhog rice (or any short-grain aromatic rice)",
      "¾ cup moong dal, dry-roasted to a golden colour",
      "3 tbsp ghee",
      "2 bay leaves",
      "2 dry red chillies",
      "4 cloves + 4 cardamom + 1 inch cinnamon",
      "1 tsp cumin seeds",
      "1 tbsp grated ginger",
      "1 tsp turmeric",
      "1 medium tomato, chopped",
      "½ cup green peas",
      "1 small potato, cubed (optional)",
      "1 tsp sugar",
      "Sendha namak to taste",
      "5 cups hot water",
    ],
    steps: [
      "Wash the gobindobhog rice and roasted moong dal together. Drain.",
      "Heat ghee in a heavy pot. Add bay leaves, red chillies, cloves, cardamom, cinnamon and cumin. Sizzle for 30 seconds.",
      "Add ginger and tomato. Cook 3 minutes until tomato softens.",
      "Add turmeric, sendha namak, sugar and the rice-dal mixture. Stir gently for 2 minutes.",
      "Add hot water, peas and potato. Bring to a rolling boil.",
      "Reduce flame to low. Cover partially and cook for 18–20 minutes, stirring occasionally, until the rice is soft and the khichuri has a creamy, flowing consistency.",
      "Finish with a small spoon of ghee. Offer to the Devi first, then serve with labra and beguni.",
    ],
    tip: "The roasted moong dal (bhaja moog dal) is the soul of bhog khichuri — never skip the dry roasting. The aroma it gives is unlike any other khichdi. Gobindobhog rice is fragrant and short-grained; if unavailable, use kalijira or any aromatic short rice.",
  },
  {
    id: "shakta-payesh",
    name: "Payesh",
    emoji: "🥛",
    desc: "Bengal's slow-cooked rice payesh — gobindobhog rice simmered for an hour in milk and date-palm jaggery (nolen gur in winter, sugar otherwise). Offered on every birthday and Lakshmi Puja.",
    prepMins: 5,
    cookMins: 60,
    serves: 4,
    energy: "Medium",
    tags: ["Shakta", "Bengal", "Lakshmi Puja", "Sweet"],
    ingredients: [
      "¼ cup gobindobhog rice, washed and soaked 30 min",
      "1 litre full-fat milk",
      "½ cup nolen gur (date-palm jaggery) OR ½ cup sugar",
      "1 tbsp ghee",
      "10 cashews + 10 raisins",
      "3 cardamom pods, lightly crushed",
      "1 bay leaf",
    ],
    steps: [
      "In a heavy-bottomed pan, bring milk to a boil with the bay leaf. Reduce to low.",
      "Heat ghee in a small pan. Toss soaked rice in the ghee for 1 minute. Add to the milk.",
      "Simmer the milk-rice on lowest flame for 40–50 minutes, stirring every 5 minutes to prevent sticking. The rice should turn very soft and the milk should reduce to about half.",
      "Add cardamom, cashews and raisins. Cook 5 more minutes.",
      "Switch off the flame. Cool the payesh for 10 minutes.",
      "If using nolen gur: add it now (off the heat) and stir gently. If using sugar: add it 5 minutes before switching off and let it dissolve.",
      "Serve warm in winter, chilled in summer.",
    ],
    tip: "Never add nolen gur to hot milk — it will split. Always cool the payesh first. In Bengal, the saying is 'gur diye phute jay' (jaggery added hot will split it). The slow simmering is what gives Bengali payesh its characteristic creamy depth — there are no shortcuts.",
  },
  {
    id: "shakta-labra",
    name: "Labra",
    emoji: "🥬",
    desc: "The mixed-vegetable bhog of Durga Puja pandals — five vegetables slow-cooked with panch phoron and ginger, no onion or garlic. The perfect partner to bhog khichuri.",
    prepMins: 15,
    cookMins: 25,
    serves: 4,
    energy: "Light",
    tags: ["Shakta", "Bengal", "Durga Puja", "Bhog"],
    ingredients: [
      "1 small pumpkin (½ cup cubed)",
      "1 medium potato, cubed",
      "1 small sweet potato, cubed",
      "1 medium brinjal, cubed",
      "½ cup cauliflower florets",
      "8 long beans, chopped (optional)",
      "2 tbsp mustard oil",
      "1 tsp panch phoron (Bengali 5-spice)",
      "2 dry red chillies",
      "1 bay leaf",
      "1 tbsp grated ginger",
      "½ tsp turmeric",
      "1 tsp sugar",
      "Sendha namak to taste",
      "1 tsp ghee (to finish)",
    ],
    steps: [
      "Heat mustard oil in a wide pan until it shimmers. Reduce to medium.",
      "Add panch phoron, red chillies and bay leaf. Sizzle for 30 seconds.",
      "Add ginger; sauté 30 seconds. Add all vegetables, turmeric, sendha namak and sugar.",
      "Mix well. Cover and cook on low for 18–20 minutes, stirring every 5 minutes. The vegetables will release their own water.",
      "Once the vegetables are very soft and starting to break down, mash a few lightly with the back of a spoon — this gives labra its characteristic homely texture.",
      "Finish with the spoon of ghee. Serve hot with khichuri.",
    ],
    tip: "Panch phoron (cumin, fennel, fenugreek, nigella, mustard) is essential — no substitutes. The brinjal and pumpkin should be cooked until they almost melt; the potatoes and sweet potatoes should hold their shape. That contrast is the dish.",
  },
];

const ISKCON_RECIPES: Recipe[] = [
  {
    id: "iskcon-krishna-khichdi",
    name: "Krishna's Khichdi",
    emoji: "🍚",
    desc: "The temple-style khichdi of every ISKCON kitchen — basmati rice and moong dal cooked together with whole spices, ginger and ghee, no onion or garlic ever. Offered to Krishna before serving.",
    prepMins: 10,
    cookMins: 30,
    serves: 4,
    energy: "Medium",
    tags: ["ISKCON", "Vaishnava", "Prasadam"],
    ingredients: [
      "1 cup basmati rice, washed",
      "½ cup moong dal (split yellow), washed",
      "3 tbsp ghee",
      "1 bay leaf",
      "4 cloves + 4 cardamom + 1 inch cinnamon",
      "1 tsp cumin seeds",
      "1 tbsp grated ginger",
      "2 green chillies, slit",
      "1 tsp turmeric",
      "1 medium tomato, chopped",
      "1 cup mixed vegetables (peas, carrot, cauliflower)",
      "Sendha namak to taste",
      "5 cups hot water",
      "2 tbsp chopped coriander",
    ],
    steps: [
      "Heat ghee in a pressure cooker. Add bay leaf, cloves, cardamom, cinnamon and cumin. Let them sizzle 30 seconds.",
      "Add ginger and green chillies; sauté 30 seconds. Add tomato and turmeric; cook 3 minutes until soft.",
      "Add mixed vegetables and sauté for 2 minutes.",
      "Add washed rice + dal. Stir gently for 2 minutes so they coat with ghee.",
      "Pour in hot water + sendha namak. Stir once. Close the cooker.",
      "Pressure cook for 3 whistles, then turn the flame to lowest and cook 5 more minutes. Switch off and let pressure release naturally.",
      "Open the cooker, finish with coriander and a drizzle of ghee. Offer to Krishna with this prayer: 'Namo Brahmanya Devaya Go Brahmana Hitaya Cha, Jagad Hitaya Krishnaya Govindaya Namo Namah.' Then honor as prasadam.",
    ],
    tip: "ISKCON khichdi is always offered before eating — it is bhoga only when offered to Krishna; once accepted, it becomes prasadam. The whole spices are picked out of one's plate, not chewed.",
  },
  {
    id: "iskcon-suji-halava",
    name: "Suji Halava",
    emoji: "🍮",
    desc: "Sooji halava — the most famous ISKCON prasadam, served at every Sunday Feast. Roasted semolina simmered in ghee, sugar syrup, milk and water, finished with cashews and raisins.",
    prepMins: 5,
    cookMins: 20,
    serves: 6,
    energy: "Heavy",
    tags: ["ISKCON", "Vaishnava", "Sunday Feast", "Prasadam"],
    ingredients: [
      "1 cup sooji (fine semolina)",
      "¾ cup ghee",
      "1 cup sugar",
      "1 cup whole milk + 1.5 cups water",
      "12 cashews, broken",
      "2 tbsp raisins",
      "½ tsp cardamom powder",
      "1 pinch saffron strands",
    ],
    steps: [
      "In a saucepan, combine sugar, milk and water. Bring to a boil; switch off and keep warm.",
      "Heat ghee in a heavy karahi on medium-low. Add sooji.",
      "Roast sooji in ghee, stirring continuously, for 10–12 minutes — it should turn a deep golden colour and smell richly nutty. This step is the soul of the dish; do not rush it.",
      "Add cashews and raisins; stir for 1 minute.",
      "Carefully pour in the warm sugar-milk-water mixture (it will splutter — stand back). Stir vigorously to avoid lumps.",
      "Cook on low heat for 3–4 minutes, stirring, until the halava pulls away from the sides and becomes glossy.",
      "Stir in cardamom and saffron. Offer to Krishna, then serve warm.",
    ],
    tip: "The classic ISKCON ratio is 1 cup sooji : ¾ cup ghee : 1 cup sugar : 2.5 cups liquid. Reducing the ghee changes the dish. The roasting time is the single most important variable — under-roasted sooji halava tastes raw, well-roasted has the depth that ISKCON prasadam is famous for.",
  },
  {
    id: "iskcon-sweet-rice",
    name: "Sweet Rice (Kheer)",
    emoji: "🥛",
    desc: "ISKCON's beloved sweet rice — basmati rice slow-simmered in milk, sugar and saffron until thick and creamy. Offered to Krishna and shared at Govinda's restaurants worldwide.",
    prepMins: 5,
    cookMins: 50,
    serves: 4,
    energy: "Medium",
    tags: ["ISKCON", "Vaishnava", "Sweet", "Prasadam"],
    ingredients: [
      "¼ cup basmati rice, washed and soaked 15 min",
      "1.5 litres full-fat milk",
      "½ cup sugar",
      "10 strands saffron, soaked in 1 tbsp warm milk",
      "½ tsp cardamom powder",
      "12 chopped almonds + 12 chopped pistachios",
      "1 tbsp ghee",
    ],
    steps: [
      "In a heavy-bottomed pot, bring milk to a boil. Reduce to lowest flame.",
      "Drain the rice. In a small pan, heat ghee and toss the rice for 1 minute. Add to the milk.",
      "Simmer the milk and rice on low for 40 minutes, stirring every 5 minutes and scraping the sides — the rice will soften completely and the milk will reduce by about a third.",
      "Add sugar and stir gently until dissolved (about 3 minutes).",
      "Add the saffron-soaked milk, cardamom and chopped nuts. Cook 2 more minutes.",
      "Switch off. The kheer thickens further as it cools.",
      "Offer to Krishna, then serve warm or chilled.",
    ],
    tip: "Use a heavy-bottomed pot — the difference between perfect kheer and burnt kheer is the bottom of your pan. Stir up from the bottom every 5 minutes; do not let any milk stick. Patience over 40 minutes is what creates the silky texture; there is no shortcut.",
  },
];

const PUSHTI_MARG_RECIPES: Recipe[] = [
  {
    id: "pushti-doodh-pak",
    name: "Doodh-pak",
    emoji: "🥛",
    desc: "Gujarat's beloved rice-milk pudding — a Pushti Marg haveli favourite, especially on Sharad Purnima when it is left under the moonlight before being offered to Shrinathji.",
    prepMins: 5,
    cookMins: 50,
    serves: 4,
    energy: "Medium",
    tags: ["Pushti Marg", "Gujarat", "Sharad Purnima", "Bhog"],
    ingredients: [
      "¼ cup basmati rice, washed and soaked 30 min",
      "1.5 litres full-fat milk",
      "½ cup sugar",
      "¼ tsp cardamom powder",
      "Pinch of nutmeg",
      "12 chopped almonds + 1 tbsp chironji (charoli)",
      "10 strands saffron, soaked in warm milk",
      "1 tbsp rose water (optional)",
    ],
    steps: [
      "In a heavy pot, bring milk to a boil. Reduce to lowest flame.",
      "Drain rice. Add to the milk. Simmer on low for 35 minutes, stirring every 5 minutes — the rice should break down completely and the milk thicken to a flowing consistency.",
      "Add sugar; stir until dissolved (3 minutes).",
      "Add saffron milk, cardamom, nutmeg, almonds and chironji. Cook 3 more minutes.",
      "Switch off. Stir in rose water.",
      "Cool to room temperature. On Sharad Purnima it is traditionally placed under the moonlight for an hour before being offered to Shrinathji.",
      "Serve cool — doodh-pak is always served chilled or at room temperature, not hot.",
    ],
    tip: "Doodh-pak is thinner than kheer — it should pour, not hold its shape on the spoon. The chironji (charoli) is what makes it distinctly Gujarati; if unavailable, use chopped pistachios. Always serve cool; hot doodh-pak loses its character.",
  },
  {
    id: "pushti-dudhi-halwa",
    name: "Dudhi Halwa",
    emoji: "🥒",
    desc: "Bottle gourd halwa — slow-cooked in milk and ghee until the lauki melts into a fragrant golden mass. A Pushti Marg fast-day favourite that respects the no-onion, no-garlic, no-grain principle.",
    prepMins: 10,
    cookMins: 45,
    serves: 4,
    energy: "Heavy",
    tags: ["Pushti Marg", "Gujarat", "Fast Day", "Sweet"],
    ingredients: [
      "750 g bottle gourd (dudhi/lauki), peeled and grated",
      "2 cups whole milk",
      "½ cup sugar",
      "4 tbsp ghee",
      "12 cashews, chopped",
      "2 tbsp raisins",
      "¼ tsp cardamom powder",
      "Pinch of saffron",
      "2 tbsp khoya/mawa, crumbled (optional, for richness)",
    ],
    steps: [
      "Squeeze the grated dudhi gently to remove excess water (do not over-squeeze; you want it moist, not dry).",
      "Heat 2 tbsp ghee in a wide heavy pan. Add the grated dudhi. Sauté on medium for 8 minutes until it turns translucent and the raw smell vanishes.",
      "Add milk. Cook on medium-low for 25 minutes, stirring every 3–4 minutes, until the milk evaporates almost completely and the dudhi turns soft and creamy.",
      "Add sugar. Mix and cook another 5 minutes — the sugar will release more water; cook until it dries again.",
      "Add khoya (if using), cardamom, saffron and the remaining 2 tbsp ghee. Stir 3 minutes until glossy.",
      "Heat a tiny pan, fry cashews and raisins in a touch of ghee, and stir into the halwa.",
      "Offer to Shrinathji. Serve warm.",
    ],
    tip: "The single biggest mistake is rushing the milk-evaporation stage — it takes a full 25 minutes of patient stirring. The halwa is ready when ghee starts separating around the edges. Khoya is optional but transforms the texture into haveli-quality.",
  },
  {
    id: "pushti-singoda-sheera",
    name: "Singoda Atta Sheera",
    emoji: "🍮",
    desc: "Water-chestnut flour halwa — the perfect Pushti Marg fast-day sweet. Singoda atta is grain-free and vrat-pure, ready in 12 minutes and deeply satisfying.",
    prepMins: 2,
    cookMins: 12,
    serves: 3,
    energy: "Medium",
    tags: ["Pushti Marg", "Gujarat", "Fast Day", "Sweet"],
    ingredients: [
      "½ cup singoda atta (water-chestnut flour)",
      "4 tbsp ghee",
      "½ cup sugar (or jaggery)",
      "1.5 cups hot water or warm milk",
      "10 cashews, chopped",
      "1 tbsp raisins",
      "¼ tsp cardamom powder",
      "Pinch of saffron",
    ],
    steps: [
      "Heat ghee in a heavy pan on low. Add singoda atta.",
      "Roast, stirring continuously, for 6–7 minutes until the flour turns a shade darker and gives a sweet, nutty aroma.",
      "Add cashews and raisins; stir 30 seconds.",
      "Carefully pour in the hot water or milk (it will splutter — stand back). Stir vigorously to break lumps.",
      "Add sugar. Cook on low, stirring, for 3 minutes until the sheera thickens and pulls away from the sides.",
      "Stir in cardamom and saffron. Offer to Shrinathji. Serve warm.",
    ],
    tip: "Singoda atta has a tendency to lump quickly — stir without pause when adding the liquid. Using warm milk instead of water gives a richer, creamier sheera and is the haveli way; water keeps it lighter.",
  },
];

const SIKH_RECIPES: Recipe[] = [
  {
    id: "langar-dal",
    name: "Langar Dal",
    emoji: "🫘",
    desc: "The heart of every Gurdwara kitchen — a simple, nourishing lentil dal cooked in large quantities and served freely to all.",
    prepMins: 10,
    cookMins: 30,
    serves: 4,
    energy: "Medium",
    tags: ["Sikh Langar", "Gurpurab", "Everyday"],
    ingredients: [
      "1 cup chana dal (split chickpeas) or toor dal, soaked 30 min",
      "1 medium onion, finely chopped",
      "2 medium tomatoes, chopped",
      "1 tsp ginger-garlic paste",
      "1 tsp cumin seeds",
      "½ tsp turmeric",
      "1 tsp coriander powder",
      "½ tsp red chilli powder",
      "Salt to taste",
      "2 tbsp ghee or vegetable oil",
      "Fresh coriander to garnish",
    ],
    steps: [
      "Pressure cook the soaked dal with 2.5 cups water, turmeric, and salt for 4–5 whistles until completely soft. Mash lightly.",
      "Heat ghee in a pan. Add cumin seeds and let them splutter.",
      "Add onions and cook on medium heat for 8–10 minutes until golden brown.",
      "Add ginger-garlic paste and cook for 2 minutes. Add tomatoes and cook until the oil separates — about 8 minutes.",
      "Add coriander powder and red chilli. Mix well for 1 minute.",
      "Pour the cooked dal into the pan. Stir and simmer for 10 minutes so the flavours merge.",
      "Adjust salt and consistency (add water if too thick). Garnish with coriander. Serve with roti.",
    ],
    tip: "In the Langar, dal is cooked slowly in large degs (cauldrons) with gentle stirring. At home, the key is to cook the onions and tomatoes until completely broken down — this is what gives langar dal its depth.",
  },
  {
    id: "kadah-prasad",
    name: "Kadah Prasad",
    emoji: "🙏",
    desc: "The sacred halwa offered in every Gurdwara — made from equal parts atta, ghee, sugar, and water. Simple, sacred, and deeply comforting.",
    prepMins: 5,
    cookMins: 20,
    serves: 6,
    energy: "Heavy",
    tags: ["Sikh Prasad", "Gurpurab", "Sacred Offering"],
    ingredients: [
      "1 cup whole wheat flour (atta)",
      "1 cup ghee",
      "1 cup sugar",
      "3 cups water",
    ],
    steps: [
      "Boil 3 cups water with 1 cup sugar in a pot until the sugar dissolves completely. Keep this syrup warm on a low flame.",
      "In a separate heavy-bottomed pan (karahi), melt ghee on medium heat.",
      "Add the atta to the ghee all at once. Stir continuously and vigorously — do not stop or it will burn.",
      "Roast the atta in ghee on medium-low flame for 15–20 minutes, stirring non-stop, until it turns a deep golden colour and smells nutty and sweet.",
      "Very carefully pour the warm sugar syrup into the atta-ghee (it will splutter — stand back). Stir quickly and continuously.",
      "Cook for 2–3 minutes until the halwa pulls away from the sides of the pan and comes together into a smooth, shiny mass.",
      "The Kadah Prasad is ready. Traditionally offered with both hands cupped together.",
    ],
    tip: "The equal ratio of atta, ghee, and sugar is essential — this is the traditional Langar formula. Do not reduce ghee. The continuous stirring during roasting is what makes Kadah Prasad smooth; stopping even for a minute causes lumps.",
  },
  {
    id: "aloo-gobhi-langar",
    name: "Langar Aloo Gobhi",
    emoji: "🥔",
    desc: "Simple, dry-cooked potato and cauliflower sabzi — the most common vegetable dish served in the Gurdwara langar.",
    prepMins: 10,
    cookMins: 20,
    serves: 3,
    energy: "Medium",
    tags: ["Sikh Langar", "Gurpurab", "Everyday"],
    ingredients: [
      "1 medium cauliflower, cut into florets",
      "3 medium potatoes, peeled and cubed",
      "1 medium onion, sliced",
      "2 tomatoes, chopped",
      "1 tsp ginger, grated",
      "1 tsp cumin seeds",
      "1 tsp turmeric",
      "1 tsp coriander powder",
      "½ tsp red chilli powder",
      "Salt to taste",
      "3 tbsp oil",
      "Fresh coriander",
    ],
    steps: [
      "Heat oil in a wide pan. Add cumin seeds; let them splutter.",
      "Add onions and cook for 5 minutes until softened. Add ginger and cook for 1 minute.",
      "Add tomatoes and all spices. Cook until the tomatoes break down and oil surfaces — about 6 minutes.",
      "Add potatoes. Stir to coat in the masala. Cover and cook for 5 minutes.",
      "Add cauliflower florets. Stir gently. Cover and cook on low heat for 10 minutes until both vegetables are tender.",
      "Uncover and cook for 2 more minutes to dry out any extra moisture. Garnish with coriander.",
    ],
    tip: "Don't add water — the vegetables release their own moisture. Keeping the pan covered on low heat is the key to soft, well-cooked sabzi without burning.",
  },
  {
    id: "langar-chole",
    name: "Langar Chole",
    emoji: "🍲",
    desc: "Rich, spiced chickpea curry — one of the most beloved dishes in Sikh Langar. Filling, protein-rich, and deeply flavourful.",
    prepMins: 10,
    cookMins: 35,
    serves: 4,
    energy: "Heavy",
    tags: ["Sikh Langar", "Gurpurab", "Baisakhi"],
    ingredients: [
      "2 cups kabuli chana (white chickpeas), soaked overnight",
      "2 medium onions, finely chopped",
      "3 tomatoes, pureed",
      "1 tbsp ginger-garlic paste",
      "1 tsp cumin seeds",
      "1 tsp chole masala (or mix of amchur, cumin, coriander)",
      "1 tsp turmeric",
      "1 tsp red chilli powder",
      "1 tsp coriander powder",
      "1 tsp garam masala",
      "Salt to taste",
      "3 tbsp oil",
      "Fresh coriander and a squeeze of lemon",
    ],
    steps: [
      "Pressure cook the soaked chickpeas with 3 cups water and ½ tsp salt for 5–6 whistles until completely soft but not mushy.",
      "Heat oil in a kadai. Add cumin seeds. Once they splutter, add onions and cook on medium heat for 12 minutes until deep golden.",
      "Add ginger-garlic paste and cook for 2 minutes. Add pureed tomatoes and all spices except garam masala.",
      "Cook the masala for 10–12 minutes, stirring, until the oil separates from the masala and it turns deep red.",
      "Add the cooked chickpeas with their water. Mix well. Simmer for 15 minutes until the gravy thickens.",
      "Add garam masala. Stir and cook for 2 more minutes. Finish with lemon juice and coriander.",
    ],
    tip: "The deep golden onion is the secret. Resist the temptation to rush — golden-brown onions take at least 12 minutes and create the flavour base of the entire dish. Any shortcut here will be tasted.",
  },
  {
    id: "langar-roti",
    name: "Langar Roti",
    emoji: "🫓",
    desc: "Simple whole wheat rotis made in enormous quantities in the Gurdwara. At home, these thin, soft rotis are perfected by patience and practice.",
    prepMins: 15,
    cookMins: 20,
    serves: 4,
    energy: "Medium",
    tags: ["Sikh Langar", "Gurpurab", "Everyday"],
    ingredients: [
      "2 cups whole wheat flour (atta)",
      "½ tsp salt",
      "Water as needed (about ¾ cup)",
      "A little ghee for spreading",
    ],
    steps: [
      "Mix atta and salt in a bowl. Add water little by little, kneading until you get a soft, smooth, non-sticky dough. It should bounce back when pressed.",
      "Cover with a damp cloth and rest for 15–20 minutes — this makes the dough easier to roll.",
      "Divide into 10–12 equal balls. Dust a ball lightly with flour and roll into a thin, even circle (about 6 inches in diameter).",
      "Place on a hot tawa (griddle) on medium-high heat. Cook for 45 seconds until small bubbles appear.",
      "Flip and cook for 30 seconds. Then place directly on the flame and let it puff up (30 seconds). Flip once on the flame.",
      "Remove and brush lightly with ghee. Stack in a clean cloth to stay soft.",
    ],
    tip: "Even thickness across the roti is the hardest part — a thicker centre means it won't cook evenly. In the Langar, skilled sewadars make hundreds of rotis with the same motion; practice and repetition is the only teacher.",
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

// Maps the user's selected tradition to its regional recipe pool, the
// section heading, and the regional label. Returning null means "no
// regional pool" — only universal recipes will render. Mirrors the
// regional FoodList gating in WhatToEat.tsx so users always see their
// own regional recipes layered below the universal ones.
function getRegionalRecipes(tradition: string): { pool: Recipe[]; title: string } | null {
  switch (tradition) {
    case "Lingayat":
      return { pool: LINGAYAT_RECIPES, title: "Lingayat Traditional Recipes (Karnataka)" };
    case "Warkari":
      return { pool: WARKARI_RECIPES, title: "Warkari Traditional Recipes (Maharashtra)" };
    case "SriVaishnava":
      return { pool: SRI_VAISHNAVA_RECIPES, title: "Sri Vaishnava Traditional Recipes (Tamil Nadu)" };
    case "ShaivaSiddhanta":
      return { pool: SHAIVA_SIDDHANTA_RECIPES, title: "Shaiva Siddhanta Traditional Recipes (Tamil Nadu)" };
    case "Shakta":
      return { pool: SHAKTA_RECIPES, title: "Shakta Traditional Recipes (Bengal)" };
    case "ISKCON":
      return { pool: ISKCON_RECIPES, title: "ISKCON Prasadam Recipes (Vaishnava)" };
    case "PushtiMarg":
      return { pool: PUSHTI_MARG_RECIPES, title: "Pushti Marg Haveli Recipes (Gujarati Vaishnav)" };
    default:
      return null;
  }
}

// Recipes from the universal RECIPES pool that Jains do not eat — they
// rely on root vegetables (potato, sweet potato), which Jain dietary
// principles avoid year-round (uprooting harms micro-organisms in the
// soil). These dishes remain visible to Hindu users (where they are
// traditional vrat foods like Vrat Wale Aloo and Shakarkand Chaat),
// but are filtered out for Jain users only.
const JAIN_EXCLUDED_RECIPE_IDS = new Set<string>([
  "aloo-jeera",          // Vrat Wale Aloo — potato (root)
  "sweet-potato-chaat",  // Shakarkand Chaat — sweet potato (root)
]);

export default function Recipes() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"All" | "Light" | "Medium" | "Heavy">("All");
  const tradition = getUserTradition();
  const isSikh = tradition === "Sikh";
  const isJain = tradition === "Jain";
  // Universal pool, with root-vegetable dishes filtered out for Jain users.
  const universalPool = isJain
    ? RECIPES.filter((r) => !JAIN_EXCLUDED_RECIPE_IDS.has(r.id))
    : RECIPES;
  const recipePool = isSikh ? SIKH_RECIPES : universalPool;
  const filtered = filter === "All" ? recipePool : recipePool.filter((r) => r.energy === filter);
  // Regional recipe section — gated on the user's selected tradition,
  // shown below the universal RECIPES list. Sikh users get their
  // dedicated SIKH_RECIPES pool only and skip the regional layer.
  const regional = isSikh ? null : getRegionalRecipes(tradition);
  const regionalFiltered = regional
    ? (filter === "All" ? regional.pool : regional.pool.filter((r) => r.energy === filter))
    : [];

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
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isSikh ? "Langar Recipes" : "Fasting Recipes"}
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {isSikh
                ? `${SIKH_RECIPES.length} langar-style recipes — simple & nourishing`
                : regional
                  ? `${RECIPES.length} universal + ${regional.pool.length} ${tradition === "PushtiMarg" ? "Pushti Marg" : tradition === "SriVaishnava" ? "Sri Vaishnava" : tradition === "ShaivaSiddhanta" ? "Shaiva Siddhanta" : tradition} recipes`
                  : `${RECIPES.length} traditional recipes for fast days`}
            </p>
          </div>
        </div>

        {/* Intro */}
        <div
          className="rounded-2xl px-5 py-4 mb-5"
          style={isSikh
            ? { background: "#EFF6FF", border: "1px solid #BFDBFE" }
            : { background: "rgba(212,160,23,0.09)", border: "1px solid rgba(212,160,23,0.18)" }
          }
        >
          <p className="text-sm leading-relaxed" style={{ color: isSikh ? "#1E3A8A" : "#92400E" }}>
            {isSikh
              ? <><span className="font-semibold">Gurdwara langar recipes</span> — simple vegetarian food prepared with love and served freely to all. Regular salt and everyday vegetables are used. No fasting restrictions apply.</>
              : <>All recipes use only <span className="font-semibold">vrat-approved ingredients</span> — sendha namak instead of regular salt, no onion or garlic, and only fasting-safe flours and grains.</>
            }
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
                  ? isSikh
                    ? { background: "linear-gradient(135deg, #001A6E, #003DA5)", color: "white" }
                    : { background: "linear-gradient(135deg, #E07B2A, #C86B1A)", color: "white" }
                  : isSikh
                    ? { background: "rgba(0,61,165,0.08)", color: "#003DA5" }
                    : { background: "rgba(212,160,23,0.10)", color: "#92400E" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 && regionalFiltered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">No recipes in this energy category.</p>
          </div>
        )}

        {/* Universal recipes */}
        {filtered.length > 0 && regional && (
          <div className="mb-2">
            <h2 className="font-serif text-base font-semibold text-foreground mb-3 px-1">
              Universal Fasting Recipes
            </h2>
          </div>
        )}
        {filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}

        {/* Tradition-specific regional recipes — shown below the universal
            list so the user always sees their own regional cuisine layered
            beneath the pan-Indian fasting basics. Section is gated on the
            user's selected tradition (not the active vrat). */}
        {regional && regionalFiltered.length > 0 && (
          <>
            <div className="h-px bg-border my-5" />
            <div className="mb-2">
              <h2 className="font-serif text-base font-semibold text-foreground mb-3 px-1">
                {regional.title}
              </h2>
            </div>
            {regionalFiltered.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </>
        )}

        {/* Back to Food Guide button — so users are never stuck at the bottom */}
        <button
          onClick={() => setLocation("/eat")}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-95 border"
          style={isSikh
            ? { background: "#EFF6FF", color: "#003DA5", borderColor: "#BFDBFE" }
            : { background: "rgba(224,123,42,0.08)", color: "#C86B1A", borderColor: "rgba(212,160,23,0.20)" }
          }
          data-testid="back-to-food-guide"
        >
          <ChevronLeft size={16} />
          Back to {isSikh ? "Langar Guide" : "Food Guide"}
        </button>

        <div className="mt-4">
          <PageFooter />
        </div>
      </div>
    </div>
  );
}
