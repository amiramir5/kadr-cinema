export type MediaType = 'movie' | 'tv' | 'all';

export interface Genre {
  id: number;
  name: string;
  nameFa: string;
}

export interface MediaItem {
  id: number;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  originalTitle: string;
  titleFa?: string;
  overview: string;
  overviewFa?: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  releaseYear: number;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  genres: string[];
  popularity: number;
  runtime?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  imdbRating?: string;
  imdbId?: string;
  director?: string;
  creators?: string[];
  tagline?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MediaDetail extends MediaItem {
  cast: CastMember[];
  videos: VideoItem[];
  similar: MediaItem[];
  recommendations: MediaItem[];
  status?: string;
  budget?: number;
  revenue?: number;
  matchReason?: string;
}

export interface StructuredInterpretation {
  mediaType: 'movie' | 'tv' | 'all';
  genres: string[];
  genreIds: number[];
  mood: string[];
  runtimeMax?: number;
  minimumRating?: number;
  releaseYearMin?: number;
  releaseYearMax?: number;
  narrativePreferences: string[];
  unwantedContent: string[];
  referenceTitles: string[];
  persianSummary: string;
  confidence: number;
  isAiPowered: boolean;
}

export interface ScoredRecommendation {
  media: MediaItem;
  score: number;
  matchScore: number;
  matchReasonFa: string;
  matchedAttributes: {
    genres: string[];
    moods: string[];
    narrativePoints: string[];
  };
}

export interface RecommendationResponse {
  interpretation: StructuredInterpretation;
  results: ScoredRecommendation[];
  totalFound: number;
  engineUsed: 'llm-hybrid' | 'persian-nlp-deterministic';
  tmdbLive: boolean;
}

export interface UserSavedItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  titleFa?: string;
  posterPath: string | null;
  releaseYear: number;
  voteAverage: number;
  genres: string[];
  savedAt: string;
  listType: 'watchlist' | 'favorite' | 'watched';
  userRating?: number;
  userNote?: string;
  numberOfSeasons?: number;
  runtime?: number;
}

export interface SearchHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  resultsCount: number;
}
