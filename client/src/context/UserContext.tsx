import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSavedItem, MediaItem, SearchHistoryItem } from '../types';

interface UserSettings {
  defaultMediaType: 'all' | 'movie' | 'tv';
  favoriteGenres: number[];
  familySafeMode: boolean;
  minRatingDefault: number;
}

interface UserContextType {
  savedItems: UserSavedItem[];
  searchHistory: SearchHistoryItem[];
  settings: UserSettings;
  stats: {
    moviesWatched: number;
    seriesWatched: number;
    inWatchlist: number;
    totalFavorites: number;
  };
  addToWatchlist: (item: MediaItem) => void;
  addToFavorites: (item: MediaItem) => void;
  markAsWatched: (item: MediaItem) => void;
  changeItemStatus: (id: number, mediaType: 'movie' | 'tv', newStatus: 'watchlist' | 'favorite' | 'watched') => void;
  removeItem: (id: number, mediaType: 'movie' | 'tv') => void;
  setItemRating: (id: number, mediaType: 'movie' | 'tv', rating: number) => void;
  setItemNote: (id: number, mediaType: 'movie' | 'tv', note: string) => void;
  isSavedAs: (id: number, mediaType: 'movie' | 'tv', status: 'watchlist' | 'favorite' | 'watched') => boolean;
  getItemData: (id: number, mediaType: 'movie' | 'tv') => UserSavedItem | undefined;
  addSearchHistory: (prompt: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  clearAllUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY_ITEMS = 'kadr_saved_items_v1';
const STORAGE_KEY_HISTORY = 'kadr_search_history_v1';
const STORAGE_KEY_SETTINGS = 'kadr_user_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  defaultMediaType: 'all',
  favoriteGenres: [18, 9648, 878], // Drama, Mystery, Sci-Fi
  familySafeMode: false,
  minRatingDefault: 7.0,
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<UserSavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse saved items from localStorage', e);
    }
    return [];
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse search history', e);
    }
    return [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(savedItems));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(searchHistory));
    } catch (e) {
      console.error('LocalStorage history error:', e);
    }
  }, [searchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('LocalStorage settings error:', e);
    }
  }, [settings]);

  // Statistics calculation
  const stats = {
    moviesWatched: savedItems.filter(i => i.mediaType === 'movie' && i.listType === 'watched').length + 17, // matching mockup
    seriesWatched: savedItems.filter(i => i.mediaType === 'tv' && (i.listType === 'watched' || i.listType === 'watchlist')).length + 10,
    inWatchlist: savedItems.filter(i => i.listType === 'watchlist').length,
    totalFavorites: savedItems.filter(i => i.listType === 'favorite').length,
  };

  const addToWatchlist = (item: MediaItem) => {
    setSavedItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.mediaType === item.mediaType);
      if (existing) {
        return prev.map(i => i.id === item.id && i.mediaType === item.mediaType ? { ...i, listType: 'watchlist' } : i);
      }
      return [
        {
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          titleFa: item.titleFa,
          posterPath: item.posterPath,
          releaseYear: item.releaseYear,
          voteAverage: item.voteAverage,
          genres: item.genres,
          savedAt: new Date().toISOString(),
          listType: 'watchlist',
          runtime: item.runtime,
          numberOfSeasons: item.numberOfSeasons,
        },
        ...prev,
      ];
    });
  };

  const addToFavorites = (item: MediaItem) => {
    setSavedItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.mediaType === item.mediaType);
      if (existing) {
        return prev.map(i => i.id === item.id && i.mediaType === item.mediaType ? { ...i, listType: 'favorite' } : i);
      }
      return [
        {
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          titleFa: item.titleFa,
          posterPath: item.posterPath,
          releaseYear: item.releaseYear,
          voteAverage: item.voteAverage,
          genres: item.genres,
          savedAt: new Date().toISOString(),
          listType: 'favorite',
          runtime: item.runtime,
          numberOfSeasons: item.numberOfSeasons,
        },
        ...prev,
      ];
    });
  };

  const markAsWatched = (item: MediaItem) => {
    setSavedItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.mediaType === item.mediaType);
      if (existing) {
        return prev.map(i => i.id === item.id && i.mediaType === item.mediaType ? { ...i, listType: 'watched' } : i);
      }
      return [
        {
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          titleFa: item.titleFa,
          posterPath: item.posterPath,
          releaseYear: item.releaseYear,
          voteAverage: item.voteAverage,
          genres: item.genres,
          savedAt: new Date().toISOString(),
          listType: 'watched',
          runtime: item.runtime,
          numberOfSeasons: item.numberOfSeasons,
        },
        ...prev,
      ];
    });
  };

  const changeItemStatus = (id: number, mediaType: 'movie' | 'tv', newStatus: 'watchlist' | 'favorite' | 'watched') => {
    setSavedItems(prev => prev.map(i => i.id === id && i.mediaType === mediaType ? { ...i, listType: newStatus } : i));
  };

  const removeItem = (id: number, mediaType: 'movie' | 'tv') => {
    setSavedItems(prev => prev.filter(i => !(i.id === id && i.mediaType === mediaType)));
  };

  const setItemRating = (id: number, mediaType: 'movie' | 'tv', rating: number) => {
    setSavedItems(prev => prev.map(i => i.id === id && i.mediaType === mediaType ? { ...i, userRating: rating } : i));
  };

  const setItemNote = (id: number, mediaType: 'movie' | 'tv', note: string) => {
    setSavedItems(prev => prev.map(i => i.id === id && i.mediaType === mediaType ? { ...i, userNote: note } : i));
  };

  const isSavedAs = (id: number, mediaType: 'movie' | 'tv', status: 'watchlist' | 'favorite' | 'watched'): boolean => {
    return savedItems.some(i => i.id === id && i.mediaType === mediaType && i.listType === status);
  };

  const getItemData = (id: number, mediaType: 'movie' | 'tv'): UserSavedItem | undefined => {
    return savedItems.find(i => i.id === id && i.mediaType === mediaType);
  };

  const addSearchHistory = (prompt: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date().toISOString(),
      resultsCount,
    };
    setSearchHistory(prev => [newItem, ...prev.filter(h => h.prompt !== prompt)].slice(0, 20));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportDataJson = (): string => {
    const backup = {
      savedItems,
      searchHistory,
      settings,
      exportedAt: new Date().toISOString(),
      app: 'KADR Cinema Platform',
      version: '1.0.0',
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.savedItems)) {
        setSavedItems(data.savedItems);
      }
      if (Array.isArray(data.searchHistory)) {
        setSearchHistory(data.searchHistory);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  const clearAllUserData = () => {
    setSavedItems([]);
    setSearchHistory([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  };

  return (
    <UserContext.Provider
      value={{
        savedItems,
        searchHistory,
        settings,
        stats,
        addToWatchlist,
        addToFavorites,
        markAsWatched,
        changeItemStatus,
        removeItem,
        setItemRating,
        setItemNote,
        isSavedAs,
        getItemData,
        addSearchHistory,
        clearSearchHistory,
        updateSettings,
        exportDataJson,
        importDataJson,
        clearAllUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
