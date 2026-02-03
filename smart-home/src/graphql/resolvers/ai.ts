import { Context, requireAuth, requireHouseAccess } from '../context';
import { scanImageWithAI, processAIScanResult, categorizeProductWithAI } from '../../services/ai';
import { processVoiceIntent } from '../../services/voiceIntentService';
import { searchInventoryItems } from '../../services/inventorySearchService';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiResolvers: any = {
  Query: {
    aiScans: async (_: any, { limit = 20 }: any, context: Context) => {
      requireAuth(context);
      
      return context.prisma.aIScan.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    },

    searchInventoryByVoice: async (_: any, { houseId, searchTerm }: any, context: Context) => {
      await requireHouseAccess(context, houseId);
      
      // Validate search term early
      if (!searchTerm || !searchTerm.trim() || searchTerm.trim().length < 2) {
        return [];
      }

      const cleanSearchTerm = searchTerm.trim();
      
      try {
        // Use optimized search service
        const results = await searchInventoryItems(houseId, cleanSearchTerm, 10);
        
        // Log search for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Voice search for "${cleanSearchTerm}" returned ${results.length} results`);
        }
        
        return results;
      } catch (error) {
        console.error('Voice inventory search failed:', error);
        return [];
      }
    },
  },

  Mutation: {
    scanImage: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);
      
      const { imageUrl, scanType } = input;

      try {
        const scanResult = await scanImageWithAI(imageUrl, scanType);

        const aiScan = await context.prisma.aIScan.create({
          data: {
            imageUrl,
            scanType,
            result: scanResult,
            confidence: scanResult.confidence || 0,
            processed: false,
          },
        });

        return aiScan;
      } catch (error) {
        console.error('AI scan failed:', error);
        throw new Error('Failed to scan image. Please try again.');
      }
    },

    processVoiceIntent: async (_: any, { transcript, houseId }: any, context: Context) => {
      await requireHouseAccess(context, houseId);
      
      if (!transcript || !transcript.trim()) {
        throw new Error('Transcript is required');
      }

      try {
        const intent = await processVoiceIntent(transcript.trim());
        return intent;
      } catch (error) {
        console.error('Voice intent processing failed:', error);
        throw new Error('Failed to process voice command. Please try again.');
      }
    },

    updateInventoryByVoice: async (_: any, { houseId, itemName, quantity }: any, context: Context) => {
      await requireHouseAccess(context, houseId);
      
      if (!itemName || !itemName.trim()) {
        throw new Error('Item name is required');
      }

      if (quantity === null || quantity === undefined) {
        throw new Error('Quantity is required');
      }

      try {
        // Search for existing item
        const searchResults = await searchInventoryItems(houseId, itemName.trim(), 1);
        
        if (searchResults.length > 0) {
          // Update existing item
          const existingItem = searchResults[0];
          const updatedItem = await context.prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: quantity },
          });

          return {
            success: true,
            message: `Updated ${itemName} quantity to ${quantity}`,
            item: {
              id: updatedItem.id,
              name: updatedItem.name,
              category: updatedItem.category || '',
              quantity: updatedItem.quantity,
              unit: updatedItem.unit,
              location: updatedItem.location || '',
              similarity: 1.0,
            },
          };
        } else {
          return {
            success: false,
            message: `Item "${itemName}" not found in inventory`,
            item: null,
          };
        }
      } catch (error) {
        console.error('Voice inventory update failed:', error);
        return {
          success: false,
          message: 'Failed to update inventory item',
          item: null,
        };
      }
    },

    generateMissingInfoSpeech: async (_: any, { missingInfo }: any, context: Context) => {
      requireAuth(context);
      
      if (!missingInfo || missingInfo.length === 0) {
        return {
          success: true,
          speechData: '',
        };
      }

      try {
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
        
        // Generate actual audio using OpenAI TTS
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'nova',
          input: speechText,
          speed: 0.7, // Slower and clearer speech
          response_format: 'mp3', // Explicitly set format
        });

        // Convert to base64 for frontend
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        
        return {
          success: true,
          speechData: base64Audio,
        };
      } catch (error) {
        console.error('Speech generation failed:', error);
        return {
          success: false,
          speechData: '',
        };
      }
    },

    generateSimpleSpeech: async (_: any, { text }: any, context: Context) => {
      requireAuth(context);
      
      if (!text || !text.trim()) {
        return {
          success: false,
          speechData: '',
        };
      }

      try {
        // Generate actual audio using OpenAI TTS
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'nova',
          input: text.trim(),
          speed: 0.7, // Slower and clearer speech
          response_format: 'mp3', // Explicitly set format
        });

        // Convert to base64 for frontend
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        
        return {
          success: true,
          speechData: base64Audio,
        };
      } catch (error) {
        console.error('Simple speech generation failed:', error);
        return {
          success: false,
          speechData: '',
        };
      }
    },
  },
};