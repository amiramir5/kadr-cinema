import axios from 'axios';
import { MediaItem, MediaDetail, CastMember } from '../types';
import { GENRE_MAP } from './curated-cache';

const OMDB_BASE = 'https://www.omdbapi.com';

export class ClientOmdbService {
  private static getApiKey(): string {
    return import.meta.env.VITE_OMDB_API_KEY || 'c1931b93';
  }

  /**
   * Search movies using OMDb API
   */
  public static async search(query: string): Promise<MediaItem[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const apiKey = this.getApiKey();
      const res = await axios.get(OMDB_BASE, {
        params: {
          apikey: apiKey,
          s: q,
          type: 'movie',
        },
        timeout: 6000,
      });

      if (res.data.Response !== 'True' || !Array.isArray(res.data.Search)) {
        return [];
      }

      return res.data.Search.map((item: any) => this.formatSearchItem(item));
    } catch (err: any) {
      console.warn('[ClientOmdbService.search] failed:', err.message);
      return [];
    }
  }

  /**
   * Get movie detail by IMDb ID (e.g. "tt1375666") or numeric ID
   */
  public static async getMovie(idOrImdbId: string | number): Promise<MediaDetail | null> {
    try {
      const apiKey = this.getApiKey();
      const imdbId = typeof idOrImdbId === 'string' && idOrImdbId.startsWith('tt')
        ? idOrImdbId
        : `tt${String(idOrImdbId).padStart(7, '0')}`;

      const res = await axios.get(OMDB_BASE, {
        params: {
          apikey: apiKey,
          i: imdbId,
          plot: 'full',
        },
        timeout: 6000,
      });

      if (res.data.Response !== 'True') {
        // If not found by tt padded, try title search fallback
        return null;
      }

      return this.formatMovieDetail(res.data);
    } catch (err: any) {
      console.warn('[ClientOmdbService.getMovie] failed:', err.message);
      return null;
    }
  }

  /**
   * Query movie detail by title
   */
  public static async getByTitle(title: string, year?: number): Promise<MediaDetail | null> {
    try {
      const apiKey = this.getApiKey();
      const params: any = {
        apikey: apiKey,
        t: title,
        type: 'movie',
        plot: 'full',
      };
      if (year) params.y = year;

      const res = await axios.get(OMDB_BASE, { params, timeout: 6000 });
      if (res.data.Response !== 'True') return null;

      return this.formatMovieDetail(res.data);
    } catch (err: any) {
      console.warn('[ClientOmdbService.getByTitle] failed:', err.message);
      return null;
    }
  }

  /**
   * Convert search result item to MediaItem
   */
  private static formatSearchItem(item: any): MediaItem {
    const numId = this.imdbIdToNumeric(item.imdbID);
    const year = parseInt(item.Year?.substring(0, 4) || '0', 10);
    const poster = item.Poster && item.Poster !== 'N/A'
      ? item.Poster.replace(/^http:\/\//i, 'https://')
      : null;

    return {
      id: numId,
      tmdbId: numId,
      mediaType: 'movie',
      title: item.Title,
      originalTitle: item.Title,
      overview: `${item.Title} (${item.Year})`,
      posterPath: poster,
      backdropPath: poster,
      releaseDate: item.Year ? `${item.Year}-01-01` : '',
      releaseYear: year,
      voteAverage: 7.8,
      voteCount: 1000,
      genreIds: [],
      genres: ['سینمایی'],
      popularity: 100,
      imdbId: item.imdbID,
    };
  }

  /**
   * Format full OMDb response to MediaDetail
   */
  private static formatMovieDetail(data: any): MediaDetail {
    const numId = this.imdbIdToNumeric(data.imdbID);
    const year = parseInt(data.Year?.substring(0, 4) || '0', 10);
    const poster = data.Poster && data.Poster !== 'N/A'
      ? data.Poster.replace(/^http:\/\//i, 'https://')
      : null;

    const runtimeMatch = (data.Runtime || '').match(/\d+/);
    const runtime = runtimeMatch ? parseInt(runtimeMatch[0], 10) : undefined;

    const imdbRatingNum = parseFloat(data.imdbRating || '7.5');
    const voteAverage = isNaN(imdbRatingNum) ? 7.5 : imdbRatingNum;

    // Genres mapping
    const rawGenres = (data.Genre || '').split(',').map((g: string) => g.trim()).filter(Boolean);
    const genreNames: string[] = rawGenres.map((g: string) => {
      const match = Object.values(GENRE_MAP).find(gm => gm.en.toLowerCase() === g.toLowerCase());
      return match ? match.fa : g;
    });

    const genreIds: number[] = rawGenres.map((g: string) => {
      const entry = Object.entries(GENRE_MAP).find(([_, gm]) => gm.en.toLowerCase() === g.toLowerCase());
      return entry ? parseInt(entry[0], 10) : 0;
    }).filter((id: number) => id > 0);

    // Cast members
    const actorNames = (data.Actors || '').split(',').map((a: string) => a.trim()).filter(Boolean);
    const cast: CastMember[] = actorNames.map((name: string, index: number) => ({
      id: index + 1,
      name,
      character: 'بازیگر',
      profilePath: null,
      order: index,
    }));

    return {
      id: numId,
      tmdbId: numId,
      mediaType: 'movie',
      title: data.Title,
      originalTitle: data.Title,
      overview: data.Plot && data.Plot !== 'N/A' ? data.Plot : '',
      posterPath: poster,
      backdropPath: poster,
      releaseDate: data.Released && data.Released !== 'N/A' ? data.Released : (data.Year || ''),
      releaseYear: year,
      voteAverage,
      voteCount: parseInt((data.imdbVotes || '5000').replace(/,/g, ''), 10) || 5000,
      genreIds,
      genres: genreNames.length > 0 ? genreNames : ['سینمایی'],
      popularity: 120,
      runtime,
      imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : undefined,
      imdbId: data.imdbID,
      director: data.Director && data.Director !== 'N/A' ? data.Director : undefined,
      tagline: data.Awards && data.Awards !== 'N/A' ? data.Awards : undefined,
      cast,
      videos: [],
      similar: [],
      recommendations: [],
    };
  }

  /**
   * Helper to turn IMDb ID like "tt1375666" into a stable integer
   */
  public static imdbIdToNumeric(imdbId: string): number {
    if (!imdbId) return Math.floor(Math.random() * 900000) + 100000;
    const digits = imdbId.replace(/\D/g, '');
    const num = parseInt(digits, 10);
    return isNaN(num) ? Math.floor(Math.random() * 900000) + 100000 : num;
  }
}
