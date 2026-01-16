'use client';

import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { 
  GET_RECIPE_HISTORY, 
  GENERATE_RECIPE 
} from '@/lib/graphql/queries';
import { 
  SAVE_RECIPE_MUTATION, 
  TOGGLE_RECIPE_FAVORITE_MUTATION,
  DELETE_RECIPE_MUTATION 
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useRecipes() {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_RECIPE_HISTORY, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [generateRecipe, { 
    data: generatedData, 
    loading: generating, 
    error: generateError 
  }] = useLazyQuery(GENERATE_RECIPE);

  // Recipe management mutations
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE_MUTATION);
  const [toggleFavoriteMutation] = useMutation(TOGGLE_RECIPE_FAVORITE_MUTATION);
  const [deleteRecipeMutation] = useMutation(DELETE_RECIPE_MUTATION);

  // Get saved/favorite recipes from database
  const savedRecipes = data?.recipeHistory || [];
  const generatedRecipe = generatedData?.generateRecipe;

  // Helper functions
  const generateRecipeFromInventory = async (preferences?: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    return generateRecipe({
      variables: {
        input: {
          kitchenId,
          ...preferences,
        },
      },
    });
  };
  const saveRecipeAsFavorite = async (recipe: any) => {
    // For development mode, use a fallback kitchen ID if none is available
    const effectiveKitchenId = kitchenId || 'dev-kitchen-fallback';
    
    if (!kitchenId) {
      console.warn('⚠️ No kitchen selected - using development fallback');
      if (process.env.NODE_ENV === 'production') {
        throw new Error('No kitchen selected. Please select a kitchen first.');
      }
    }
    
    try {
      const result = await saveRecipeMutation({
        variables: {
          input: {
            kitchenId: effectiveKitchenId,
            title: recipe.title || recipe.name,
            ingredients: JSON.stringify(recipe.ingredients || []),
            steps: JSON.stringify(recipe.steps || []),
            cuisine: recipe.cuisine || 'International',
            prepTime: parseInt(recipe.prepTime?.replace(/\D/g, '') || '30'),
            calories: recipe.calories || 250,
            isFavorite: true
          }
        },
        refetchQueries: [{ query: GET_RECIPE_HISTORY, variables: { kitchenId: effectiveKitchenId } }]
      });
      
      return result.data?.saveRecipe;
    } catch (error) {
      console.error('❌ Failed to save recipe:', error);
      throw error;
    }
  };

  // Helper function to toggle favorite status
  const toggleRecipeFavorite = async (recipeId: string) => {
    try {
      const result = await toggleFavoriteMutation({
        variables: { recipeId },
        refetchQueries: [{ query: GET_RECIPE_HISTORY, variables: { kitchenId } }]
      });
      
      return result.data?.toggleRecipeFavorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  // Helper function to delete recipe
  const deleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipeMutation({
        variables: { recipeId },
        refetchQueries: [{ query: GET_RECIPE_HISTORY, variables: { kitchenId } }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      throw error;
    }
  };

  // Function to generate AI recipes based on current inventory
  const generateAIRecipesFromInventory = useCallback(async (inventoryItems: any[]) => {
    if (!inventoryItems || inventoryItems.length === 0) {
      return [];
    }

    try {
      // Extract available ingredient names
      const availableIngredients = inventoryItems
        .map((item: any) => item.name)
        .filter(Boolean)
        .slice(0, 10); // Limit to 10 ingredients for better AI processing

      console.log('Generating AI recipes with inventory:', availableIngredients);

      // Generate only 2 recipes instead of 3 to reduce API calls
      const recipePromises = [
        generateRecipeFromInventory({
          availableIngredients,
          cuisine: 'Indian',
          prepTime: 30,
          dietary: []
        }),
        generateRecipeFromInventory({
          availableIngredients,
          cuisine: 'International',
          prepTime: 25,
          dietary: []
        })
      ];

      const results = await Promise.allSettled(recipePromises);
      const aiRecipes: any[] = [];

      // Helper function to get realistic ingredient amounts (stable for hydration)
      const getRealisticAmount = (ingredientName: string, index: number = 0): string => {
        const name = ingredientName.toLowerCase();
        
        // Use a deterministic approach based on ingredient name to avoid hydration issues
        const nameHash = ingredientName.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const seedValue = Math.abs(nameHash) % 10;
        
        // Spices and seasonings
        if (name.includes('salt') || name.includes('pepper') || name.includes('cumin') || 
            name.includes('turmeric') || name.includes('coriander') || name.includes('garam masala') ||
            name.includes('chili') || name.includes('paprika') || name.includes('oregano') ||
            name.includes('thyme') || name.includes('basil') || name.includes('garlic powder')) {
          const amounts = ['1/2 tsp', '1 tsp', '2 tsp', '1 pinch', '2 pinches'];
          return amounts[seedValue % amounts.length];
        }
        
        // Fresh herbs
        if (name.includes('cilantro') || name.includes('parsley') || name.includes('mint') ||
            name.includes('curry leaves') || name.includes('green onion')) {
          const amounts = ['2 tbsp chopped', '3 sprigs', '4 sprigs', '1 tbsp chopped'];
          return amounts[seedValue % amounts.length];
        }
        
        // Garlic and ginger
        if (name.includes('garlic')) {
          const amounts = ['2 cloves', '3 cloves', '4 cloves', '5 cloves'];
          return amounts[seedValue % amounts.length];
        }
        if (name.includes('ginger')) {
          const amounts = ['1 inch piece', '2 inch piece', '1/2 inch piece'];
          return amounts[seedValue % amounts.length];
        }
        
        // Onions
        if (name.includes('onion')) {
          const amounts = ['1 medium', '2 small', '1 large', '1/2 medium'];
          return amounts[seedValue % amounts.length];
        }
        
        // Tomatoes
        if (name.includes('tomato')) {
          const amounts = ['2 medium', '3 small', '1 large', '200g'];
          return amounts[seedValue % amounts.length];
        }
        
        // Vegetables (general)
        if (name.includes('potato') || name.includes('carrot') || name.includes('bell pepper') ||
            name.includes('capsicum') || name.includes('brinjal') || name.includes('eggplant') ||
            name.includes('pepper')) {
          const amounts = ['2 medium', '250g', '200g', '1 large'];
          return amounts[seedValue % amounts.length];
        }
        
        // Leafy vegetables
        if (name.includes('spinach') || name.includes('lettuce') || name.includes('cabbage')) {
          const amounts = ['200g', '150g', '1 bunch', '250g'];
          return amounts[seedValue % amounts.length];
        }
        
        // Dairy
        if (name.includes('milk')) {
          const amounts = ['250ml', '300ml', '200ml', '1 cup'];
          return amounts[seedValue % amounts.length];
        }
        if (name.includes('yogurt') || name.includes('curd')) {
          const amounts = ['100g', '150g', '200g', '1/2 cup'];
          return amounts[seedValue % amounts.length];
        }
        if (name.includes('cheese') || name.includes('paneer')) {
          const amounts = ['150g', '200g', '100g', '250g'];
          return amounts[seedValue % amounts.length];
        }
        
        // Oils and liquids
        if (name.includes('oil')) {
          const amounts = ['2 tbsp', '3 tbsp', '1 tbsp', '4 tbsp'];
          return amounts[seedValue % amounts.length];
        }
        if (name.includes('water') || name.includes('broth') || name.includes('stock')) {
          const amounts = ['300ml', '400ml', '500ml', '2 cups'];
          return amounts[seedValue % amounts.length];
        }
        
        // Rice and grains
        if (name.includes('rice')) {
          const amounts = ['1 cup', '200g', '150g', '1.5 cups'];
          return amounts[seedValue % amounts.length];
        }
        if (name.includes('flour') || name.includes('atta')) {
          const amounts = ['100g', '150g', '200g', '1 cup'];
          return amounts[seedValue % amounts.length];
        }
        
        // Lentils and legumes
        if (name.includes('dal') || name.includes('lentil') || name.includes('chickpea') ||
            name.includes('bean')) {
          const amounts = ['100g', '150g', '1/2 cup', '200g'];
          return amounts[seedValue % amounts.length];
        }
        
        // Default for unknown ingredients
        const defaultAmounts = ['100g', '150g', '200g', '1 cup'];
        return defaultAmounts[seedValue % defaultAmounts.length];
      };

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data?.generateRecipe) {
          const recipe = result.value.data.generateRecipe;
          // Use a more stable ID generation to avoid hydration issues
          const recipeId = `ai-recipe-${recipe.title?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}-${index}`;
          
          aiRecipes.push({
            id: recipeId,
            title: recipe.title || `AI Recipe ${index + 1}`,
            name: recipe.title || `AI Recipe ${index + 1}`,
            prepTime: `${recipe.prepTime || 25} min`,
            time: `${recipe.prepTime || 25} min`,
            ingredients: Array.isArray(recipe.ingredients) 
              ? recipe.ingredients.map((ing: any, ingIndex: number) => ({
                  name: typeof ing === 'string' ? ing : ing.name || 'Unknown',
                  amount: typeof ing === 'object' && ing.amount 
                    ? ing.amount 
                    : typeof ing === 'string' 
                    ? getRealisticAmount(ing, ingIndex)
                    : getRealisticAmount(ing.name || 'Unknown', ingIndex),
                  available: availableIngredients.some((avail: string) => 
                    (typeof ing === 'string' ? ing : ing.name || '').toLowerCase().includes(avail.toLowerCase()) ||
                    avail.toLowerCase().includes((typeof ing === 'string' ? ing : ing.name || '').toLowerCase())
                  )
                }))
              : [],
            ingredientCount: Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0,
            available: true, // Since it's generated from available ingredients
            cuisine: recipe.cuisine || 'International',
            img: getCuisineEmoji(recipe.cuisine),
            tags: ["ai-generated", "fresh"],
            calories: recipe.calories || 250,
            steps: Array.isArray(recipe.steps) 
              ? recipe.steps.map((step: any) => {
                  if (typeof step === 'string') return step;
                  if (step && typeof step === 'object' && step.instruction) return step.instruction;
                  return String(step);
                })
              : [],
            isFavorite: false,
            isAIGenerated: true
          });
        }
      });

      return aiRecipes;
    } catch (error) {
      console.error('Failed to generate AI recipes:', error);
      return [];
    }
  }, [generateRecipeFromInventory]);

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

  // Robust deduplication function
  const deduplicateRecipes = useCallback((recipeList: any[]) => {
    const seen = new Set();
    const uniqueRecipes = recipeList.filter((recipe) => {
      const key = `${recipe.id}-${recipe.title || recipe.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    return uniqueRecipes;
  }, []);

  // Memoize the deduplicated recipes to prevent infinite loops
  const memoizedRecipes = useMemo(() => {
    return deduplicateRecipes(savedRecipes);
  }, [savedRecipes, deduplicateRecipes]);

  return {
    // Data - prioritize saved/favorite recipes from DB
    recipes: memoizedRecipes,
    generatedRecipe,
    
    // Loading states
    loading,
    generating,
    error: error || generateError,
    
    // Actions
    generateRecipeFromInventory,
    generateAIRecipesFromInventory,
    saveRecipeAsFavorite,
    toggleRecipeFavorite,
    deleteRecipe,
    refetch,
    
    // Stats based on saved recipes
    stats: {
      total: savedRecipes.length,
      favorites: savedRecipes.filter((r: any) => r.isFavorite).length,
      available: savedRecipes.filter((r: any) => r.available).length,
    },
  };
}