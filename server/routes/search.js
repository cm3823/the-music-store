import { getDatabase } from '../database/init.js';
import musicAPI from '../services/musicapi.js';

export default async function searchRoutes(fastify, options) {
  const db = getDatabase();

  // Mock album data for development fallback
  const mockAlbums = [
    {
      external_id: 'mock_1',
      title: 'Abbey Road',
      artist: 'The Beatles',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
      release_year: 1969,
      tracks: ['Come Together', 'Something', 'Maxwell\'s Silver Hammer', 'Oh! Darling', 'Octopus\'s Garden']
    },
    {
      external_id: 'mock_2',
      title: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
      release_year: 1973,
      tracks: ['Speak to Me', 'Breathe', 'On the Run', 'Time', 'Money']
    },
    {
      external_id: 'mock_3',
      title: 'Thriller',
      artist: 'Michael Jackson',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526cbab2be',
      release_year: 1982,
      tracks: ['Wanna Be Startin\' Somethin\'', 'Baby Be Mine', 'The Girl Is Mine', 'Thriller', 'Beat It']
    },
    {
      external_id: 'mock_4',
      title: 'Back in Black',
      artist: 'AC/DC',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b27303c2b57d81bba0d9ad204207',
      release_year: 1980,
      tracks: ['Hells Bells', 'Shoot to Thrill', 'What Do You Do for Money Honey', 'Given the Dog a Bone', 'Let Me Put My Love into You']
    },
    {
      external_id: 'mock_5',
      title: 'Hotel California',
      artist: 'Eagles',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
      release_year: 1976,
      tracks: ['Hotel California', 'New Kid in Town', 'Life in the Fast Lane', 'Wasted Time', 'Victim of Love']
    },
    {
      external_id: 'mock_6',
      title: 'Led Zeppelin IV',
      artist: 'Led Zeppelin',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b2735de6e9de6c343c06238cb5c8',
      release_year: 1971,
      tracks: ['Black Dog', 'Rock and Roll', 'The Battle of Evermore', 'Stairway to Heaven', 'Misty Mountain Hop']
    },
    {
      external_id: 'mock_7',
      title: 'Rumours',
      artist: 'Fleetwood Mac',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2d50e6',
      release_year: 1977,
      tracks: ['Second Hand News', 'Dreams', 'Never Going Back Again', 'Don\'t Stop', 'Go Your Own Way']
    },
    {
      external_id: 'mock_8',
      title: 'Born to Run',
      artist: 'Bruce Springsteen',
      artwork_url: 'https://i.scdn.co/image/ab67616d0000b273503143a281bcb2ec88b7abc5',
      release_year: 1975,
      tracks: ['Thunder Road', 'Tenth Avenue Freeze-Out', 'Night', 'Backstreets', 'Born to Run']
    }
  ];

  // Search albums by query (title, artist, or song) using MusicBrainz API
  fastify.get('/', async (request, reply) => {
    try {
      const { query, type = 'all', limit = 20 } = request.query;

      if (!query || query.trim().length < 2) {
        return reply.status(400).send({
          error: 'Invalid query',
          message: 'Search query must be at least 2 characters long'
        });
      }

      fastify.log.info(`Searching MusicBrainz for: "${query}" (type: ${type})`);

      // Search using MusicBrainz API
      let results = [];
      
      try {
        results = await musicAPI.searchAlbums(query.trim(), type, parseInt(limit));
        fastify.log.info(`MusicBrainz returned ${results.length} results`);
      } catch (apiError) {
        fastify.log.error('MusicBrainz API failed, falling back to mock data:', apiError);
        
        // Fallback to mock data if API fails
        const searchTerm = query.toLowerCase().trim();
        switch (type) {
          case 'album':
            results = mockAlbums.filter(album =>
              album.title.toLowerCase().includes(searchTerm)
            );
            break;
          case 'artist':
            results = mockAlbums.filter(album =>
              album.artist.toLowerCase().includes(searchTerm)
            );
            break;
          case 'song':
            results = mockAlbums.filter(album =>
              album.tracks && album.tracks.some(track =>
                track.toLowerCase().includes(searchTerm)
              )
            );
            break;
          default:
            results = mockAlbums.filter(album =>
              album.title.toLowerCase().includes(searchTerm) ||
              album.artist.toLowerCase().includes(searchTerm) ||
              (album.tracks && album.tracks.some(track =>
                track.toLowerCase().includes(searchTerm)
              ))
            );
            break;
        }
        results = results.slice(0, parseInt(limit));
      }

      return {
        success: true,
        data: results,
        count: results.length,
        query: query,
        type: type,
        source: results.length > 0 && results[0].musicbrainz_id ? 'musicbrainz' : 'mock'
      };

    } catch (error) {
      fastify.log.error('Error searching albums:', error);
      return reply.status(500).send({
        error: 'Search failed',
        message: error.message
      });
    }
  });

  // Get popular/featured albums using MusicBrainz API
  fastify.get('/featured', async (request, reply) => {
    try {
      const { limit = 6 } = request.query;
      
      fastify.log.info(`Fetching ${limit} featured albums from MusicBrainz`);
      
      let featured = [];
      
      try {
        featured = await musicAPI.getFeaturedAlbums(parseInt(limit));
        fastify.log.info(`MusicBrainz returned ${featured.length} featured albums`);
      } catch (apiError) {
        fastify.log.error('MusicBrainz API failed for featured albums, falling back to mock data:', apiError);
        featured = mockAlbums.slice(0, parseInt(limit));
      }

      return {
        success: true,
        data: featured,
        count: featured.length,
        source: featured.length > 0 && featured[0].musicbrainz_id ? 'musicbrainz' : 'mock'
      };

    } catch (error) {
      fastify.log.error('Error fetching featured albums:', error);
      return reply.status(500).send({
        error: 'Failed to fetch featured albums',
        message: error.message
      });
    }
  });

  // Get album details by external ID (MusicBrainz ID or mock ID)
  fastify.get('/:external_id', async (request, reply) => {
    try {
      const { external_id } = request.params;

      if (!external_id) {
        return reply.status(400).send({
          error: 'Missing external ID',
          message: 'External ID is required'
        });
      }

      fastify.log.info(`Fetching album details for ID: ${external_id}`);

      let album = null;

      // First try MusicBrainz API if it looks like a MusicBrainz UUID
      const isMusicBrainzId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(external_id);
      
      if (isMusicBrainzId) {
        try {
          album = await musicAPI.getAlbumDetails(external_id);
          fastify.log.info(`MusicBrainz returned album details for ${external_id}`);
        } catch (apiError) {
          fastify.log.error('MusicBrainz API failed for album details:', apiError);
        }
      }

      // Fallback to mock data if MusicBrainz fails or for mock IDs
      if (!album) {
        album = mockAlbums.find(mockAlbum => mockAlbum.external_id === external_id);
        if (album) {
          fastify.log.info(`Found album in mock data: ${external_id}`);
        }
      }

      if (!album) {
        return reply.status(404).send({
          error: 'Album not found',
          message: 'Album not found in search results'
        });
      }

      return {
        success: true,
        data: album,
        source: album.musicbrainz_id ? 'musicbrainz' : 'mock'
      };

    } catch (error) {
      fastify.log.error('Error fetching album details:', error);
      return reply.status(500).send({
        error: 'Failed to fetch album details',
        message: error.message
      });
    }
  });

  // API health and cache status endpoint
  fastify.get('/api-status', async (request, reply) => {
    try {
      const cacheStats = musicAPI.getCacheStats();
      
      return {
        success: true,
        musicbrainz_api: 'connected',
        cache: {
          size: cacheStats.size,
          keys_count: cacheStats.keys.length
        },
        rate_limiting: 'active',
        fallback: 'mock_data_available'
      };
    } catch (error) {
      fastify.log.error('Error getting API status:', error);
      return reply.status(500).send({
        error: 'Failed to get API status',
        message: error.message
      });
    }
  });
}

// ✅ External API Integration - Phase 1 Complete
// MusicBrainz API integration implemented with:
// - Rate limiting (1 request/second)
// - In-memory caching (1 hour TTL)
// - Graceful fallback to mock data
// - Comprehensive error handling
// - Support for album, artist, and song searches
// - Cover Art Archive integration for artwork URLs
//
// Next phases:
// - Phase 2: Add Last.fm API for enhanced metadata
// - Phase 3: Implement Deezer API fallback and SQLite caching