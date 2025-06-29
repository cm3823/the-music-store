import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api.js';

// Initial state
const initialState = {
  albums: [],
  searchResults: [],
  loading: false,
  error: null,
  isSearching: false,
  searchQuery: '',
  searchType: 'all',
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ALBUMS: 'SET_ALBUMS',
  ADD_ALBUM: 'ADD_ALBUM',
  REMOVE_ALBUM: 'REMOVE_ALBUM',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
};

// Reducer function
function albumReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case ACTIONS.SET_SEARCH_LOADING:
      return { ...state, isSearching: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false, isSearching: false };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTIONS.SET_ALBUMS:
      return { ...state, albums: action.payload, loading: false };
    
    case ACTIONS.ADD_ALBUM:
      return { 
        ...state, 
        albums: [action.payload, ...state.albums], 
        loading: false 
      };
    
    case ACTIONS.REMOVE_ALBUM:
      return { 
        ...state, 
        albums: state.albums.filter(album => album.id !== action.payload),
        loading: false 
      };
    
    case ACTIONS.SET_SEARCH_RESULTS:
      return { 
        ...state, 
        searchResults: action.payload, 
        isSearching: false 
      };
    
    case ACTIONS.CLEAR_SEARCH:
      return { 
        ...state, 
        searchResults: [], 
        searchQuery: '', 
        isSearching: false 
      };
    
    case ACTIONS.SET_SEARCH_QUERY:
      return { 
        ...state, 
        searchQuery: action.payload.query, 
        searchType: action.payload.type 
      };
    
    default:
      return state;
  }
}

// Create context
const AlbumContext = createContext();

// Context provider component
export function AlbumProvider({ children }) {
  const [state, dispatch] = useReducer(albumReducer, initialState);

  // Load user's albums on mount
  useEffect(() => {
    loadAlbums();
  }, []);

  // Actions
  const loadAlbums = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiService.getAlbums();
      dispatch({ type: ACTIONS.SET_ALBUMS, payload: response.data || [] });
    } catch (error) {
      console.error('Failed to load albums:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const addAlbum = async (albumData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await apiService.addAlbum(albumData);
      dispatch({ type: ACTIONS.ADD_ALBUM, payload: response.data });
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Failed to add album:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const removeAlbum = async (albumId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await apiService.removeAlbum(albumId);
      dispatch({ type: ACTIONS.REMOVE_ALBUM, payload: albumId });
      return { success: true };
    } catch (error) {
      console.error('Failed to remove album:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const searchAlbums = async (query, type = 'all') => {
    if (!query || query.trim().length < 2) {
      dispatch({ type: ACTIONS.CLEAR_SEARCH });
      return;
    }

    dispatch({ type: ACTIONS.SET_SEARCH_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: { query, type } });
    
    try {
      const response = await apiService.searchAlbums(query, type);
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: response.data || [] });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to search albums:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const clearSearch = () => {
    dispatch({ type: ACTIONS.CLEAR_SEARCH });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    albums: state.albums,
    searchResults: state.searchResults,
    loading: state.loading,
    error: state.error,
    isSearching: state.isSearching,
    searchQuery: state.searchQuery,
    searchType: state.searchType,
    
    // Actions
    loadAlbums,
    addAlbum,
    removeAlbum,
    searchAlbums,
    clearSearch,
    clearError,
  };

  return (
    <AlbumContext.Provider value={value}>
      {children}
    </AlbumContext.Provider>
  );
}

// Custom hook to use the album context
export function useAlbums() {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error('useAlbums must be used within an AlbumProvider');
  }
  return context;
}

export default AlbumContext;