import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_RECIPES, 
  GET_RECIPE, 
  SAVE_RECIPE, 
  GENERATE_RECIPE,
  SEARCH_RECIPES,
  GET_RECIPE_SUGGESTIONS
} from '@/lib/graphql/recipes';
import { Recipe } from '@/types';

interface UseRecipesProps {
  userId?: string;
}

interface RecipeFilters {
  category?: string;
  difficulty?: string;
  maxCookTime?: number;
  dietary?: string[];
  ingredients?: string[];
}

export const useRecipes = ({ userId }: UseRecipesProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_RECIPES, {
    variables: { userId, filters },
    skip: !userId,
    errorPolicy: 'all',
  });

  const { data: suggestionsData, loading: loadingSuggestions } = useQuery(GET_RECIPE_SUGGESTIONS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });

  const [searchRecipesMutation, { loading: searching }] = useMutation(SEARCH_RECIPES);
  const [generateRecipeMutation, { loading: generating }] = useMutation(GENERATE_RECIPE);
  const [saveRecipeMutation, { loading: saving }] = useMutation(SAVE_RECIPE);

  const recipes: Recipe[] = data?.recipes || [];
  const suggestions: Recipe[] = suggestionsData?.recipeSuggestions || [];

  // Load favorites from storage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Load from AsyncStorage or API
      const savedFavorites = []; // Implement storage logic
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const getRecipe = async (id: string): Promise<Recipe> => {
    try {
      // This would typically be a separate query
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        return recipe;
      }
      
      // Fallback to API call
      throw new Error('Recipe not found');
    } catch (error) {
      throw new Error('Failed to get recipe');
    }
  };

  const searchRecipes = async (query: string, searchFilters?: RecipeFilters): Promise<Recipe[]> => {
    try {
      const { data } = await searchRecipesMutation({
        variables: { 
          query, 
          filters: { ...filters, ...searchFilters }
        }
      });
      
      return data?.searchRecipes || [];
    } catch (error) {
      console.error('Recipe search error:', error);
      throw new Error('Failed to search recipes');
    }
  };

  const generateRecipe = async (ingredients: string[], preferences?: {
    cuisine?: string;
    difficulty?: string;
    cookTime?: number;
    dietary?: string[];
  }): Promise<Recipe> => {
    try {
      const { data } = await generateRecipeMutation({
        variables: { 
          ingredients,
          preferences: preferences || {}
        }
      });
      
      if (data?.generateRecipe) {
        return data.generateRecipe;
      }
      
      throw new Error('Failed to generate recipe');
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Failed to generate recipe');
    }
  };

  const saveRecipe = async (recipeId: string): Promise<void> => {
    try {
      await saveRecipeMutation({
        variables: { recipeId }
      });
      
      // Update local favorites
      setFavorites(prev => 
        prev.includes(recipeId) 
          ? prev.filter(id => id !== recipeId)
          : [...prev, recipeId]
      );
    } catch (error) {
      console.error('Save recipe error:', error);
      throw new Error('Failed to save recipe');
    }
  };

  const getRecipesByIngredients = (availableIngredients: string[]): Recipe[] => {
    return recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
      const matchingIngredients = availableIngredients.filter(ingredient => 
        recipeIngredients.some(recipeIng => 
          recipeIng.includes(ingredient.toLowerCase()) || 
          ingredient.toLowerCase().includes(recipeIng)
        )
      );
      
      // Return recipes where at least 50% of ingredients are available
      return matchingIngredients.length >= recipe.ingredients.length * 0.5;
    });
  };

  const getRecipesByCategory = (category: string): Recipe[] => {
    return recipes.filter(recipe => 
      recipe.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const getRecipesByDifficulty = (difficulty: string): Recipe[] => {
    return recipes.filter(recipe => 
      recipe.difficulty?.toLowerCase() === difficulty.toLowerCase()
    );
  };

  const getQuickRecipes = (maxCookTime: number = 30): Recipe[] => {
    return recipes.filter(recipe => 
      (recipe.cookTime || 0) <= maxCookTime
    );
  };

  const getFavoriteRecipes = (): Recipe[] => {
    return recipes.filter(recipe => favorites.includes(recipe.id));
  };

  const isRecipeFavorite = (recipeId: string): boolean => {
    return favorites.includes(recipeId);
  };

  const updateFilters = (newFilters: Partial<RecipeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Filter recipes based on current filters and search
  const filteredRecipes = recipes.filter(recipe => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(query);
      const matchesIngredients = recipe.ingredients.some(ing => 
        ing.name.toLowerCase().includes(query)
      );
      const matchesTags = recipe.tags?.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      if (!matchesTitle && !matchesIngredients && !matchesTags) {
        return false;
      }
    }

    // Category filter
    if (filters.category && recipe.category !== filters.category) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    // Cook time filter
    if (filters.maxCookTime && (recipe.cookTime || 0) > filters.maxCookTime) {
      return false;
    }

    // Dietary filters
    if (filters.dietary && filters.dietary.length > 0) {
      const recipeTags = recipe.tags || [];
      const hasDietaryMatch = filters.dietary.some(diet => 
        recipeTags.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
      );
      if (!hasDietaryMatch) {
        return false;
      }
    }

    // Ingredients filter
    if (filters.ingredients && filters.ingredients.length > 0) {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
      const hasIngredientMatch = filters.ingredients.some(ingredient => 
        recipeIngredients.some(recipeIng => 
          recipeIng.includes(ingredient.toLowerCase())
        )
      );
      if (!hasIngredientMatch) {
        return false;
      }
    }

    return true;
  });

  return {
    recipes: filteredRecipes,
    allRecipes: recipes,
    suggestions,
    favorites: getFavoriteRecipes(),
    loading: loading || searching || generating || saving,
    loadingSuggestions,
    error,
    searchQuery,
    filters,
    
    // Actions
    getRecipe,
    searchRecipes,
    generateRecipe,
    saveRecipe,
    refetch,
    
    // Filtering
    setSearchQuery,
    updateFilters,
    clearFilters,
    
    // Utility functions
    getRecipesByIngredients,
    getRecipesByCategory,
    getRecipesByDifficulty,
    getQuickRecipes,
    isRecipeFavorite,
  };
};