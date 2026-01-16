"use client"

import { motion } from "framer-motion"
import {
  Clock,
  ChefHat,
  Calendar,
  Sparkles,
  Plus,
  Search,
  TrendingUp,
  Heart,
  ArrowRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRecipes } from "@/hooks/use-recipes"
import { useInventory } from "@/hooks/use-inventory"
import { useState, useMemo, useEffect } from "react"
import { useHapticFeedback } from "@/lib/haptics"
import { useRouter } from "next/navigation"

type RecipeFilter = "all" | "quick" | "easy" | "available"

interface Ingredient {
  name: string
  amount: string
  available: boolean
}

interface Recipe {
  id: string
  title?: string
  name?: string
  img?: string
  available?: boolean
  prepTime?: string
  time?: string
  ingredients?: Ingredient[]
  ingredientCount?: number
  tags?: string[]
  cuisine?: string
  isFavorite?: boolean
  isAIGenerated?: boolean
  missingCount?: number
  availableCount?: number
  steps?: string[]
  calories?: number
  difficulty?: string
  servings?: number
}

export function RecipesTab() {
  const router = useRouter();
  const haptic = useHapticFeedback();
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>("all")
  const [query, setQuery] = useState("")
  const { recipes: savedRecipes, loading, error, stats, generateAIRecipesFromInventory } = useRecipes()
  const { items: inventoryItems, loading: inventoryLoading } = useInventory()
  
  // State for AI-generated recipes
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Generate AI recipes when inventory changes
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') return;
    
    const generateAIRecipes = async () => {
      if (!inventoryItems || inventoryItems.length === 0) {
        setAiRecipes([])
        return
      }

      setAiLoading(true)
      try {
        console.log('Generating AI recipes based on inventory:', inventoryItems.length, 'items')
        const generatedRecipes = await generateAIRecipesFromInventory(inventoryItems)
        setAiRecipes(generatedRecipes)
        console.log('Generated', generatedRecipes.length, 'AI recipes')
      } catch (error) {
        console.error('Failed to generate AI recipes:', error)
        setAiRecipes([])
      } finally {
        setAiLoading(false)
      }
    }

    // Only regenerate if inventory actually changed (not just reference)
    if (inventoryItems && inventoryItems.length > 0) {
      // Debounce the AI generation to avoid too many calls
      const timeoutId = setTimeout(generateAIRecipes, 5000) // Increased debounce time to 5 seconds
      return () => clearTimeout(timeoutId)
    } else {
      setAiRecipes([])
    }
  }, [inventoryItems?.length, refreshKey]) // Removed generateAIRecipesFromInventory from dependencies to prevent loops

  // Combine saved recipes (favorites) with AI-generated recipes
  const allRecipes = useMemo(() => {
    const combined = [...savedRecipes, ...aiRecipes]
    // Use a more efficient deduplication that doesn't cause re-renders
    const uniqueRecipes = combined.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    )
    return uniqueRecipes;
  }, [savedRecipes, aiRecipes])

  // Check ingredient availability based on inventory
  const checkIngredientAvailability = (ingredientName: string): boolean => {
    if (!inventoryItems || inventoryItems.length === 0) return false;
    
    return inventoryItems.some((item: any) => {
      const itemName = item.name?.toLowerCase() || '';
      const searchName = ingredientName.toLowerCase();
      
      // Check for exact match or partial match
      return itemName.includes(searchName) || searchName.includes(itemName);
    });
  };

  // Helper function to get emoji based on cuisine
  const getCuisineEmoji = (cuisine?: string) => {
    const cuisineEmojis: { [key: string]: string } = {
      'Indian': '🍛',
      'Asian': '🥢',
      'Chinese': '🥟',
      'Italian': '🍝',
      'Mexican': '🌮',
      'Mediterranean': '🫒',
      'International': '🍽️',
      'American': '🍔'
    };
    return cuisineEmojis[cuisine || 'International'] || '🍽️';
  };

  // Enhance recipes with real-time inventory data
  const enhancedRecipes = useMemo(() => {
    return allRecipes.map((recipe: Recipe) => {
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return {
          ...recipe,
          available: false,
          missingCount: 0,
          availableCount: 0,
          img: recipe.img || getCuisineEmoji(recipe.cuisine), // Ensure icon is preserved
        };
      }

      // Update ingredient availability based on current inventory
      const updatedIngredients = recipe.ingredients.map((ing: Ingredient) => ({
        ...ing,
        available: checkIngredientAvailability(ing.name),
      }));

      const availableCount = updatedIngredients.filter(ing => ing.available).length;
      const totalCount = updatedIngredients.length;
      const missingCount = totalCount - availableCount;

      return {
        ...recipe,
        ingredients: updatedIngredients,
        available: missingCount === 0,
        missingCount,
        availableCount,
        img: recipe.img || getCuisineEmoji(recipe.cuisine), // Ensure icon is preserved
      };
    });
  }, [allRecipes, inventoryItems]);

  if (loading || inventoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl rounded-2xl p-8 max-w-md mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-sm font-medium text-foreground mb-2">Loading your recipe collection...</p>
            <p className="text-xs text-muted-foreground">
              Syncing with inventory data
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4 bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl rounded-2xl p-8 max-w-md mx-4">
            <ChefHat className="w-12 h-12 text-orange-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Unable to load recipes</p>
              <p className="text-xs text-muted-foreground">Don't worry, you can still generate new recipes!</p>
            </div>
            <Button
              onClick={() => {
                haptic.light();
                router.push("/dashboard/recipes/generate");
              }}
              className="bg-orange-500 hover:bg-orange-600 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recipes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredRecipes = enhancedRecipes.filter((r: any) => {
    const matchesQuery =
      !query ||
      r.title?.toLowerCase().includes(query.toLowerCase()) ||
      r.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(query.toLowerCase())

    if (activeFilter === "available") return r.available && matchesQuery
    if (activeFilter === "quick") return r.tags?.includes("quick") && matchesQuery
    if (activeFilter === "easy") return r.tags?.includes("easy") && matchesQuery
    return matchesQuery
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-mobile-xl sm:text-2xl font-bold tracking-tight">AI Recipe Assistant</h2>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl shadow-xl">
                  {aiLoading ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border border-orange-600 dark:border-orange-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-mobile-sm sm:text-base">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">{enhancedRecipes.filter((r: Recipe) => r.available).length}</span>
                </div>
                <span className="text-muted-foreground">ready</span>
              </div>
            </div>
            <p className="text-mobile-sm sm:text-base text-muted-foreground leading-relaxed">
              {aiLoading 
                ? "Generating personalized recipes from your inventory..." 
                : "Discover personalized recipes based on your available ingredients"
              }
            </p>
            
            {/* Mobile Search */}
            <div className="flex gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search recipes or ingredients..."
                  className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-4 rounded-xl border border-gray-200/40 dark:border-slate-700/40 bg-white dark:bg-slate-900 text-mobile-base sm:text-lg font-medium text-foreground shadow-xl
                             placeholder:text-muted-foreground/70
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50
                             focus-visible:border-orange-500/50 focus-visible:shadow-2xl
                             transition-all duration-200"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  haptic.light();
                  setRefreshKey(prev => prev + 1);
                }}
                disabled={aiLoading}
                className="h-12 sm:h-14 px-4 shrink-0 border border-gray-200/40 dark:border-slate-700/40 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-xl"
                title="Refresh AI recipes"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${aiLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-spacing">
        {/* Hero CTA */}
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
          <div className="w-full overflow-hidden relative bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-xl shadow-xl cursor-pointer group">
            <div className="relative p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="shrink-0">
                  <div className="p-4 sm:p-5 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl">
                    <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left text-white space-y-3 sm:space-y-4">
                  <h3 className="text-mobile-xl sm:text-2xl font-bold">
                    What can I cook today?
                  </h3>
                  <p className="text-orange-50 text-mobile-sm sm:text-base max-w-lg mx-auto sm:mx-0">
                    Get personalized recipe suggestions based on ingredients in your kitchen.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        haptic.medium();
                        router.push("/dashboard/recipes/generate");
                      }}
                      className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 hover:border-white/40 font-semibold shadow-xl group/cta text-mobile-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 transition-all duration-200"
                    >
                      Get suggestions
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover/cta:translate-x-1 transition-transform" />
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-mobile-xs sm:text-sm text-orange-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                      Uses your live inventory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main layout - Mobile First Responsive */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recipes list - Always visible first on mobile */}
          <div className="section-spacing">
            {/* Filters row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  Recommended for you
                </h3>
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  Based on inventory
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                <div className="flex gap-1.5">
                  {[
                    { id: "all" as RecipeFilter, label: "All" },
                    { id: "available" as RecipeFilter, label: "Ready now" },
                    { id: "quick" as RecipeFilter, label: "< 20 min" },
                    { id: "easy" as RecipeFilter, label: "Easy" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        haptic.selection();
                        setActiveFilter(f.id);
                      }}
                      className={[
                        "px-2 sm:px-2.5 py-1 rounded-full border text-[10px] sm:text-xs transition-colors",
                        activeFilter === f.id
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-border text-muted-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredRecipes.length === 0 ? (
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
                <CardContent className="p-4 sm:p-6 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
                  <p>No recipes match these filters yet.</p>
                  <p>Try changing filters or adding more items to your inventory.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="subsection-spacing">
                {filteredRecipes.map((recipe: Recipe, index: number) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <RecipeCard recipe={recipe} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile-Responsive Sidebar Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Inventory Status */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Inventory Status</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {inventoryItems?.length || 0} items in your kitchen
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                  <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {enhancedRecipes.filter((r: Recipe) => r.available).length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Ready to cook</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                      {enhancedRecipes.filter((r: Recipe) => !r.available && r.missingCount && r.missingCount <= 2).length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Almost ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal planner */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Weekly meal planner</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Plan your meals for the week ahead.
                    </p>
                  </div>
                </div>
                <Button className="w-full text-xs sm:text-sm" variant="outline" size="sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Create plan
                </Button>
              </CardContent>
            </Card>

            {/* Browse cuisine */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardContent className="p-3 sm:p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  Browse cuisines
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Indian", emoji: "🍛" },
                    { name: "Chinese", emoji: "🥢" },
                    { name: "Italian", emoji: "🍝" },
                    { name: "Mexican", emoji: "🌮" },
                  ].map((cuisine) => (
                    <motion.div key={cuisine.name} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        className="w-full h-14 sm:h-16 flex-col gap-1 hover:bg-muted/60 text-xs"
                      >
                        <span className="text-lg sm:text-2xl">{cuisine.emoji}</span>
                        <span className="font-medium text-[10px] sm:text-xs">{cuisine.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardContent className="p-3 sm:p-5">
                <h3 className="font-semibold text-sm mb-3 sm:mb-4">Your activity</h3>
                <div className="space-y-2 sm:space-y-3">
                  <StatRow label="Saved recipes" value={stats.total} />
                  <StatRow
                    label="Ready to cook"
                    value={enhancedRecipes.filter((r: Recipe) => r.available).length}
                    color="text-emerald-600 dark:text-emerald-400"
                  />
                  <StatRow
                    label="Favorites"
                    value={
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <Heart className="w-3 h-3 fill-current" />
                        {stats.favorites}
                      </span>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const haptic = useHapticFeedback();
  const { saveRecipeAsFavorite, toggleRecipeFavorite } = useRecipes();
  const [isSaving, setIsSaving] = useState(false);

  const handleViewRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    
    // If it's an AI-generated recipe, store it in sessionStorage for the detail page
    if (recipe.isAIGenerated) {
      sessionStorage.setItem(recipe.id, JSON.stringify(recipe));
    }
    
    router.push(`/dashboard/recipes/${recipe.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    setIsSaving(true);

    try {
      if (recipe.isAIGenerated && !recipe.isFavorite) {
        // Save AI-generated recipe to database as favorite
        console.log('Saving AI recipe as favorite:', recipe.title);
        await saveRecipeAsFavorite(recipe);
      } else if (!recipe.isAIGenerated) {
        // Toggle favorite status for existing saved recipe
        console.log('Toggling favorite for saved recipe:', recipe.id);
        await toggleRecipeFavorite(recipe.id);
      }
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMissingToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    // TODO: Add missing ingredients to shopping list
    console.log('Add missing ingredients to cart for recipe:', recipe.id);
    // router.push('/dashboard/shopping/create');
  };

  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
      <Card 
        className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group overflow-hidden"
        onClick={handleViewRecipe}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Icon */}
            <div className="relative w-16 sm:w-20 lg:w-24 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 flex items-center justify-center border-r border-border/30">
              <div className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">
                {recipe.img || "🍽️"}
              </div>
              {recipe.available && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse shadow-sm" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-2.5 sm:p-3 lg:p-4 flex flex-col justify-between min-w-0">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm lg:text-base leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    {recipe.title || recipe.name}
                  </h4>
                  <div className="flex gap-1 shrink-0">
                    {recipe.isAIGenerated && (
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-0 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5">
                        ✨ AI
                      </Badge>
                    )}
                    {recipe.available ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-0 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5">
                        ✓ Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-0 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 whitespace-nowrap">
                        {recipe.missingCount} missing
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {recipe.prepTime || recipe.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {recipe.ingredients?.length || recipe.ingredientCount || 0} items
                  </span>
                  {recipe.availableCount && recipe.ingredients && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {recipe.availableCount}/{recipe.ingredients.length}
                    </span>
                  )}
                  {recipe.tags?.includes("healthy") && (
                    <Badge variant="outline" className="text-[9px] sm:text-[10px]">
                      Healthy
                    </Badge>
                  )}
                </div>

                {/* Missing ingredients indicator */}
                {!recipe.available && recipe.missingCount && recipe.missingCount > 0 && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Missing {recipe.missingCount} ingredient{recipe.missingCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                <Button
                  size="sm"
                  onClick={handleViewRecipe}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white shadow-sm h-6 sm:h-8 text-[10px] sm:text-xs"
                >
                  View recipe
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
                </Button>
                {!recipe.available && recipe.missingCount && recipe.missingCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMissingToCart}
                    className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={isSaving}
                  className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 p-0 transition-colors ${
                    recipe.isFavorite 
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                      : recipe.isAIGenerated
                      ? 'hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400'
                      : 'hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : recipe.isAIGenerated && !recipe.isFavorite ? (
                    <span className="text-[8px] sm:text-[10px] font-bold">+</span>
                  ) : (
                    <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string
  value: React.ReactNode
  color?: string
}) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color || ""}`}>{value}</span>
    </div>
  )
}