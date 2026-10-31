import axios from 'axios';
import { MediaItem, MediaDetail, CastMember } from '../types';
import { GENRE_MAP } from './curated-cache';

const TVMAZE_BASE = 'https://api.tvmaze.com';

export class TvMazeService {
  /**
   * Search shows on TVmaze
   */
  public static async search(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];

    try {
      const res = await axios.get(`${TVMAZE_BASE}/search/shows`, {
        params: { q: query },
        timeout: 7000,
      });

      return res.data.map((entry: any) => this.formatShow(entry.show));
    } catch (err: any) {
      console.warn('[TvMazeService.search] failed:', err.message);
      return [];
    }
  }

  /**
   * Get show details with cast
   */
  public static async getShow(id: number): Promise<MediaDetail | null> {
    try {
      const res = await axios.get(`${TVMAZE_BASE}/shows/${id}`, {
        params: { embed: 'cast' },
        timeout: 7000,
      });

      const show = res.data;
      const base = this.formatShow(show);

      const cast: CastMember[] = (show._embedded?.cast || []).slice(0, 10).map((c: any, index: number) => ({
        id: c.person.id,
        name: c.person.name,
        character: c.character.name,
        profilePath: c.person.image?.medium || null,
        order: index,
      }));

      return {
        ...base,
        cast,
        videos: [],
        similar: [],
        recommendations: [],
      };
    } catch (err: any) {
      console.warn(`[TvMazeService.getShow] failed for ${id}:`, err.message);
      return null;
    }
  }

  /**
   * Format TVmaze raw show object into MediaItem
   */
  public static formatShow(show: any): MediaItem {
    const cleanSummary = (show.summary || '').replace(/<[^>]*>?/gm, '').trim();
    const releaseYear = show.premiered ? parseInt(show.premiered.substring(0, 4), 10) : 0;

    const genreNames: string[] = (show.genres || []).map((g: string) => {
      // Find matching Persian genre translation
      const match = Object.values(GENRE_MAP).find(gm => gm.en.toLowerCase() === g.toLowerCase());
      return match ? match.fa : g;
    });

    const poster = show.image?.original || show.image?.medium || null;

    return {
      id: show.id,
      tmdbId: show.id,
      mediaType: 'tv',
      title: show.name,
      originalTitle: show.name,
      overview: cleanSummary,
      posterPath: poster,
      backdropPath: poster,
      releaseDate: show.premiered || '',
      releaseYear,
      voteAverage: show.rating?.average || 7.8,
      voteCount: 1500,
      genreIds: [],
      genres: genreNames,
      popularity: show.weight || 90,
      runtime: show.averageRuntime || show.runtime || undefined,
      numberOfSeasons: 1,
    };
  }
}
