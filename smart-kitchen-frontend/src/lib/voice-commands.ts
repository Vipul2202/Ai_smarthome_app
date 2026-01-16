export interface VoiceCommand {
  action: 'add_to_shopping' | 'add_to_inventory' | 'log_usage' | 'create_reminder' | 'check_stock' | 'unknown'
  item?: string
  quantity?: number
  unit?: string
  confidence: number
  rawText: string
  metadata?: Record<string, any>
}

export class VoiceCommandProcessor {
  private static foodItems: Record<string, string> = {
    'milk': 'Milk',
    'bread': 'Bread', 
    'eggs': 'Eggs',
    'rice': 'Rice',
    'tomatoes': 'Tomatoes',
    'tomato': 'Tomatoes',
    'onions': 'Onions',
    'onion': 'Onions',
    'potatoes': 'Potatoes',
    'potato': 'Potatoes',
    'chicken': 'Chicken',
    'oil': 'Cooking Oil',
    'sugar': 'Sugar',
    'salt': 'Salt',
    'flour': 'Flour',
    'butter': 'Butter',
    'cheese': 'Cheese',
    'apples': 'Apples',
    'apple': 'Apples',
    'bananas': 'Bananas',
    'banana': 'Bananas',
    'carrots': 'Carrots',
    'carrot': 'Carrots',
    'spinach': 'Spinach',
    'dal': 'Dal',
    'lentils': 'Dal',
    'yogurt': 'Yogurt',
    'curd': 'Yogurt'
  }

  private static units: Record<string, string> = {
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'l': 'L',
    'liter': 'L',
    'liters': 'L',
    'litre': 'L',
    'litres': 'L',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'pieces': 'pcs',
    'piece': 'pcs',
    'pcs': 'pcs',
    'bottles': 'bottles',
    'bottle': 'bottles',
    'packs': 'packs',
    'pack': 'packs',
    'packets': 'packets',
    'packet': 'packets',
    'cups': 'cups',
    'cup': 'cups'
  }

  static parseCommand(text: string): VoiceCommand {
    const lowerText = text.toLowerCase().trim()
    
    // Shopping list commands
    if (this.matchesPattern(lowerText, ['add', 'shopping', 'list']) || 
        this.matchesPattern(lowerText, ['buy', 'need']) ||
        this.matchesPattern(lowerText, ['shopping', 'add'])) {
      return this.parseShoppingCommand(lowerText, text)
    }
    
    // Inventory commands
    if (this.matchesPattern(lowerText, ['add', 'inventory']) ||
        this.matchesPattern(lowerText, ['add', 'stock']) ||
        this.matchesPattern(lowerText, ['inventory', 'add'])) {
      return this.parseInventoryCommand(lowerText, text)
    }
    
    // Usage logging commands
    if (this.matchesPattern(lowerText, ['used', 'consumed']) ||
        this.matchesPattern(lowerText, ['cooked', 'made']) ||
        this.matchesPattern(lowerText, ['finished', 'ate'])) {
      return this.parseUsageCommand(lowerText, text)
    }
    
    // Stock checking commands
    if (this.matchesPattern(lowerText, ['check', 'stock']) ||
        this.matchesPattern(lowerText, ['how', 'much']) ||
        this.matchesPattern(lowerText, ['do', 'have'])) {
      return this.parseStockCheckCommand(lowerText, text)
    }
    
    // Reminder commands
    if (this.matchesPattern(lowerText, ['remind', 'reminder']) ||
        this.matchesPattern(lowerText, ['remember', 'alert'])) {
      return this.parseReminderCommand(lowerText, text)
    }
    
    // Unknown command
    return {
      action: 'unknown',
      confidence: 0.1,
      rawText: text
    }
  }

  private static matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.every(keyword => text.includes(keyword))
  }

  private static parseShoppingCommand(lowerText: string, originalText: string): VoiceCommand {
    const item = this.extractItem(lowerText, ['add', 'to', 'shopping', 'list', 'buy', 'need', 'get'])
    const quantity = this.extractQuantity(lowerText)
    
    return {
      action: 'add_to_shopping',
      item: item || 'unknown item',
      quantity: quantity?.amount,
      unit: quantity?.unit,
      confidence: item ? 0.9 : 0.6,
      rawText: originalText,
      metadata: {
        detectedKeywords: ['shopping', 'add', 'buy'].filter(k => lowerText.includes(k))
      }
    }
  }

  private static parseInventoryCommand(lowerText: string, originalText: string): VoiceCommand {
    const item = this.extractItem(lowerText, ['add', 'to', 'inventory', 'stock', 'got', 'bought'])
    const quantity = this.extractQuantity(lowerText)
    
    return {
      action: 'add_to_inventory',
      item: item || 'unknown item',
      quantity: quantity?.amount,
      unit: quantity?.unit,
      confidence: item ? 0.9 : 0.6,
      rawText: originalText,
      metadata: {
        detectedKeywords: ['inventory', 'stock', 'add'].filter(k => lowerText.includes(k))
      }
    }
  }

  private static parseUsageCommand(lowerText: string, originalText: string): VoiceCommand {
    const item = this.extractItem(lowerText, ['used', 'consumed', 'cooked', 'made', 'finished', 'ate'])
    const quantity = this.extractQuantity(lowerText)
    
    return {
      action: 'log_usage',
      item: item || 'unknown item',
      quantity: quantity?.amount,
      unit: quantity?.unit,
      confidence: item ? 0.8 : 0.5,
      rawText: originalText,
      metadata: {
        usageType: lowerText.includes('cooked') ? 'COOKED' : 'CONSUMED'
      }
    }
  }

  private static parseStockCheckCommand(lowerText: string, originalText: string): VoiceCommand {
    const item = this.extractItem(lowerText, ['check', 'stock', 'how', 'much', 'do', 'have', 'left'])
    
    return {
      action: 'check_stock',
      item: item || 'unknown item',
      confidence: item ? 0.8 : 0.4,
      rawText: originalText
    }
  }

  private static parseReminderCommand(lowerText: string, originalText: string): VoiceCommand {
    const item = this.extractItem(lowerText, ['remind', 'reminder', 'remember', 'alert', 'me', 'to', 'buy'])
    
    return {
      action: 'create_reminder',
      item: item || 'unknown item',
      confidence: item ? 0.8 : 0.5,
      rawText: originalText
    }
  }

  private static extractItem(text: string, excludeWords: string[]): string | null {
    const words = text.split(' ').filter(word => 
      word.length > 1 && 
      !excludeWords.includes(word.toLowerCase()) &&
      !['the', 'a', 'an', 'some', 'of', 'and', 'or', 'with'].includes(word.toLowerCase()) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    )
    
    // Try to find known food items first
    for (const word of words) {
      const lowerWord = word.toLowerCase()
      if (this.foodItems[lowerWord]) {
        return this.foodItems[lowerWord]
      }
    }
    
    // Return the first meaningful word if no match found
    return words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : null
  }

  private static extractQuantity(text: string): { amount: number; unit: string } | null {
    // Look for number + unit patterns
    const quantityPatterns = [
      /(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms)/i,
      /(\d+(?:\.\d+)?)\s*(g|gram|grams)/i,
      /(\d+(?:\.\d+)?)\s*(l|liter|liters|litre|litres)/i,
      /(\d+(?:\.\d+)?)\s*(ml|milliliter|milliliters)/i,
      /(\d+(?:\.\d+)?)\s*(pieces?|pcs?)/i,
      /(\d+(?:\.\d+)?)\s*(bottles?)/i,
      /(\d+(?:\.\d+)?)\s*(packs?|packets?)/i,
      /(\d+(?:\.\d+)?)\s*(cups?)/i,
      /(\d+(?:\.\d+)?)/
    ]
    
    for (const pattern of quantityPatterns) {
      const match = text.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        const unit = match[2] ? this.units[match[2].toLowerCase()] || match[2] : 'pcs'
        return { amount, unit }
      }
    }
    
    return null
  }

  static getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  }

  static getSuggestions(command: VoiceCommand): string[] {
    const suggestions: string[] = []
    
    if (command.confidence < 0.7) {
      suggestions.push('Try speaking more clearly')
      suggestions.push('Use specific item names like "milk" or "bread"')
    }
    
    if (!command.quantity && ['add_to_shopping', 'add_to_inventory', 'log_usage'].includes(command.action)) {
      suggestions.push('Include quantity like "2 kg rice" or "1 liter milk"')
    }
    
    if (command.action === 'unknown') {
      suggestions.push('Try commands like:')
      suggestions.push('• "Add milk to shopping list"')
      suggestions.push('• "I used 2 cups of rice"')
      suggestions.push('• "Add tomatoes to inventory"')
    }
    
    return suggestions
  }
}