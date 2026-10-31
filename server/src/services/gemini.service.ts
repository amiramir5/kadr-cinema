import axios from 'axios';
import { CONFIG } from '../config';
import { StructuredInterpretation } from '../types';

export class GeminiService {
  /**
   * Interpret query and enhance recommendations using Gemini 3.8 Flash
   */
  public static async interpretPrompt(prompt: string): Promise<StructuredInterpretation | null> {
    if (!CONFIG.GEMINI_API_KEY) {
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
      const systemInstruction = `You are the cinema recommendation AI for KADR (کادر), a Persian movie/TV discovery platform.
Parse the user's Persian watch request into strict JSON:
{
  "mediaType": "movie" | "tv" | "all",
  "genres": ["string in Persian"],
  "genreIds": [number tmdb genre ids],
  "mood": ["string in Persian"],
  "runtimeMax": number or null,
  "minimumRating": number or null,
  "narrativePreferences": ["string in Persian"],
  "unwantedContent": ["string in Persian"],
  "referenceTitles": ["string English title"],
  "persianSummary": "fluent concise Persian summary"
}
Output only valid JSON, without any markdown formatting.`;

      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                { text: `${systemInstruction}\n\nUser request: "${prompt}"` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          }
        },
        { timeout: 7000 }
      );

      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!raw) return null;

      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        mediaType: parsed.mediaType || 'all',
        genres: parsed.genres || [],
        genreIds: parsed.genreIds || [],
        mood: parsed.mood || [],
        runtimeMax: parsed.runtimeMax || undefined,
        minimumRating: parsed.minimumRating || undefined,
        narrativePreferences: parsed.narrativePreferences || [],
        unwantedContent: parsed.unwantedContent || [],
        referenceTitles: parsed.referenceTitles || [],
        persianSummary: parsed.persianSummary || prompt,
        confidence: 0.98,
        isAiPowered: true,
      };
    } catch (err: any) {
      console.warn('[GeminiService] Gemini 3.8 Flash call skipped or timed out, using fallback:', err.message);
      return null;
    }
  }
}
