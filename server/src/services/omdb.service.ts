import axios from 'axios';
import { CONFIG, isOmdbConfigured } from '../config';

interface OmdbData {
  imdbRating?: string;
  imdbVotes?: string;
  metascore?: string;
  rottenTomatoes?: string;
  awards?: string;
}

const omdbCache = new Map<string, OmdbData>();

export class OmdbService {
  /**
   * Fetch IMDb details using IMDb ID or title & year
   */
  public static async getRatings(imdbId?: string, title?: string, year?: number): Promise<OmdbData | null> {
    if (!isOmdbConfigured()) {
      return null;
    }

    const cacheKey = imdbId || `${title}_${year}`;
    if (omdbCache.has(cacheKey)) {
      return omdbCache.get(cacheKey) || null;
    }

    try {
      const params: any = {
        apikey: CONFIG.OMDB_API_KEY,
      };

      if (imdbId) {
        params.i = imdbId;
      } else if (title) {
        params.t = title;
        if (year) params.y = year;
      } else {
        return null;
      }

      const res = await axios.get('https://www.omdbapi.com/', { params, timeout: 5000 });
      if (res.data && res.data.Response !== 'False') {
        const rtRating = res.data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes')?.Value;
        const data: OmdbData = {
          imdbRating: res.data.imdbRating !== 'N/A' ? res.data.imdbRating : undefined,
          imdbVotes: res.data.imdbVotes !== 'N/A' ? res.data.imdbVotes : undefined,
          metascore: res.data.Metascore !== 'N/A' ? res.data.Metascore : undefined,
          rottenTomatoes: rtRating,
          awards: res.data.Awards !== 'N/A' ? res.data.Awards : undefined,
        };

        omdbCache.set(cacheKey, data);
        return data;
      }
      return null;
    } catch (err: any) {
      console.warn('[OmdbService] Request failed:', err?.message);
      return null;
    }
  }
}
