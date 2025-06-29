/**
 * MusicAPI Service - MusicBrainz API Integration
 * Provides unified music search functionality with caching and rate limiting
 */

export class MusicAPIService {
  constructor() {
    this.baseURL = 'https://musicbrainz.org/ws/2';
    this.userAgent = 'TheMusicStore/1.0 (https://github.com/chrismitchell/the-music-store)';
    this.cache = new Map(); // In-memory cache
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour TTL
    this.rateLimiter = {
      lastRequest: 0,
      minInterval: 1000 // 1 second between requests (MusicBrainz requirement)
    };
  }

  /**
   * Rate limiting to respect MusicBrainz API limits (1 request/second)
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimiter.lastRequest;
    
    if (timeSinceLastRequest < this.rateLimiter.minInterval) {
      const waitTime = this.rateLimiter.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.rateLimiter.lastRequest = Date.now();
  }

  /**
   * Check cache for existing results
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store result in cache
   */
  setCachedResult(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Make API request to MusicBrainz with proper headers and error handling
   */
  async makeRequest(endpoint, params = {}) {
    await this.waitForRateLimit();

    const url = new URL(`${this.baseURL}/${endpoint}`);
    url.searchParams.append('fmt', 'json');
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MusicBrainz API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for albums by various criteria
   */
  async searchAlbums(query, type = 'all', limit = 20) {
    const cacheKey = `search:${type}:${query}:${limit}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let searchQuery = '';
      
      // Build search query based on type
      switch (type) {
        case 'album':
          searchQuery = `release:"${query}"`;
          break;
        case 'artist':
          searchQuery = `artist:"${query}"`;
          break;
        case 'song':
          searchQuery = `recording:"${query}"`;
          break;
        default: // 'all'
          searchQuery = query;
          break;
      }

      const data = await this.makeRequest('release', {
        query: searchQuery,
        limit: limit,
        inc: 'artist-credits+recordings'
      });

      const albums = await this.transformMusicBrainzReleases(data.releases || []);
      
      // Cache the results
      this.setCachedResult(cacheKey, albums);
      
      return albums;
    } catch (error) {
      console.error('Album search failed:', error);
      // Return empty array instead of throwing to gracefully handle API failures
      return [];
    }
  }

  /**
   * Get detailed album information by MusicBrainz ID
   */
  async getAlbumDetails(mbid) {
    const cacheKey = `album:${mbid}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.makeRequest(`release/${mbid}`, {
        inc: 'artist-credits+recordings+media'
      });

      const album = await this.transformMusicBrainzRelease(data);
      
      // Cache the result
      this.setCachedResult(cacheKey, album);
      
      return album;
    } catch (error) {
      console.error('Album details fetch failed:', error);
      return null;
    }
  }

  /**
   * Transform MusicBrainz release data to our internal format
   */
  async transformMusicBrainzReleases(releases) {
    const results = [];
    
    for (const release of releases) {
      try {
        const transformed = await this.transformMusicBrainzRelease(release);
        if (transformed) {
          results.push(transformed);
        }
      } catch (error) {
        console.error('Failed to transform release:', error);
        // Continue with other releases
      }
    }
    
    return results;
  }

  /**
   * Transform single MusicBrainz release to our format
   */
  async transformMusicBrainzRelease(release) {
    try {
      const artistCredit = release['artist-credit'] || [];
      const artistName = artistCredit.length > 0 ? artistCredit[0].artist?.name : 'Unknown Artist';
      
      // Extract release year from date
      const releaseDate = release.date || release['first-release-date'] || '';
      const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0]) : null;
      
      // Get track listings if available
      const tracks = [];
      if (release.media && release.media.length > 0) {
        const media = release.media[0]; // First disc/medium
        if (media.tracks) {
          tracks.push(...media.tracks.map(track => track.title));
        }
      }

      // Generate Cover Art Archive URL (MusicBrainz provides this service)
      const artworkUrl = `https://coverartarchive.org/release/${release.id}/front-250`;

      return {
        external_id: release.id,
        title: release.title || 'Unknown Album',
        artist: artistName,
        artwork_url: artworkUrl,
        release_year: releaseYear,
        tracks: tracks.length > 0 ? tracks : null,
        musicbrainz_id: release.id,
        // Additional metadata
        genre: null, // MusicBrainz doesn't provide genre directly
        label: null, // Would need additional API call
        track_count: release.media?.[0]?.['track-count'] || tracks.length || null
      };
    } catch (error) {
      console.error('Transform error for release:', release.id, error);
      return null;
    }
  }

  /**
   * Get featured/popular albums (fallback method using well-known releases)
   */
  async getFeaturedAlbums(limit = 6) {
    const cacheKey = `featured:${limit}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for some popular/classic albums as featured content
      const popularQueries = [
        'Abbey Road Beatles',
        'Dark Side of the Moon Pink Floyd',
        'Thriller Michael Jackson',
        'Back in Black AC/DC',
        'Hotel California Eagles',
        'Led Zeppelin IV'
      ];

      const featured = [];
      
      for (let i = 0; i < Math.min(limit, popularQueries.length); i++) {
        try {
          const results = await this.searchAlbums(popularQueries[i], 'all', 1);
          if (results.length > 0) {
            featured.push(results[0]);
          }
        } catch (error) {
          console.error(`Failed to fetch featured album: ${popularQueries[i]}`, error);
          // Continue with other albums
        }
      }
      
      // Cache the results
      this.setCachedResult(cacheKey, featured);
      
      return featured;
    } catch (error) {
      console.error('Featured albums fetch failed:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const musicAPI = new MusicAPIService();
export default musicAPI;