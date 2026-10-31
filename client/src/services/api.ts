import axios from 'axios';
import { MediaItem, MediaDetail, RecommendationResponse, Genre } from '../types';
import { ClientEngine } from './client-engine';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const KadrApi = {
  /**
   * Get server & status
   */
  async getStatus(): Promise<{
    status: string;
    config: { tmdbLive: boolean; omdbLive: boolean; geminiLive: boolean; tvmazeLive: boolean };
    message: string;
  }> {
    try {
      const res = await apiClient.get('/status');
      return res.data;
    } catch {
      return {
        status: 'ok',
        config: { tmdbLive: false, omdbLive: false, geminiLive: true, tvmazeLive: true },
        message: 'متصل به دیتابیس آزاد TVmaze و موتور هوشمند کادر (GitHub Pages)',
      };
    }
  },

  /**
   * Intelligent recommendation by prompt & optional filters
   */
  async getRecommendations(params: {
    prompt: string;
    mediaType?: string;
    genreId?: number;
    minRating?: number;
    maxRuntime?: number;
  }): Promise<RecommendationResponse> {
    try {
      const res = await apiClient.post('/recommend', params);
      return res.data;
    } catch {
      return await ClientEngine.recommend(params);
    }
  },

  /**
   * Conversational refinement
   */
  async refineRecommendations(params: {
    originalPrompt: string;
    refinementPrompt: string;
    previousIds?: number[];
  }): Promise<RecommendationResponse> {
    try {
      const res = await apiClient.post('/recommend/refine', params);
      return res.data;
    } catch {
      return await ClientEngine.refine(params.originalPrompt, params.refinementPrompt);
    }
  },

  /**
   * Search titles
   */
  async search(query: string, page: number = 1): Promise<{ results: MediaItem[]; total: number }> {
    try {
      const res = await apiClient.get('/search', { params: { q: query, page } });
      return res.data;
    } catch {
      return await ClientEngine.search(query);
    }
  },

  /**
   * Explore with filters
   */
  async explore(filters: {
    type?: string;
    genre?: string | number;
    minRating?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  }): Promise<{ results: MediaItem[]; total: number }> {
    try {
      const res = await apiClient.get('/explore', { params: filters });
      return res.data;
    } catch {
      return await ClientEngine.explore(filters);
    }
  },

  /**
   * Get movie detail
   */
  async getMovie(id: number): Promise<MediaDetail> {
    try {
      const res = await apiClient.get(`/movie/${id}`);
      return res.data;
    } catch {
      const detail = await ClientEngine.getDetail(id);
      if (detail) return detail;
      throw new Error('عنوان یافت نشد');
    }
  },

  /**
   * Get TV detail
   */
  async getTv(id: number): Promise<MediaDetail> {
    try {
      const res = await apiClient.get(`/tv/${id}`);
      return res.data;
    } catch {
      const detail = await ClientEngine.getDetail(id);
      if (detail) return detail;
      throw new Error('عنوان یافت نشد');
    }
  },

  /**
   * Get trending
   */
  async getTrending(): Promise<{ results: MediaItem[] }> {
    try {
      const res = await apiClient.get('/trending');
      return res.data;
    } catch {
      return ClientEngine.getTrending();
    }
  },

  /**
   * Get genres list
   */
  async getGenres(): Promise<{ genres: Genre[] }> {
    try {
      const res = await apiClient.get('/genres');
      return res.data;
    } catch {
      return ClientEngine.getGenres();
    }
  },
};

/**
 * Helper to build poster URL
 */
export function getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'original' = 'w500'): string {
  if (!path) return './placeholder-poster.svg';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Helper to build backdrop URL
 */
export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
