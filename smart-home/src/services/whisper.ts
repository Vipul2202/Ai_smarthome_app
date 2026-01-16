import OpenAI from 'openai';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class WhisperService {
  /**
   * Transcribe audio file to text using OpenAI Whisper
   */
  static async transcribeAudio(audioFilePath: string): Promise<string> {
    try {
      console.log('🎤 Transcribing audio with Whisper...');

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'en', // Can be changed to support multiple languages
        response_format: 'text',
      });

      console.log('✅ Transcription successful:', transcription);
      return transcription as string;
    } catch (error: any) {
      console.error('❌ Whisper transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Transcribe audio buffer to text
   */
  static async transcribeAudioBuffer(
    audioBuffer: Buffer,
    filename: string = 'audio.m4a'
  ): Promise<string> {
    let tempPath: string | null = null;
    
    try {
      console.log('🎤 Transcribing audio buffer with Whisper...');
      console.log('📊 Buffer size:', audioBuffer.length, 'bytes');

      // Use OS temp directory (works on Windows, Mac, Linux)
      const tempDir = os.tmpdir();
      console.log('📁 System temp directory:', tempDir);
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        console.log('⚠️ Temp directory does not exist, creating...');
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      tempPath = path.join(tempDir, `whisper-${Date.now()}-${filename}`);
      console.log('📁 Temp file path:', tempPath);

      // Write buffer to temp file
      fs.writeFileSync(tempPath, audioBuffer);
      console.log('✅ Audio file written to temp directory');

      // Verify file was written
      const stats = fs.statSync(tempPath);
      console.log('📊 File size on disk:', stats.size, 'bytes');

      if (stats.size === 0) {
        throw new Error('Audio file is empty');
      }

      // Transcribe
      console.log('🎤 Calling OpenAI Whisper API...');
      const transcription = await this.transcribeAudio(tempPath);
      console.log('✅ Transcription received:', transcription);

      return transcription;
    } catch (error: any) {
      console.error('❌ Whisper transcription error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status,
        tempPath: tempPath,
      });
      throw new Error(`Transcription failed: ${error.message}`);
    } finally {
      // Clean up temp file
      if (tempPath) {
        try {
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
            console.log('🗑️ Temp file cleaned up');
          }
        } catch (cleanupError) {
          console.warn('⚠️ Failed to clean up temp file:', cleanupError);
        }
      }
    }
  }
}
