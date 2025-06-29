import { getDatabase } from '../database/init.js';

export default async function albumRoutes(fastify, options) {
  const db = getDatabase();
  
  // Prepared statements for better performance
  const getUserId = db.prepare('SELECT id FROM users WHERE username = ?');
  const getAlbums = db.prepare(`
    SELECT a.*, ua.added_at 
    FROM albums a 
    JOIN user_albums ua ON a.id = ua.album_id 
    WHERE ua.user_id = ? 
    ORDER BY ua.added_at DESC
  `);
  const insertAlbum = db.prepare(`
    INSERT INTO albums (title, artist, artwork_url, external_id, release_year)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertUserAlbum = db.prepare(`
    INSERT INTO user_albums (user_id, album_id)
    VALUES (?, ?)
  `);
  const removeUserAlbum = db.prepare(`
    DELETE FROM user_albums 
    WHERE user_id = ? AND album_id = ?
  `);
  const findExistingAlbum = db.prepare(`
    SELECT id FROM albums WHERE title = ? AND artist = ?
  `);
  const checkUserAlbum = db.prepare(`
    SELECT 1 FROM user_albums WHERE user_id = ? AND album_id = ?
  `);

  // Get user's album collection
  fastify.get('/', async (request, reply) => {
    try {
      // For now, use default user (single-user mode)
      const user = getUserId.get('default_user');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const albums = getAlbums.all(user.id);
      return {
        success: true,
        data: albums,
        count: albums.length
      };
    } catch (error) {
      fastify.log.error('Error fetching albums:', error);
      return reply.status(500).send({
        error: 'Failed to fetch albums',
        message: error.message
      });
    }
  });

  // Add album to collection
  fastify.post('/', async (request, reply) => {
    try {
      const { title, artist, artwork_url, external_id, release_year } = request.body;

      // Validate required fields
      if (!title || !artist) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'Title and artist are required'
        });
      }

      // Get default user
      const user = getUserId.get('default_user');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Check if album already exists
      let existingAlbum = findExistingAlbum.get(title, artist);
      let albumId;

      if (existingAlbum) {
        albumId = existingAlbum.id;
        
        // Check if user already has this album
        const userHasAlbum = checkUserAlbum.get(user.id, albumId);
        if (userHasAlbum) {
          return reply.status(409).send({
            error: 'Album already in collection',
            message: `"${title}" by ${artist} is already in your collection`
          });
        }
      } else {
        // Insert new album
        const result = insertAlbum.run(title, artist, artwork_url, external_id, release_year);
        albumId = result.lastInsertRowid;
      }

      // Add album to user's collection
      insertUserAlbum.run(user.id, albumId);

      // Fetch and return the added album
      const addedAlbum = getAlbums.get(user.id);
      
      return reply.status(201).send({
        success: true,
        message: 'Album added to collection',
        data: addedAlbum
      });

    } catch (error) {
      fastify.log.error('Error adding album:', error);
      
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(409).send({
          error: 'Album already exists',
          message: 'This album is already in your collection'
        });
      }

      return reply.status(500).send({
        error: 'Failed to add album',
        message: error.message
      });
    }
  });

  // Remove album from collection
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Validate album ID
      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send({
          error: 'Invalid album ID',
          message: 'Album ID must be a valid number'
        });
      }

      // Get default user
      const user = getUserId.get('default_user');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Remove album from user's collection
      const result = removeUserAlbum.run(user.id, parseInt(id));
      
      if (result.changes === 0) {
        return reply.status(404).send({
          error: 'Album not found',
          message: 'Album not found in your collection'
        });
      }

      return {
        success: true,
        message: 'Album removed from collection'
      };

    } catch (error) {
      fastify.log.error('Error removing album:', error);
      return reply.status(500).send({
        error: 'Failed to remove album',
        message: error.message
      });
    }
  });

  // Get album by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send({
          error: 'Invalid album ID',
          message: 'Album ID must be a valid number'
        });
      }

      const user = getUserId.get('default_user');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const getAlbumById = db.prepare(`
        SELECT a.*, ua.added_at 
        FROM albums a 
        JOIN user_albums ua ON a.id = ua.album_id 
        WHERE ua.user_id = ? AND a.id = ?
      `);
      
      const album = getAlbumById.get(user.id, parseInt(id));
      
      if (!album) {
        return reply.status(404).send({
          error: 'Album not found',
          message: 'Album not found in your collection'
        });
      }

      return {
        success: true,
        data: album
      };

    } catch (error) {
      fastify.log.error('Error fetching album:', error);
      return reply.status(500).send({
        error: 'Failed to fetch album',
        message: error.message
      });
    }
  });
}