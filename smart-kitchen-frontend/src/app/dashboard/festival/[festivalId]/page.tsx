"use client";

import { useParams, useRouter } from "next/navigation";
// Mock data - will be replaced with API data
const mockFestivals = [
  {
    id: "diwali",
    name: "Diwali",
    date: "2024-11-12",
    icon: "🪔",
    color: "bg-orange-500",
    description: "Festival of Lights.",
    tags: ["Sweets", "Snacks", "Cleaning", "Guests"],
  },
];

const mockFestivalTemplates = [
  {
    id: "1",
    festivalId: "diwali",
    name: "Besan",
    qty: "1kg",
    category: "Ingredients",
  },
];

const mockRecipes = [
  {
    id: "1",
    name: "Gulab Jamun",
    time: "45 min",
    ingredients: 6,
    available: true,
    cuisine: "Indian",
    img: "🍯",
    tags: ["sweet", "festival"],
  },
];
import { motion } from "framer-motion";

export default function FestivalDetail() {
  const { festivalId } = useParams();
  const router = useRouter();

  const festival = mockFestivals.find((f) => f.id === festivalId);

  if (!festival) return <p>Festival not found</p>;

  const items = mockFestivalTemplates.filter((t) => t.festivalId === festivalId);
  const recipes = mockRecipes.slice(0, 3); // top 3 festival dish suggestions

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 text-4xl rounded-2xl flex items-center justify-center text-white ${festival.color}`}>
          {festival.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{festival.name}</h2>
          <p className="text-muted-foreground">{festival.date}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{festival.description}</p>

      {/* Shopping List Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Festival Shopping List</h3>
        <div className="border rounded-xl p-4 space-y-2">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between">
              <span className="text-sm">{i.name}</span>
              <span className="text-xs text-muted-foreground">
                {i.qty || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipes Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Suggested Recipes</h3>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {recipes.map((r) => (
            <motion.div
              key={r.id}
              className="min-w-[180px] p-4 rounded-xl border bg-card shadow-sm cursor-pointer hover:shadow-md"
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push("/dashboard/recipes")}
            >
              <div className="text-4xl mb-2">{r.img}</div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.time}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
