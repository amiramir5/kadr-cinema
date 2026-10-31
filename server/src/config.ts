import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  TMDB_API_READ_ACCESS_TOKEN: process.env.TMDB_API_READ_ACCESS_TOKEN?.trim() || '',
  OMDB_API_KEY: process.env.OMDB_API_KEY?.trim() || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
  LLM_API_KEY: process.env.LLM_API_KEY?.trim() || '',
  LLM_API_BASE_URL: process.env.LLM_API_BASE_URL?.trim() || 'https://api.deepseek.com/v1',
  LLM_MODEL: process.env.LLM_MODEL?.trim() || 'deepseek-chat',
};

export function isTmdbConfigured(): boolean {
  return Boolean(CONFIG.TMDB_API_READ_ACCESS_TOKEN && CONFIG.TMDB_API_READ_ACCESS_TOKEN.length > 10);
}

export function isOmdbConfigured(): boolean {
  return Boolean(CONFIG.OMDB_API_KEY && CONFIG.OMDB_API_KEY.length > 3);
}

export function isGeminiConfigured(): boolean {
  return Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 10);
}

export function isLlmConfigured(): boolean {
  return isGeminiConfigured() || Boolean(CONFIG.LLM_API_KEY && CONFIG.LLM_API_KEY.length > 5);
}
