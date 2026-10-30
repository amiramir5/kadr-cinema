import axios from 'axios';
import { CONFIG, isLlmConfigured } from '../config';
import { StructuredInterpretation } from '../types';

export class LlmProvider {
  /**
   * Attempt to enhance structured interpretation using an external LLM
   * (e.g. DeepSeek or OpenAI endpoint) if credentials are provided in .env
   */
  public static async interpretPrompt(prompt: string): Promise<StructuredInterpretation | null> {
    if (!isLlmConfigured()) {
      return null;
    }

    try {
      const systemPrompt = `You are the cinema recommendation AI for KADR (کادر), a Persian movie/TV discovery platform.
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
Output only valid JSON, without markdown formatting.`;

      const response = await axios.post(
        `${CONFIG.LLM_API_BASE_URL}/chat/completions`,
        {
          model: CONFIG.LLM_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${CONFIG.LLM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 6000,
        }
      );

      const raw = response.data.choices?.[0]?.message?.content?.trim();
      if (!raw) return null;

      // Clean potential markdown backticks
      const cleanJson = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim();
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
      console.warn('[LlmProvider] LLM call skipped or failed, using Persian NLP engine:', err?.message);
      return null;
    }
  }
}
