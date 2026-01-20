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
5. Category (accept whatever user says - no suggestions)
6. Location (accept whatever user says - no suggestions)
7. Missing information that should be asked

Examples:
- "Add 2 bottles of milk" → ADD, milk, 2, bottles, null, null (missing category, location)
- "Add milk to my fridge in dairy section" → ADD, milk, null, null, dairy section, my fridge
- "Add tomatoes" → ADD, tomatoes, null, null, null, null (missing quantity, unit, category, location)

IMPORTANT: 
- Accept ANY category name user provides (don't limit to predefined categories)
- Accept ANY location name user provides (don't limit to predefined locations)
- If user doesn't specify category or location, mark as missing info
- Don't suggest options, just ask for missing information
- When asking for missing info, ask simple questions without giving examples

Respond in JSON format:
{
  "intent": "ADD|UPDATE|SEARCH|DELETE",
  "item": {
    "name": "item name",
    "quantity": number or null,
    "unit": "unit or null",
    "category": "category or null",
    "location": "location or null"
  },
  "confidence": 0.0-1.0,
  "missingInfo": ["quantity", "unit", "location"] // what info is missing
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a smart home inventory assistant. Extract intent and item details from voice commands. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(content);
    
    // Validate and normalize the response
    return {
      intent: result.intent || 'UNKNOWN',
      item: {
        name: result.item?.name || '',
        quantity: result.item?.quantity || null,
        unit: result.item?.unit || null,
        category: result.item?.category || null,
        location: result.item?.location || null,
      },
      confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
      missingInfo: result.missingInfo || [],
    };

  } catch (error) {
    console.error('Error processing voice intent:', error);
    
    // Fallback: simple keyword matching
    const lowerTranscript = transcript.toLowerCase();
    let intent: VoiceIntent['intent'] = 'UNKNOWN';
    
    if (lowerTranscript.includes('add') || lowerTranscript.includes('put')) {
      intent = 'ADD';
    } else if (lowerTranscript.includes('update') || lowerTranscript.includes('change')) {
      intent = 'UPDATE';
    } else if (lowerTranscript.includes('search') || lowerTranscript.includes('find')) {
      intent = 'SEARCH';
    } else if (lowerTranscript.includes('delete') || lowerTranscript.includes('remove')) {
      intent = 'DELETE';
    }

    return {
      intent,
      item: {
        name: transcript,
        quantity: null,
        unit: null,
        category: null,
        location: null,
      },
      confidence: 0.3,
      missingInfo: ['quantity', 'unit', 'category', 'location'],
    };
  }
}

export async function askForMissingInfo(missingInfo: string[]): Promise<string> {
  try {
    let question = '';
    
    // First, mention that some info is missing
    const missingText = missingInfo.length === 1 ? 
      `Some information is missing. ` : 
      `Some information is missing. `;
    
    if (missingInfo.length === 1) {
      const info = missingInfo[0];
      switch(info) {
        case 'quantity':
          question = missingText + "How many?";
          break;
        case 'unit':
          question = missingText + "What unit?";
          break;
        case 'category':
          question = missingText + "What category?";
          break;
        case 'location':
          question = missingText + "Where to store?";
          break;
        default:
          question = missingText + `What ${info}?`;
      }
    } else if (missingInfo.length === 2) {
      question = missingText + `Please tell me the ${missingInfo.join(' and ')}.`;
    } else if (missingInfo.length === 3) {
      question = missingText + `Please provide the ${missingInfo.slice(0, -1).join(', ')} and ${missingInfo[missingInfo.length - 1]}.`;
    } else {
      question = missingText + "Please provide the missing information.";
    }
    
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: question,
      speed: 0.7, // Slower and clearer speech
    });

    // Convert to base64 for frontend
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');

  } catch (error) {
    console.error('Error generating speech:', error);
    return '';
  }
}