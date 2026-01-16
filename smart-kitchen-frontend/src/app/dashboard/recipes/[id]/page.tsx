"use client"

import { useState, useEffect, use, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ChefHat, 
  Clock, 
  Users, 
  Zap,
  Heart,
  Share2,
  BookOpen,
  Sparkles,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useRecipes } from '@/hooks/use-recipes'
import { useInventory } from '@/hooks/use-inventory'
import { useToast } from '@/hooks/use-toast'

interface RecipeDetailProps {
  params: Promise<{
    id: string
  }>
}

interface Recipe {
  id: string
  title?: string
  name?: string
  description?: string
  prepTime?: string
  time?: string
  cookTime?: string
  servings?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  cuisine?: string
  img?: string
  ingredients?: Array<{
    name: string
    amount: string
    available?: boolean
  }>
  steps?: string[]
  instructions?: string[]
  tips?: string[]
  calories?: number
  tags?: string[]
  isFavorite?: boolean
  nutrition?: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

export default function RecipeDetailPage({ params }: RecipeDetailProps) {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const { recipes, saveRecipeAsFavorite, toggleRecipeFavorite } = useRecipes()
  const { items: inventoryItems } = useInventory()
  const { toast } = useToast()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Unwrap the params Promise
  const resolvedParams = use(params)

  // Memoize inventory item names to prevent infinite loops
  const inventoryItemNames = useMemo(() => {
    return inventoryItems?.map((item: any) => item.name?.toLowerCase() || '') || [];
  }, [inventoryItems?.length]);

  // Check ingredient availability based on inventory
  const checkIngredientAvailability = (ingredientName: string): boolean => {
    if (inventoryItemNames.length === 0) return false;
    
    const searchName = ingredientName.toLowerCase();
    return inventoryItemNames.some((itemName: string) => {
      // Check for exact match or partial match
      return itemName.includes(searchName) || searchName.includes(itemName);
    });
  };

  useEffect(() => {
    // Check if this is an AI-generated recipe
    if (resolvedParams.id.startsWith('ai-')) {
      // Try to get AI recipe data from sessionStorage
      const aiRecipeData = sessionStorage.getItem(resolvedParams.id);
      if (aiRecipeData) {
        try {
          const aiRecipe = JSON.parse(aiRecipeData);
          
          // Update ingredient availability based on current inventory
          const updatedIngredients = aiRecipe.ingredients?.map((ing: any) => ({
            ...ing,
            available: checkIngredientAvailability(ing.name),
          })) || [];

          // Transform the AI recipe data to match our interface
          const transformedRecipe: Recipe = {
            id: aiRecipe.id,
            title: aiRecipe.title || aiRecipe.name,
            name: aiRecipe.name || aiRecipe.title,
            description: `A delicious AI-generated ${aiRecipe.cuisine || 'homemade'} recipe created just for you`,
            prepTime: aiRecipe.prepTime || aiRecipe.time || '25 min',
            cookTime: aiRecipe.cookTime || '20 min',
            servings: aiRecipe.servings || 4,
            difficulty: aiRecipe.difficulty || 'Medium',
            cuisine: aiRecipe.cuisine || 'International',
            img: aiRecipe.img || '🤖',
            ingredients: updatedIngredients,
            steps: Array.isArray(aiRecipe.steps) 
              ? aiRecipe.steps.map((step: any) => 
                  typeof step === 'string' ? step : step.instruction || step.step || String(step)
                )
              : [
                  'Prepare all ingredients according to the recipe',
                  'Follow the cooking method carefully',
                  'Serve hot and enjoy your AI-generated meal'
                ],
            tips: Array.isArray(aiRecipe.tips) 
              ? aiRecipe.tips.map((tip: any) => 
                  typeof tip === 'string' ? tip : tip.tip || tip.text || String(tip)
                )
              : [
                  'This recipe was generated based on your available ingredients',
                  'Feel free to adjust seasonings to your taste',
                  'Save this recipe to access it later'
                ],
            calories: aiRecipe.calories || 250,
            tags: [...(aiRecipe.tags || []), 'ai-generated'],
            isFavorite: false, // AI recipes start as not favorite
            nutrition: aiRecipe.nutrition || {
              calories: aiRecipe.calories || 250,
              protein: '8g',
              carbs: '45g',
              fat: '12g'
            }
          }
          setRecipe(transformedRecipe)
          setIsFavorite(false)
          return
        } catch (error) {
          console.error('Error parsing AI recipe data:', error);
        }
      }
      
      // Fallback if no AI recipe data found
      const fallbackAIRecipe: Recipe = {
        id: resolvedParams.id,
        title: 'AI Generated Recipe',
        name: 'AI Generated Recipe',
        description: 'This AI-generated recipe is no longer available. Please go back and save the recipe to view it again.',
        prepTime: '25 min',
        cookTime: '20 min',
        servings: 4,
        difficulty: 'Medium',
        cuisine: 'International',
        img: '🤖',
        ingredients: [
          { name: 'Recipe data not available', amount: 'Please go back and save the recipe', available: false }
        ],
        steps: [
          'This AI-generated recipe data is no longer available.',
          'Please return to the recipes page and save the recipe to view full details.',
          'Saved recipes will be permanently accessible.'
        ],
        tips: [
          'Save AI-generated recipes to access them later',
          'Saved recipes include full ingredient lists and instructions'
        ],
        calories: 250,
        tags: ['ai-generated', 'unavailable'],
        isFavorite: false,
        nutrition: {
          calories: 250,
          protein: '8g',
          carbs: '45g',
          fat: '12g'
        }
      }
      setRecipe(fallbackAIRecipe)
      setIsFavorite(false)
      return
    }

    // Find the recipe by ID for saved recipes
    const foundRecipe = recipes.find((r: any) => r.id === resolvedParams.id)
    if (foundRecipe) {
      // Update ingredient availability based on current inventory
      const updatedIngredients = foundRecipe.ingredients?.map((ing: any) => ({
        ...ing,
        available: checkIngredientAvailability(ing.name),
      })) || [];

      // Transform the recipe data to match our interface
      const transformedRecipe: Recipe = {
        id: foundRecipe.id,
        title: foundRecipe.title || foundRecipe.name,
        name: foundRecipe.name || foundRecipe.title,
        description: foundRecipe.description || `A delicious ${foundRecipe.cuisine || 'homemade'} recipe`,
        prepTime: foundRecipe.prepTime || foundRecipe.time || '30 min',
        cookTime: foundRecipe.cookTime || '20 min',
        servings: foundRecipe.servings || 4,
        difficulty: foundRecipe.difficulty || 'Medium',
        cuisine: foundRecipe.cuisine || 'International',
        img: foundRecipe.img || '🍽️',
        ingredients: updatedIngredients,
        steps: Array.isArray(foundRecipe.steps) 
          ? foundRecipe.steps.map((step: any) => 
              typeof step === 'string' ? step : step.instruction || step.step || String(step)
            )
          : Array.isArray(foundRecipe.instructions)
          ? foundRecipe.instructions.map((instruction: any) => 
              typeof instruction === 'string' ? instruction : instruction.instruction || instruction.step || String(instruction)
            )
          : [
              'Prepare all ingredients',
              'Follow cooking method',
              'Serve hot and enjoy'
            ],
        tips: Array.isArray(foundRecipe.tips) 
          ? foundRecipe.tips.map((tip: any) => 
              typeof tip === 'string' ? tip : tip.tip || tip.text || String(tip)
            )
          : [
              'Use fresh ingredients for best taste',
              'Adjust seasoning to your preference'
            ],
        calories: foundRecipe.calories || 250,
        tags: foundRecipe.tags || [],
        isFavorite: foundRecipe.isFavorite || false,
        nutrition: foundRecipe.nutrition || {
          calories: foundRecipe.calories || 250,
          protein: '8g',
          carbs: '45g',
          fat: '12g'
        }
      }
      setRecipe(transformedRecipe)
      setIsFavorite(transformedRecipe.isFavorite || false)
    }
  }, [recipes, resolvedParams.id, inventoryItemNames])

  const handleSaveRecipe = async () => {
    if (!recipe) return
    
    setIsSaving(true)
    haptic.light()
    
    try {
      if (recipe.id.startsWith('ai-')) {
        // Save AI-generated recipe to database
        await saveRecipeAsFavorite(recipe)
        setIsFavorite(true)
        toast({
          title: "Recipe saved!",
          description: "AI recipe has been saved to your collection.",
        })
        
        // Clean up sessionStorage
        sessionStorage.removeItem(recipe.id)
      } else {
        // Toggle favorite for existing saved recipe
        await toggleRecipeFavorite(recipe.id)
        setIsFavorite(!isFavorite)
        toast({
          title: isFavorite ? "Removed from favorites" : "Added to favorites",
          description: isFavorite ? "Recipe removed from your favorites." : "Recipe added to your favorites.",
        })
      }
      haptic.success()
    } catch (error) {
      console.error('Error saving recipe:', error)
      haptic.error()
      toast({
        title: "Save failed",
        description: "Unable to save recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareRecipe = async () => {
    if (!recipe) return
    
    haptic.light()
    
    const shareData = {
      title: recipe.title || 'Delicious Recipe',
      text: `Check out this delicious ${recipe.cuisine} recipe: ${recipe.title}\n\n${recipe.description}\n\nPrep time: ${recipe.prepTime} | Servings: ${recipe.servings}`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        haptic.success()
        toast({
          title: "Recipe shared!",
          description: "Recipe has been shared successfully.",
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`)
        haptic.success()
        toast({
          title: "Recipe copied!",
          description: "Recipe details have been copied to your clipboard.",
        })
      }
    } catch (error: any) {
      // Don't show error if user just canceled the share
      if (error.name === 'AbortError') {
        console.log('Share was canceled by user')
        return
      }
      
      console.error('Error sharing recipe:', error)
      haptic.error()
      toast({
        title: "Share failed",
        description: "Unable to share recipe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddToShoppingList = () => {
    haptic.light()
    router.push('/dashboard/shopping/create')
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    )
  }

  const availableIngredients = recipe.ingredients?.filter(ing => ing.available).length || 0
  const totalIngredients = recipe.ingredients?.length || 0
  const missingIngredients = recipe.ingredients?.filter(ing => !ing.available) || []

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Premium Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                haptic.light()
                router.back()
              }}
              className="h-10 w-10 shrink-0 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* Center Title for Mobile - Fixed overflow */}
            <div className="flex-1 text-center px-2 min-w-0">
              <h1 className="text-sm font-semibold truncate max-w-full">
                {recipe.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareRecipe}
                className="h-10 w-10 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSaveRecipe}
                disabled={isSaving}
                size="icon"
                className={`
                  relative h-10 w-10 rounded-2xl transition-all duration-300 ease-out
                  ${isFavorite 
                    ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 hover:from-rose-600 hover:via-pink-600 hover:to-red-600 shadow-lg shadow-rose-500/50' 
                    : 'bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-300/60 dark:border-slate-600/50 hover:border-slate-400/70 dark:hover:border-slate-500/70 shadow-sm'
                  }
                  ${isSaving ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}
                  group overflow-hidden
                `}
              >
                {/* Background glow effect - only for favorited */}
                {isFavorite && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-400/30 via-pink-400/30 to-red-400/30 opacity-100" />
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center">
                  {isSaving ? (
                    <div className="relative">
                      <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                        isFavorite 
                          ? 'border-white/30 border-t-white' 
                          : 'border-slate-600/30 dark:border-slate-400/30 border-t-slate-800 dark:border-t-slate-300'
                      }`} />
                    </div>
                  ) : (
                    <div className="relative">
                      {isFavorite ? (
                        // FAVORITED: Filled white heart
                        <Heart className="w-4 h-4 fill-white text-white drop-shadow-sm animate-[heartbeat_0.6s_ease-in-out]" />
                      ) : (
                        // UNFAVORITED: Outline gray heart
                        <Heart className="w-4 h-4 fill-none text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:scale-110 stroke-2 transition-all duration-300" />
                      )}
                      
                      {/* Heart pulse effect - only when favorited */}
                      {isFavorite && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Heart className="w-4 h-4 fill-white/30 text-white/30 animate-ping" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Ripple effect on click */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className={`
                    absolute inset-0 rounded-full scale-0 transition-transform duration-300
                    ${isFavorite 
                      ? 'bg-white/30' 
                      : 'bg-slate-600/20 dark:bg-slate-300/20'
                    }
                    ${isSaving ? '' : 'group-active:scale-150 group-active:opacity-0'}
                  `} />
                </div>
              </Button>
            </div>
          </div>
      </div>

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-red-500/6 to-purple-500/8 dark:from-orange-500/12 dark:via-red-500/10 dark:to-purple-500/12" />
        <div className="relative px-4 py-8 sm:px-6 sm:py-12 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-6xl sm:text-8xl mb-4 sm:mb-6"
          >
            {recipe.img}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-2 sm:space-y-3"
          >
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent leading-tight px-4">
              {recipe.title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto px-4 leading-relaxed">
              {recipe.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Premium Content Container */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Missing Ingredients Alert */}
        {missingIngredients.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-amber-200/60 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 shadow-lg shadow-amber-500/10 dark:shadow-black/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100/80 dark:bg-amber-900/40 rounded-lg shrink-0 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Missing {missingIngredients.length} ingredient{missingIngredients.length > 1 ? 's' : ''}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {missingIngredients.slice(0, 4).map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm"
                        >
                          {ingredient.name}
                        </span>
                      ))}
                      {missingIngredients.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm">
                          +{missingIngredients.length - 4} more
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddToShoppingList}
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Shopping List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Compact Recipe Stats */}
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-3 sm:p-4 border-r border-b sm:border-b-0 border-slate-200/40 dark:border-slate-700/40"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Prep Time</p>
                <p className="font-bold text-xs sm:text-sm">{recipe.prepTime}</p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-slate-200/40 dark:border-slate-700/40"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Cook Time</p>
                <p className="font-bold text-xs sm:text-sm">{recipe.cookTime}</p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center p-3 sm:p-4 border-r border-slate-200/40 dark:border-slate-700/40"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Servings</p>
                <p className="font-bold text-xs sm:text-sm">{recipe.servings}</p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center p-3 sm:p-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Difficulty</p>
                <Badge className={`text-[10px] px-1.5 py-0.5 ${
                  recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                  recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                }`}>
                  {recipe.difficulty}
                </Badge>
              </motion.div>
            </div>
            
            {/* Compact Tags Section */}
            <div className="px-3 py-2.5 sm:p-4 border-t border-slate-200/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-white/95 dark:bg-slate-900/95 border-slate-200/60 dark:border-slate-700/60">{recipe.cuisine}</Badge>
                <Badge className="text-[10px] px-2 py-0.5 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm">
                  {availableIngredients}/{totalIngredients} available
                </Badge>
                {recipe.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5 bg-white/95 dark:bg-slate-900/95 border-slate-200/60 dark:border-slate-700/60">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Mobile Layout */}
        <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ingredients Section - Moved to top */}
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                        ingredient.available 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm' 
                          : 'bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 shadow-sm'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-xs sm:text-sm truncate ${
                            !ingredient.available ? 'text-red-700 dark:text-red-400' : ''
                          }`}>
                            {ingredient.name}
                          </p>
                          {!ingredient.available && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-400 shrink-0 shadow-sm">
                              Missing
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{ingredient.amount}</p>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ml-2 ${
                        ingredient.available ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                    </div>
                  ))}
                </div>
                
                {/* Small missing text under ingredients */}
                {missingIngredients.length > 0 && (
                  <div className="mt-3 p-2 bg-amber-50/80 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/60 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>
                        Missing {missingIngredients.length} ingredient{missingIngredients.length > 1 ? 's' : ''}: {' '}
                        {missingIngredients.slice(0, 3).map(ing => ing.name).join(', ')}
                        {missingIngredients.length > 3 && ` and ${missingIngredients.length - 3} more`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions - Moved below ingredients */}
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {recipe.steps?.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">
                        {typeof step === 'string' ? step : (step as any)?.instruction || (step as any)?.step || 'Step instruction'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

          {/* Compact Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4" />
                  Chef&apos;s Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {recipe.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {typeof tip === 'string' ? tip : (tip as any)?.tip || (tip as any)?.text || 'Cooking tip'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Compact Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Compact Missing Ingredients */}
          {missingIngredients.length > 0 && (
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-amber-200/60 dark:border-amber-800/60 shadow-xl shadow-amber-500/10 dark:shadow-black/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                  Missing Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5 mb-3">
                  {missingIngredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{ingredient.name}</span>
                      <span className="text-muted-foreground ml-2 shrink-0">{ingredient.amount}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full h-8 text-xs border-amber-300/60 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 shadow-sm"
                  onClick={handleAddToShoppingList}
                >
                  <ShoppingCart className="w-3 h-3 mr-1.5" />
                  Add to Shopping List
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Compact Nutrition */}
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nutrition (per serving)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Calories</span>
                  <span className="font-semibold text-sm">{recipe.nutrition?.calories || recipe.calories}</span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Protein</span>
                  <span className="font-medium text-xs">{recipe.nutrition?.protein}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Carbs</span>
                  <span className="font-medium text-xs">{recipe.nutrition?.carbs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Fat</span>
                  <span className="font-medium text-xs">{recipe.nutrition?.fat}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </motion.div>
  )
}