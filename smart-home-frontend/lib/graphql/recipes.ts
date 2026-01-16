import { gql } from '@apollo/client';

export const GET_RECIPES = gql`
  query GetRecipes($userId: ID!, $filters: RecipeFiltersInput) {
    recipes(userId: $userId, filters: $filters) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      ingredients {
        name
        quantity
        unit
      }
      instructions
      tags
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
      isFavorite
      createdAt
      updatedAt
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      ingredients {
        name
        quantity
        unit
      }
      instructions
      tags
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
      isFavorite
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_RECIPES = gql`
  mutation SearchRecipes($query: String!, $filters: RecipeFiltersInput) {
    searchRecipes(query: $query, filters: $filters) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      ingredients {
        name
        quantity
        unit
      }
      instructions
      tags
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
      isFavorite
      createdAt
      updatedAt
    }
  }
`;

export const GENERATE_RECIPE = gql`
  mutation GenerateRecipe($ingredients: [String!]!, $preferences: RecipePreferencesInput) {
    generateRecipe(ingredients: $ingredients, preferences: $preferences) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      ingredients {
        name
        quantity
        unit
      }
      instructions
      tags
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
      isGenerated
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($recipeId: ID!) {
    saveRecipe(recipeId: $recipeId) {
      id
      isFavorite
    }
  }
`;

export const GET_RECIPE_SUGGESTIONS = gql`
  query GetRecipeSuggestions($userId: ID!) {
    recipeSuggestions(userId: $userId) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      ingredients {
        name
        quantity
        unit
      }
      matchingIngredients
      missingIngredients
      matchPercentage
    }
  }
`;

export const GET_FAVORITE_RECIPES = gql`
  query GetFavoriteRecipes($userId: ID!) {
    favoriteRecipes(userId: $userId) {
      id
      title
      description
      image
      category
      difficulty
      prepTime
      cookTime
      servings
      createdAt
    }
  }
`;

export const RATE_RECIPE = gql`
  mutation RateRecipe($recipeId: ID!, $rating: Int!) {
    rateRecipe(recipeId: $recipeId, rating: $rating) {
      id
      rating
      averageRating
      totalRatings
    }
  }
`;