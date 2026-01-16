"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ChefHat, 
  Sparkles, 
  Clock, 
  Users, 
  Zap,
  RefreshCw,
  Heart,
  Share2,
  BookOpen
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

interface Recipe {
  id: string
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  cuisine: string
  ingredients: Array<{
    name: string
    amount: string
    available: boolean
  }>
  instructions: string[]
  tips: string[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

// Sample recipes removed - using only AI-generated recipes

export default function GenerateRecipePage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const { generateRecipeFromInventory } = useRecipes()
  const { items } = useInventory()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const handleGenerateRecipes = async () => {
    setLoading(true)
    haptic.medium()

    try {
      // Get available ingredients from inventory
      const availableIngredients = items && items.length > 0 
        ? items.map((item: any) => item.name).filter(Boolean)
        : ['rice', 'onions', 'tomatoes', 'spices', 'oil', 'salt'] // Enhanced fallback

      const preferences = {
        cuisine: 'Indian', // Default cuisine
        prepTime: 30, // Default prep time
        dietary: [] // Default dietary restrictions
      }

      console.log('Generating recipes with ingredients:', availableIngredients)

      // Call the actual AI recipe generation
      const { data } = await generateRecipeFromInventory({
        availableIngredients,
        ...preferences
      })

      if (data?.generateRecipe) {
        const aiRecipes = Array.isArray(data.generateRecipe) 
          ? data.generateRecipe 
          : [data.generateRecipe]
        
        const processedRecipes = aiRecipes.map((recipe: any, index: number) => ({
          id: `ai-${index}`,
          title: recipe.title || recipe.name || `Recipe ${index + 1}`,
          description: recipe.description || `A delicious ${recipe.cuisine || 'Indian'} recipe made with available ingredients`,
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : typeof recipe.ingredients === 'string'
            ? recipe.ingredients.split('\n').map((ing: string) => ({
                name: ing.trim(),
                amount: '1 cup',
                available: availableIngredients.some((avail: string) => 
                  ing.toLowerCase().includes(avail.toLowerCase())
                )
              }))
            : [],
          instructions: Array.isArray(recipe.steps) 
            ? recipe.steps.map((step: any) => {
                // Handle both string steps and RecipeStep objects
                if (typeof step === 'string') {
                  return step;
                } else if (step && typeof step === 'object' && step.instruction) {
                  return step.instruction;
                } else {
                  return String(step);
                }
              })
            : typeof recipe.steps === 'string'
            ? recipe.steps.split('\n').filter(Boolean)
            : recipe.instructions || [],
          prepTime: `${recipe.prepTime || 30} min`,
          cookTime: `${recipe.cookTime || 20} min`,
          cuisine: recipe.cuisine || 'Indian',
          calories: recipe.calories || Math.floor(Math.random() * 300) + 200,
          difficulty: recipe.difficulty || 'Medium',
          servings: recipe.servings || 4,
          tips: recipe.tips || ['Use fresh ingredients for best taste', 'Adjust spices to your preference'],
          nutrition: recipe.nutrition || {
            calories: recipe.calories || 250,
            protein: '8g',
            carbs: '45g',
            fat: '12g'
          }
        }))
        
        setRecipes(processedRecipes)
        console.log('AI recipes generated successfully:', processedRecipes)
      } else {
        console.log('No AI recipes returned')
        setRecipes([])
        toast({
          title: "No recipes found",
          description: "Unable to generate recipes with your current ingredients. Try adding more items to your inventory.",
          variant: "destructive",
        })
      }
      
      haptic.success()
    } catch (error) {
      console.error('Failed to generate recipes:', error)
      // Show error message instead of using fallback recipes
      setRecipes([])
      toast({
        title: "Recipe generation failed",
        description: "Unable to generate recipes at the moment. Please check your internet connection and try again.",
        variant: "destructive",
      })
      haptic.error()
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecipe = (recipe: Recipe) => {
    haptic.light()
    setSelectedRecipe(recipe)
  }

  const handleShareRecipe = async (recipe: Recipe) => {
    haptic.light()
    
    const shareData = {
      title: recipe.title,
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

  const handleSaveRecipe = (recipe: Recipe) => {
    haptic.success()
    // TODO: Save recipe to user's collection
    console.log('Saving recipe:', recipe.title)
  }

  const availableIngredients = selectedRecipe?.ingredients.filter(ing => ing.available).length || 0
  const totalIngredients = selectedRecipe?.ingredients.length || 0
  const missingIngredients = selectedRecipe?.ingredients.filter(ing => !ing.available) || []

  if (selectedRecipe) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <div className="dialog-padding dialog-spacing">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  haptic.light()
                  setSelectedRecipe(null)
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-sm sm:text-xl font-bold truncate">{selectedRecipe.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{selectedRecipe.description}</p>
              </div>
              <div className="flex gap-1 sm:gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={() => handleSaveRecipe(selectedRecipe)}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Save Recipe</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="section-spacing">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recipe Details */}
            <div className="lg:col-span-2 section-spacing">
              {/* Recipe Info */}
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Prep Time</p>
                      <p className="text-xs sm:text-base font-semibold">{selectedRecipe.prepTime}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Cook Time</p>
                      <p className="text-xs sm:text-base font-semibold">{selectedRecipe.cookTime}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Servings</p>
                      <p className="text-xs sm:text-base font-semibold">{selectedRecipe.servings}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Difficulty</p>
                      <Badge className={`text-[10px] sm:text-xs ${
                        selectedRecipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        selectedRecipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {selectedRecipe.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <Badge variant="outline" className="text-[10px] sm:text-xs">{selectedRecipe.cuisine}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] sm:text-xs">
                      {availableIngredients}/{totalIngredients} ingredients available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {selectedRecipe.instructions.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-2 sm:gap-4"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed pt-1">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    Chef&apos;s Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {selectedRecipe.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-1.5 sm:mt-2 shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 section-spacing">
              {/* Ingredients */}
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-sm sm:text-lg">Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors ${
                          ingredient.available 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{ingredient.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{ingredient.amount}</p>
                        </div>
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                          ingredient.available ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            {/* Missing Ingredients */}
            {missingIngredients.length > 0 && (
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
                    Missing Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {missingIngredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{ingredient.name}</span>
                        <span className="text-muted-foreground">{ingredient.amount}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      haptic.light()
                      router.push('/dashboard/shopping/create')
                    }}
                  >
                    Add to Shopping List
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Nutrition */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Nutrition (per serving)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Calories</span>
                    <span className="font-semibold">{selectedRecipe.nutrition.calories}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm">Protein</span>
                    <span className="font-semibold">{selectedRecipe.nutrition.protein}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Carbs</span>
                    <span className="font-semibold">{selectedRecipe.nutrition.carbs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fat</span>
                    <span className="font-semibold">{selectedRecipe.nutrition.fat}</span>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <div className="dialog-padding dialog-spacing">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptic.light()
                router.back()
              }}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-xl font-bold flex items-center gap-1 sm:gap-2">
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-orange-500" />
                <span className="truncate">AI Recipe Generator</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Generate recipes based on your available ingredients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-padding page-spacing section-spacing">

      {/* Generator Interface */}
      {recipes.length === 0 ? (
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="p-4 sm:p-8 text-center">
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">What can you cook today?</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Our AI will analyze your inventory and suggest delicious recipes you can make right now.
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mb-1 sm:mb-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Using your live inventory data</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Found {items.length} items in your kitchen
                </p>
              </div>

              <Button
                onClick={handleGenerateRecipes}
                disabled={loading}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-sm sm:text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 sm:mr-3" />
                    <span className="text-xs sm:text-base">Generating recipes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    <span className="text-xs sm:text-base">Generate Recipes</span>
                  </>
                )}
              </Button>

              {loading && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg sm:rounded-xl">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-blue-900 dark:text-blue-100 text-xs sm:text-sm">AI Processing</p>
                      <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">Analyzing your ingredients...</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg sm:rounded-xl">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-xs font-bold">1</span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium">Scanning Inventory</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg sm:rounded-xl">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-xs font-bold">2</span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium">Matching Recipes</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg sm:rounded-xl">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-xs font-bold">3</span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium">Personalizing</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Recipe Results */
        <div className="section-spacing">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-xl font-bold">Generated Recipes ({recipes.length})</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                haptic.light()
                setRecipes([])
              }}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate New</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-xl shadow-orange-500/10 dark:shadow-black/20 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer"
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">{recipe.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="text-2xl sm:text-4xl ml-2 sm:ml-4 shrink-0">🍽️</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {recipe.prepTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        {recipe.servings} servings
                      </span>
                      <Badge className={`text-[10px] sm:text-xs ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] sm:text-xs">
                        {recipe.ingredients.filter(ing => ing.available).length}/{recipe.ingredients.length} available
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleSelectRecipe(recipe)}
                        className="text-xs sm:text-sm px-2 sm:px-4 h-7 sm:h-9"
                      >
                        <span className="hidden sm:inline">View Recipe</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      </div>
    </motion.div>
  )
}