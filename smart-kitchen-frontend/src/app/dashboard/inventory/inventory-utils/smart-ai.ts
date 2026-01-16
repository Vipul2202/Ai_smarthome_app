// ----------------------------------------------
// NEW smartPredict (accepts full formData object)
// ----------------------------------------------
export function smartPredict(input: {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  location?: string;
}) {
  const n = input.name.toLowerCase().trim();

  // ---- CATEGORY ----
  let category = input.category || "Pantry";

  if (["milk", "cheese", "butter", "yogurt", "curd"].some(w => n.includes(w)))
    category = "Dairy";

  if (["tomato", "carrot", "spinach", "cabbage"].some(w => n.includes(w)))
    category = "Vegetables";

  if (["chicken", "mutton", "fish", "egg"].some(w => n.includes(w)))
    category = "Meat";

  if (["oil", "ghee"].some(w => n.includes(w)))
    category = "Cooking";

  // ---- EMOJI ----
  const emoji =
    category === "Dairy" ? "🥛" :
    category === "Vegetables" ? "🥦" :
    category === "Meat" ? "🍗" :
    category === "Cooking" ? "🛢️" :
    "🥫";

  // ---- LOCATION ----
  const location =
    input.location ||
    (category === "Dairy" ? "Fridge" :
     category === "Vegetables" ? "Fridge" :
     category === "Meat" ? "Freezer" :
     "Pantry");

  // ---- EXPIRY ----
  const expiryDays =
    category === "Dairy" ? 7 :
    category === "Vegetables" ? 5 :
    category === "Meat" ? 90 :
    180;

  const expiry = new Date(Date.now() + expiryDays * 86400000)
    .toISOString()
    .slice(0, 10);

  // ---- UNITS ----
  let unit = input.unit || "pcs";
  if (category === "Dairy") unit = "litre";
  if (category === "Vegetables") unit = "kg";
  if (category === "Meat") unit = "kg";

  return {
    category,
    emoji,
    location,
    expiry,
    unit,

    // EXTRA: include original input back (optional)
    original: input
  };
}
