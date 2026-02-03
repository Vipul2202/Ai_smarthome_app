import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VoiceIntent {
  intent: 'ADD' | 'UPDATE' | 'SEARCH' | 'DELETE' | 'UNKNOWN';
  item: {
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    location?: string;
  };
  confidence: number;
  missingInfo?: string[];
}

export async function processVoiceIntent(transcript: string): Promise<VoiceIntent> {
  try {
    const prompt = `
Analyze this voice command and extract the intent and item details:
"${transcript}"

Determine:
1. Intent: ADD (add new item), UPDATE (update existing item), SEARCH (find item), DELETE (remove item)
2. Item name (required)
3. Quantity (if mentioned)
4. Unit (pieces, kg, bottles, etc.)
5. Category (auto-detect from item name if possible: fruits, vegetables, dairy, meat, grains, beverages, snacks, other)
6. Location (auto-detect common locations: fridge, freezer, pantry, cabinet, container)
7. Missing information that should be asked

Auto-detection rules:
- Milk, cheese, yogurt, butter → dairy
- Apple, banana, orange, fruit → fruits  
- Tomato, onion, potato, vegetable → vegetables
- Chicken, beef, meat, fish → meat
- Bread, rice, pasta, cereal → grains
- Water, juice, soda, coffee → beverages
- Chips, cookies, candy, snack → snacks
- Common locations: fridge, freezer, pantry, cabinet, cupboard

Examples:
- "Add 2 bottles of milk" → ADD, milk, 2, bottles, dairy, null (auto-detected category, missing location)
- "Add milk to my fridge" → ADD, milk, null, null, dairy, fridge (auto-detected both)
- "Add tomatoes" → ADD, tomatoes, null, null, vegetables, null (auto-detected category, missing quantity, location)
- "Update chicken to 3 pieces" → UPDATE, chicken, 3, pieces, meat, null (auto-detected category)
- "Search for apples" → SEARCH, apples, null, null, fruits, null
- "Delete old bread" → DELETE, bread, null, null, grains, null

IMPORTANT: 
- Try to auto-detect category and location from context
- Only mark as missing if truly cannot be determined
- Accept ANY user-provided category/location names
- For missing info, ask simple questions without examples

Respond in JSON format:
{
  "intent": "ADD|UPDATE|SEARCH|DELETE",
  "item": {
    "name": "extracted item name",
    "quantity": number or null,
    "unit": "extracted unit or null",
    "category": "auto-detected or user-provided category or null",
    "location": "auto-detected or user-provided location or null"
  },
  "confidence": 0.0-1.0,
  "missingInfo": ["quantity", "unit", "category", "location"] // only truly missing items
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Updated to current model
      messages: [
        {
          role: 'system',
          content: 'You are a voice command analyzer for a smart home inventory system. Extract intent and item details accurately. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and clean the result
    return {
      intent: result.intent || 'UNKNOWN',
      item: {
        name: result.item?.name || '',
        quantity: result.item?.quantity || null,
        unit: result.item?.unit || null,
        category: result.item?.category || null,
        location: result.item?.location || null,
      },
      confidence: result.confidence || 0.5,
      missingInfo: result.missingInfo || [],
    };

  } catch (error) {
    console.error('Voice intent processing failed:', error);
    return {
      intent: 'UNKNOWN',
      item: {
        name: '',
        quantity: null,
        unit: null,
        category: null,
        location: null,
      },
      confidence: 0.0,
      missingInfo: [],
    };
  }
}

export async function generateMissingInfoSpeech(missingInfo: string[]): Promise<string> {
  try {
    console.log('🎤 Generating missing info speech for:', missingInfo);
    
    const questions = missingInfo.map((info: string) => {
      switch (info) {
        case 'quantity':
          return 'How much do you want to add?';
        case 'unit':
          return 'What unit should I use?';
        case 'category':
          return 'What category is this item?';
        case 'location':
          return 'Where do you want to store this?';
        default:
          return `Please provide ${info}`;
      }
    });

    const speechText = questions.join(' ');
    
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: speechText,
      speed: 0.7, // Slower and clearer speech
      response_format: 'mp3', // Explicitly set format
    });

    // Convert to base64 for frontend
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');

  } catch (error) {
    console.error('Error generating missing info speech:', error);
    return '';
  }
}

export async function generateSimpleSpeech(text: string): Promise<string> {
  try {
    console.log('🎤 Generating simple speech for:', text);
    
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      speed: 0.7, // Slower and clearer speech
      response_format: 'mp3', // Explicitly set format
    });

    // Convert to base64 for frontend
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');

  } catch (error) {
    console.error('Error generating simple speech:', error);
    return '';
  }
}