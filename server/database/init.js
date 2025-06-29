import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path - creates db file in server/database directory
const dbPath = join(__dirname, 'music_store.db');

let db = null;

export const getDatabase = () => {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Enable WAL mode for better performance
  }
  return db;
};

export const initializeDatabase = () => {
  const database = getDatabase();
  
  // Create users table (for future multi-user support)
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create albums table
  database.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      artwork_url TEXT,
      external_id TEXT,
      release_year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(title, artist)
    )
  `);

  // Create user_albums junction table (many-to-many relationship)
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      album_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE,
      UNIQUE(user_id, album_id)
    )
  `);

  // Create default user for single-user mode
  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (username) VALUES (?)
  `);
  insertUser.run('default_user');

  console.log('✅ Database initialized with tables: users, albums, user_albums');
  
  return database;
};

// Close database connection gracefully
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🔄 Closing database connection...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Closing database connection...');
  closeDatabase();
  process.exit(0);
});