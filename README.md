# 🎵 The Music Store

A beautiful retro-styled record store application for managing your personal album collection. Built with React, Fastify, and integrated with the MusicBrainz API for real music data.

![The Music Store](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Fastify](https://img.shields.io/badge/Fastify-5.1.0-green)
![MusicBrainz](https://img.shields.io/badge/API-MusicBrainz-orange)

## ✨ Features

### 🎨 Beautiful Retro Design
- **70s-80s themed interface** with neon colors and retro typography
- **Vinyl record styling** with realistic album artwork
- **Animated employee character** (Vinyl Vic) with dynamic speech bubbles
- **Responsive design** that works on all devices

### 🎵 Real Music Integration
- **MusicBrainz API integration** with access to 2+ million albums
- **Authentic album artwork** from Cover Art Archive
- **Multiple search types**: Album, Artist, Song searches
- **Rate limiting and caching** for optimal performance

### 🎛️ Interactive Experience
- **Drag-to-scroll album carousel** for browsing your collection
- **Vinyl record animations** with flip effects for track listings
- **Real-time search** with live results
- **Add/remove albums** with smooth UI transitions

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.9.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/the-music-store.git
   cd the-music-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Terminal 1: Start the backend server
   npm run server

   # Terminal 2: Start the frontend development server
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
the-music-store/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── AlbumCarousel.jsx    # Interactive album carousel
│   │   ├── Employee.jsx         # Vinyl Vic character
│   │   ├── RecordCard.jsx       # Individual record display
│   │   └── RecordShelf.jsx      # Search interface
│   ├── context/                 # React Context API
│   ├── services/                # API communication
│   └── assets/                  # Static assets
├── server/                      # Fastify backend
│   ├── routes/                  # API endpoints
│   ├── services/                # Business logic
│   ├── database/                # SQLite database
│   └── server.js                # Server entry point
└── public/                      # Static files
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Latest React with concurrent features
- **Vite 6.0** - Fast build tool and development server
- **CSS Modules** - Component-scoped styling
- **Context API** - State management

### Backend
- **Fastify 5.1.0** - Fast and lightweight web framework
- **SQLite** - Embedded database with better-sqlite3
- **MusicBrainz API** - Real music data integration
- **Cover Art Archive** - Authentic album artwork

### Key Features
- **Rate Limiting** - Respects API limits (1 req/sec)
- **Caching** - In-memory caching with 1-hour TTL
- **Error Handling** - Graceful fallback to mock data
- **CORS Support** - Proper cross-origin resource sharing

## 📚 API Documentation

### Search Endpoints

#### Search Albums
```http
GET /api/search?query={query}&type={album|artist|song}&limit={number}
```

#### Get Featured Albums
```http
GET /api/search/featured?limit={number}
```

#### Get Album Details
```http
GET /api/search/{musicbrainz_id}
```

#### API Status
```http
GET /api/search/api-status
```

### Collection Endpoints

#### Get User Albums
```http
GET /api/albums
```

#### Add Album
```http
POST /api/albums
Content-Type: application/json

{
  "external_id": "musicbrainz_id",
  "title": "Album Title",
  "artist": "Artist Name",
  "artwork_url": "https://coverartarchive.org/...",
  "release_year": 1969
}
```

#### Remove Album
```http
DELETE /api/albums/{id}
```

## 🎯 Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server           # Start backend server
npm run dev:server       # Start backend with nodemon
npm run dev:all          # Start both frontend and backend

# Production
npm run build            # Build frontend for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm test                 # Run tests (when implemented)
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
The React frontend can be deployed to any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Fly.io)
The Fastify backend can be deployed to Node.js hosting platforms:

```bash
# Set NODE_ENV=production
# The server runs on PORT environment variable
npm run server
```

### Environment Variables
```bash
# Backend Configuration
PORT=3001                    # Server port
NODE_ENV=production          # Environment mode

# API Configuration (optional)
MUSICBRAINZ_RATE_LIMIT=1000  # Requests per hour
CACHE_TTL_HOURS=24           # Cache timeout
```

## 🎵 MusicBrainz Integration

This application uses the [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) for real music data:

- **No API key required** - Free and open source
- **Comprehensive database** - 2+ million albums
- **Rate limiting** - 1 request per second (respectful usage)
- **Cover Art Archive** - Authentic album artwork
- **Fallback system** - Graceful degradation to mock data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Development

### Project Architecture
- **Frontend**: React SPA with Vite build system
- **Backend**: Fastify REST API with SQLite database
- **External API**: MusicBrainz for music data
- **State Management**: React Context API with useReducer
- **Styling**: CSS modules with retro 70s-80s theme

### Key Components
- **AlbumCarousel**: Drag-scrollable vinyl record collection
- **Employee**: Animated record store character
- **RecordShelf**: Search interface and album management
- **RecordCard**: Individual vinyl record with flip animation

### Database Schema
```sql
-- Albums table
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artwork_url TEXT,
  release_year INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MusicBrainz** - For providing free, open music data
- **Cover Art Archive** - For album artwork
- **React Team** - For the amazing React framework
- **Fastify Team** - For the fast web framework
- **Vite Team** - For the excellent build tool

## 🔮 Roadmap

- [ ] **Last.fm API Integration** - Enhanced metadata and track listings
- [ ] **User Authentication** - Multi-user support
- [ ] **Playlist Creation** - Custom album collections
- [ ] **Social Features** - Share collections with friends
- [ ] **Mobile App** - React Native version
- [ ] **Spotify Integration** - Sync with Spotify playlists
- [ ] **Advanced Search** - Genre, year, label filters
- [ ] **Album Reviews** - User ratings and reviews

---

**Built with ❤️ by [Your Name]**

*A retro record store experience in the digital age*
