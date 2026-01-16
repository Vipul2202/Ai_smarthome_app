import { Context, requireAuth } from '../context';
import { VoiceService } from '../../services/voice';

export const voiceResolvers = {
  Mutation: {
    processVoiceCommand: async (_: any, { transcript }: { transcript: string }, context: Context) => {
      const user = requireAuth(context);
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is required');
      }

      const result = await VoiceService.processVoiceCommand(transcript.trim());
      
      return {
        intent: result.intent,
        item: result.item,
        confidence: result.confidence,
        transcript: transcript.trim(),
      };
    },
  },
};
