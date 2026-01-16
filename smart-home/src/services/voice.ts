import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VoiceIntent {
  intent: 'add_item' | 'update_item' | 'remove_item' | 'query_item' | 'unknown';
  item: {
    raw_name: string | null;
    normalized_name: string | null;
    category: string | null;
    quantity: number | null;
    unit: string | null;
    location: string | null;
  };
  confidence: number;
}

export class VoiceService {
  static async processVoiceCommand(transcript: string): Promise<VoiceIntent> {
    const systemPrompt = `You are an inventory-intent extraction engine.
Your task is to extract structured inventory data from a single user sentence.

Rules:
- Output ONLY valid JSON.
- Follow the exact schema provided.
- Do NOT add explanations or extra fields.
- If information is missing, set the field to null.
- Confidence must be a number between 0 and 1.
- Confidence represents how certain you are that the item name refers to a commonly known household object and is free from spelling or semantic errors.
- Do not output confidence higher than 0.7 if the item name could be a typo, homophone, or uncommon household term.
- Assume the sentence is about household inventory management.
- Always preserve the exact user phrase in raw_name. Normalize item names to their most common household term when possible.
- If normalization is uncertain, set normalized_name to null and reduce confidence.`;

    const userPrompt = `Extract inventory intent from the sentence below and return JSON in this exact schema:

{
  "intent": "add_item | update_item | remove_item | query_item | unknown",
  "item": {
    "raw_name": string | null,
    "normalized_name": string | null,
    "category": string | null,
    "quantity": number | null,
    "unit": string | null,
    "location": string | null
  },
  "confidence": number
}

Sentence:
"${transcript}"`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Try to parse JSON
      let parsed: VoiceIntent;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // Attempt to extract JSON substring
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const substr = content.slice(start, end + 1);
          parsed = JSON.parse(substr);
        } else {
          throw new Error('Failed to parse JSON from OpenAI response');
        }
      }

      return parsed;
    } catch (error) {
      console.error('Voice processing error:', error);
      throw error;
    }
  }
}
