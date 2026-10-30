import axios from 'axios';
import { CONFIG, isTmdbConfigured } from '../config';
import { MediaItem, MediaDetail, CastMember, VideoItem } from '../types';
import { CURATED_TITLES, GENRE_MAP } from './curated-cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbService {
  private static getHeaders() {
    return {
      Authorization: `Bearer ${CONFIG.TMDB_API_READ_ACCESS_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'application/json',
    };
  }

  /**
   * Helper to format a raw TMDB movie or TV item into MediaItem
   */
  public static formatItem(item: any, mediaType?: 'movie' | 'tv'): MediaItem {
    const type: 'movie' | 'tv' = mediaType || (item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie');
    const isMovie = type === 'movie';
    const releaseDate = isMovie ? (item.release_date || '') : (item.first_air_date || '');
    const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : 0;
    const title = isMovie ? (item.title || item.original_title || '') : (item.name || item.original_name || '');
    const originalTitle = isMovie ? (item.original_title || '') : (item.original_name || '');

    const genreIds: number[] = item.genre_ids || (item.genres ? item.genres.map((g: any) => g.id) : []);
    const genres: string[] = genreIds
      .map(id => GENRE_MAP[id]?.fa || GENRE_MAP[id]?.en)
      .filter((g): g is string => Boolean(g));

    return {
      id: item.id,
      tmdbId: item.id,
      mediaType: type,
      title,
      originalTitle,
      titleFa: item.titleFa || undefined,
      overview: item.overview || '',
      overviewFa: item.overviewFa || undefined,
      posterPath: item.poster_path ? item.poster_path : null,
      backdropPath: item.backdrop_path ? item.backdrop_path : null,
      releaseDate,
      releaseYear,
      voteAverage: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
      voteCount: item.vote_count || 0,
      genreIds,
      genres,
      popularity: item.popularity || 0,
      runtime: isMovie ? item.runtime : (item.episode_run_time?.[0] || undefined),
      numberOfSeasons: item.number_of_seasons || undefined,
      numberOfEpisodes: item.number_of_episodes || undefined,
      tagline: item.tagline || undefined,
    };
  }

  /**
   * Discover movies from TMDB API
   */
  public static async discoverMovies(params: {
    withGenres?: string;
    withoutGenres?: string;
    voteAverageGte?: number;
    voteCountGte?: number;
    year?: number;
    yearGte?: number;
    yearLte?: number;
    sortBy?: string;
    page?: number;
  }): Promise<MediaItem[]> {
    if (!isTmdbConfigured()) {
      return this.filterCurated('movie', params);
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        headers: this.getHeaders(),
        params: {
          include_adult: false,
          include_video: false,
          language: 'en-US',
          page: params.page || 1,
          sort_by: params.sortBy || 'popularity.desc',
          with_genres: params.withGenres,
          without_genres: params.withoutGenres,
          'vote_average.gte': params.voteAverageGte,
          'vote_count.gte': params.voteCountGte ?? 50,
          primary_release_year: params.year,
          'primary_release_date.gte': params.yearGte ? `${params.yearGte}-01-01` : undefined,
          'primary_release_date.lte': params.yearLte ? `${params.yearLte}-12-31` : undefined,
        },
        timeout: 7000,
      });

      return response.data.results.map((r: any) => this.formatItem(r, 'movie'));
    } catch (err: any) {
      console.warn('[TmdbService.discoverMovies] API request failed, using curated items:', err?.message);
      return this.filterCurated('movie', params);
    }
  }

  /**
   * Discover TV shows from TMDB API
   */
  public static async discoverTv(params: {
    withGenres?: string;
    withoutGenres?: string;
    voteAverageGte?: number;
    voteCountGte?: number;
    year?: number;
    yearGte?: number;
    yearLte?: number;
    sortBy?: string;
    page?: number;
  }): Promise<MediaItem[]> {
    if (!isTmdbConfigured()) {
      return this.filterCurated('tv', params);
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        headers: this.getHeaders(),
        params: {
          include_adult: false,
          include_null_first_air_dates: false,
          language: 'en-US',
          page: params.page || 1,
          sort_by: params.sortBy || 'popularity.desc',
          with_genres: params.withGenres,
          without_genres: params.withoutGenres,
          'vote_average.gte': params.voteAverageGte,
          'vote_count.gte': params.voteCountGte ?? 30,
          first_air_date_year: params.year,
          'first_air_date.gte': params.yearGte ? `${params.yearGte}-01-01` : undefined,
          'first_air_date.lte': params.yearLte ? `${params.yearLte}-12-31` : undefined,
        },
        timeout: 7000,
      });

      return response.data.results.map((r: any) => this.formatItem(r, 'tv'));
    } catch (err: any) {
      console.warn('[TmdbService.discoverTv] API request failed, using curated items:', err?.message);
      return this.filterCurated('tv', params);
    }
  }

  /**
   * Search multi (Movies and TV)
   */
  public static async searchMulti(query: string, page: number = 1): Promise<MediaItem[]> {
    if (!query.trim()) return [];

    if (!isTmdbConfigured()) {
      const q = query.toLowerCase().trim();
      return CURATED_TITLES.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.originalTitle.toLowerCase().includes(q) ||
        (item.titleFa && item.titleFa.toLowerCase().includes(q)) ||
        (item.overview && item.overview.toLowerCase().includes(q))
      );
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        headers: this.getHeaders(),
        params: {
          query,
          page,
          include_adult: false,
          language: 'en-US',
        },
        timeout: 7000,
      });

      return response.data.results
        .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
        .map((r: any) => this.formatItem(r));
    } catch (err: any) {
      console.warn('[TmdbService.searchMulti] search failed, checking curated:', err?.message);
      const q = query.toLowerCase().trim();
      return CURATED_TITLES.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.titleFa && item.titleFa.toLowerCase().includes(q))
      );
    }
  }

  /**
   * Get detailed media item by ID
   */
  public static async getDetails(mediaType: 'movie' | 'tv', id: number): Promise<MediaDetail | null> {
    // First check curated cache for Persian metadata enrichment
    const cached = CURATED_TITLES.find(c => c.id === id && c.mediaType === mediaType);

    if (!isTmdbConfigured()) {
      if (cached) return cached;
      // return first item or null
      return CURATED_TITLES.find(c => c.id === id) || null;
    }

    try {
      const endpoint = mediaType === 'movie' ? `${TMDB_BASE_URL}/movie/${id}` : `${TMDB_BASE_URL}/tv/${id}`;
      const response = await axios.get(endpoint, {
        headers: this.getHeaders(),
        params: {
          append_to_response: 'credits,videos,similar,recommendations',
          language: 'en-US',
        },
        timeout: 8000,
      });

      const data = response.data;
      const base = this.formatItem(data, mediaType);

      // Extract director / creators
      let director: string | undefined;
      const creators: string[] = [];

      if (mediaType === 'movie' && data.credits?.crew) {
        const dir = data.credits.crew.find((c: any) => c.job === 'Director');
        if (dir) director = dir.name;
      } else if (mediaType === 'tv') {
        if (data.created_by && Array.isArray(data.created_by)) {
          creators.push(...data.created_by.map((c: any) => c.name));
        }
      }

      // Cast
      const cast: CastMember[] = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profilePath: c.profile_path,
        order: c.order,
      }));

      // Videos (Trailers)
      const videos: VideoItem[] = (data.videos?.results || [])
        .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
        .slice(0, 4)
        .map((v: any) => ({
          id: v.id,
          key: v.key,
          name: v.name,
          site: v.site,
          type: v.type,
          official: Boolean(v.official),
        }));

      // Similar
      const similar: MediaItem[] = (data.similar?.results || []).slice(0, 8).map((r: any) => this.formatItem(r, mediaType));

      // Recommendations
      const recommendations: MediaItem[] = (data.recommendations?.results || []).slice(0, 8).map((r: any) => this.formatItem(r, mediaType));

      return {
        ...base,
        titleFa: cached?.titleFa || base.titleFa,
        overviewFa: cached?.overviewFa || base.overviewFa,
        imdbId: data.imdb_id,
        director: director || cached?.director,
        creators: creators.length > 0 ? creators : cached?.creators,
        cast: cast.length > 0 ? cast : (cached?.cast || []),
        videos: videos.length > 0 ? videos : (cached?.videos || []),
        similar: similar.length > 0 ? similar : (cached?.similar || []),
        recommendations: recommendations.length > 0 ? recommendations : (cached?.recommendations || []),
        status: data.status,
        budget: data.budget,
        revenue: data.revenue,
      };
    } catch (err: any) {
      console.warn(`[TmdbService.getDetails] Failed for ${mediaType}/${id}:`, err?.message);
      return cached || null;
    }
  }

  /**
   * Get Trending titles
   */
  public static async getTrending(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<MediaItem[]> {
    if (!isTmdbConfigured()) {
      return CURATED_TITLES.slice(0, 10);
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/all/${timeWindow}`, {
        headers: this.getHeaders(),
        params: { page, language: 'en-US' },
        timeout: 7000,
      });

      return response.data.results
        .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
        .map((r: any) => this.formatItem(r));
    } catch (err: any) {
      console.warn('[TmdbService.getTrending] fallback to curated:', err?.message);
      return CURATED_TITLES.slice(0, 10);
    }
  }

  /**
   * Fallback filter for curated list
   */
  private static filterCurated(mediaType: 'movie' | 'tv', params: any): MediaItem[] {
    let list = CURATED_TITLES.filter(item => item.mediaType === mediaType);

    if (params.withGenres) {
      const targetIds = params.withGenres.split(',').map((id: string) => parseInt(id, 10));
      list = list.filter(item => item.genreIds.some(gid => targetIds.includes(gid)));
    }

    if (params.voteAverageGte) {
      list = list.filter(item => item.voteAverage >= params.voteAverageGte);
    }

    return list;
  }
}
