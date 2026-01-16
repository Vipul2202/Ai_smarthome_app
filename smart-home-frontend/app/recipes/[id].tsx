import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipe, saveRecipe, loading } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(4);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;
    try {
      const recipeData = await getRecipe(id);
      setRecipe(recipeData);
      setServings(recipeData.servings || 4);
      setIsFavorite(recipeData.isFavorite || false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipe');
      router.back();
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    try {
      await saveRecipe(recipe.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const handleShare = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\nIngredients: ${recipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ')}\n\nCook time: ${recipe.cookTime} minutes`,
        title: recipe.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const scaleIngredients = (originalQuantity: number, originalServings: number) => {
    return (originalQuantity * servings) / originalServings;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading || !recipe) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner text="Loading recipe..." className="flex-1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image 
            source={{ uri: recipe.image || 'https://via.placeholder.com/400x300' }} 
            style={{ width: screenWidth, height: 300 }}
            resizeMode="cover"
          />
          
          {/* Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute inset-0"
          />
          
          {/* Header Controls */}
          <View className="absolute top-12 left-0 right-0 flex-row items-center justify-between px-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={handleShare}
                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
              >
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSaveRecipe}
                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Recipe Title */}
          <View className="absolute bottom-6 left-4 right-4">
            <Text className="text-3xl font-bold text-white mb-2">
              {recipe.title}
            </Text>
            <Text className="text-white/80 text-base">
              {recipe.description}
            </Text>
          </View>
        </View>

        <View className="px-4 py-6 space-y-6">
          {/* Recipe Info */}
          <Card>
            <CardContent>
              <View className="flex-row justify-between items-center">
                <View className="items-center">
                  <Ionicons name="time-outline" size={24} className="text-blue-500 mb-1" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Prep Time</Text>
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    {recipe.prepTime} min
                  </Text>
                </View>
                
                <View className="items-center">
                  <Ionicons name="flame-outline" size={24} className="text-orange-500 mb-1" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Cook Time</Text>
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    {recipe.cookTime} min
                  </Text>
                </View>
                
                <View className="items-center">
                  <Ionicons name="people-outline" size={24} className="text-green-500 mb-1" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Servings</Text>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => setServings(Math.max(1, servings - 1))}
                      className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center"
                    >
                      <Ionicons name="remove" size={12} className="text-gray-600 dark:text-gray-400" />
                    </TouchableOpacity>
                    <Text className="font-semibold text-gray-900 dark:text-white min-w-[20px] text-center">
                      {servings}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setServings(servings + 1)}
                      className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center"
                    >
                      <Ionicons name="add" size={12} className="text-gray-600 dark:text-gray-400" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View className="items-center">
                  <Ionicons name="bar-chart-outline" size={24} className="text-purple-500 mb-1" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Difficulty</Text>
                  <Badge 
                    variant="secondary" 
                    size="sm"
                    style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                  >
                    {recipe.difficulty}
                  </Badge>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </View>
          )}

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ingredients ({recipe.ingredients.length})
                </Text>
                <TouchableOpacity onPress={() => setShowIngredientsModal(true)}>
                  <Ionicons name="list-outline" size={20} className="text-blue-500" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    <Text className="flex-1 text-gray-900 dark:text-white">
                      {scaleIngredients(ingredient.quantity, recipe.servings || 4).toFixed(1)} {ingredient.unit} {ingredient.name}
                    </Text>
                  </View>
                ))}
                {recipe.ingredients.length > 5 && (
                  <TouchableOpacity 
                    onPress={() => setShowIngredientsModal(true)}
                    className="mt-2"
                  >
                    <Text className="text-blue-500 font-medium">
                      View all {recipe.ingredients.length} ingredients
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Instructions
              </Text>
            </CardHeader>
            <CardContent>
              <View className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} className="flex-row">
                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3 mt-1">
                      <Text className="text-white font-semibold text-sm">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-gray-900 dark:text-white leading-6">
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Nutrition Info */}
          {recipe.nutrition && (
            <Card>
              <CardHeader>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nutrition (per serving)
                  </Text>
                  <TouchableOpacity onPress={() => setShowNutritionModal(true)}>
                    <Ionicons name="information-circle-outline" size={20} className="text-blue-500" />
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {recipe.nutrition.calories}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Calories</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.protein}g
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Protein</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.carbs}g
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Carbs</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recipe.nutrition.fat}g
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">Fat</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent>
              <View className="space-y-3">
                <Button
                  title="Start Cooking Timer"
                  onPress={() => router.push(`/timer?duration=${recipe.cookTime}&title=${encodeURIComponent(recipe.title)}`)}
                  variant="outline"
                  leftIcon="timer-outline"
                />
                
                <Button
                  title="Add to Meal Plan"
                  onPress={() => router.push(`/meal-planning/add?recipeId=${recipe.id}`)}
                  variant="outline"
                  leftIcon="calendar-outline"
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Full Ingredients Modal */}
      <Modal
        isVisible={showIngredientsModal}
        onClose={() => setShowIngredientsModal(false)}
        title="All Ingredients"
        size="lg"
        scrollable
      >
        <View className="space-y-3">
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
              <Text className="flex-1 text-gray-900 dark:text-white">
                {scaleIngredients(ingredient.quantity, recipe.servings || 4).toFixed(1)} {ingredient.unit} {ingredient.name}
              </Text>
            </View>
          ))}
        </View>
      </Modal>

      {/* Nutrition Modal */}
      {recipe.nutrition && (
        <Modal
          isVisible={showNutritionModal}
          onClose={() => setShowNutritionModal(false)}
          title="Detailed Nutrition"
          size="md"
        >
          <View className="space-y-4">
            <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Text className="text-gray-900 dark:text-white">Calories</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {recipe.nutrition.calories} kcal
              </Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Text className="text-gray-900 dark:text-white">Protein</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {recipe.nutrition.protein}g
              </Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Text className="text-gray-900 dark:text-white">Carbohydrates</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {recipe.nutrition.carbs}g
              </Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Text className="text-gray-900 dark:text-white">Fat</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {recipe.nutrition.fat}g
              </Text>
            </View>
            {recipe.nutrition.fiber && (
              <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Text className="text-gray-900 dark:text-white">Fiber</Text>
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {recipe.nutrition.fiber}g
                </Text>
              </View>
            )}
            {recipe.nutrition.sugar && (
              <View className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Text className="text-gray-900 dark:text-white">Sugar</Text>
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {recipe.nutrition.sugar}g
                </Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}