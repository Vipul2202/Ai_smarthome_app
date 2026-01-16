"use client";

// Mock data for seasonal ingredients - will be replaced with API data
const mockSeasonalIngredients = [
  {
    id: "s1",
    name: "Carrot",
    season: "Winter",
    icon: "🥕",
    uses: ["Gajar Halwa", "Soup", "Salad"],
  },
  {
    id: "s2",
    name: "Spinach",
    season: "Winter",
    icon: "🌿",
    uses: ["Palak Paneer", "Smoothies"],
  },
  {
    id: "s3",
    name: "Mango",
    season: "Summer",
    icon: "🥭",
    uses: ["Aamras", "Juice", "Pickle"],
  },
  {
    id: "s4",
    name: "Corn",
    season: "Monsoon",
    icon: "🌽",
    uses: ["Bhutta", "Soup"],
  },
];
import { motion } from "framer-motion";

export default function SeasonalIngredientsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Seasonal Ingredients</h2>

      {["Winter", "Summer", "Monsoon"].map((season) => {
        const items = mockSeasonalIngredients.filter((i) => i.season === season);
        return (
          <div key={season}>
            <h3 className="text-lg font-semibold mb-2">{season}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="p-3 border rounded-xl hover:bg-muted transition"
                >
                  <div className="text-3xl">{i.icon}</div>
                  <p className="font-medium mt-1">{i.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {i.uses.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
