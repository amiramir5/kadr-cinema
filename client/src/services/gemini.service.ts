import { StructuredInterpretation } from '../types';

export class GeminiClientService {
  private static readonly MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.8-flash',
    'gemini-2.0-flash-exp'
  ];

  public static async interpretPrompt(prompt: string): Promise<StructuredInterpretation | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim() || !prompt.trim()) {
      return null;
    }

    const systemPrompt = `You are the Persian cinema recommendation AI engine for KADR (کادر).
Parse the user's Persian prompt into a JSON object with this exact structure:
{
  "mediaType": "movie" | "tv" | "all",
  "genres": string[] (Persian genre names, e.g. ["معمایی", "درام", "علمی‌تخیلی", "کمدی", "ترسناک", "اکشن"]),
  "genreIds": number[] (TMDB genre IDs: Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Drama: 18, Family: 10751, Fantasy: 14, Horror: 27, Mystery: 9648, Romance: 10749, Sci-Fi: 878, Thriller: 53),
  "mood": string[] (e.g. ["تاریک", "پیچیده", "امیدوارکننده", "دلهره‌آور", "احساسی"]),
  "runtimeMax": number | null (maximum runtime in minutes if requested, e.g. 45 or 120),
  "minimumRating": number | null (e.g. 8.0),
  "narrativePreferences": string[] (e.g. ["پایان غیرقابل پیش‌بینی", "داستان معمایی"]),
  "unwantedContent": string[] (e.g. ["بدون عاشقانه", "بدون جامپ‌اسکر"]),
  "referenceTitles": string[] (any titles mentioned, in English or Persian),
  "persianSummary": string (one natural Persian sentence describing the user's request)
}
Return ONLY valid JSON. No markdown ticks, no preamble.`;

    for (const model of this.MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser Prompt: "${prompt}"` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        // Clean any accidental markdown wrap
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          mediaType: parsed.mediaType || 'all',
          genres: Array.isArray(parsed.genres) ? parsed.genres : [],
          genreIds: Array.isArray(parsed.genreIds) ? parsed.genreIds : [],
          mood: Array.isArray(parsed.mood) ? parsed.mood : [],
          runtimeMax: typeof parsed.runtimeMax === 'number' ? parsed.runtimeMax : undefined,
          minimumRating: typeof parsed.minimumRating === 'number' ? parsed.minimumRating : undefined,
          narrativePreferences: Array.isArray(parsed.narrativePreferences) ? parsed.narrativePreferences : [],
          unwantedContent: Array.isArray(parsed.unwantedContent) ? parsed.unwantedContent : [],
          referenceTitles: Array.isArray(parsed.referenceTitles) ? parsed.referenceTitles : [],
          persianSummary: parsed.persianSummary || prompt,
          confidence: 0.96,
          isAiPowered: true,
        };
      } catch (err: any) {
        // Try next model or fail gracefully
        console.warn(`[GeminiClientService] ${model} attempt failed:`, err?.message || err);
      }
    }

    return null;
  }
}
