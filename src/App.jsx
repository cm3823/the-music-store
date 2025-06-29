import './App.css'
import { AlbumProvider, useAlbums } from './context/AlbumContext'
import AlbumCarousel from './components/AlbumCarousel'
import Employee from './components/Employee'
import RecordShelf from './components/RecordShelf'

function AppContent() {
  const { albums, loading, error, removeAlbum, addAlbum, clearError } = useAlbums()

  // Show error message if there's an error
  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={clearError} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Background geometric patterns */}
      <div className="geometric-bg"></div>
      
      {/* Main content area */}
      <div className="store-container">
        {/* Store header */}
        <header className="store-header">
          <h1 className="store-title">The Music Store</h1>
          <div className="neon-border"></div>
        </header>

        {/* Loading indicator */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading your collection...</p>
          </div>
        )}

        {/* Main store area */}
        <main className="store-main">
          {/* Employee section */}
          <div className="employee-area">
            <Employee hasAlbums={albums.length > 0} />
          </div>

          {/* Album display area */}
          <div className="album-area">
            <AlbumCarousel
              albums={albums}
              onRemoveAlbum={removeAlbum}
              loading={loading}
            />
          </div>

          {/* Record shelf with search */}
          <div className="shelf-area">
            <RecordShelf onAddAlbum={addAlbum} />
          </div>
        </main>

        {/* Retro grid lines decoration */}
        <div className="grid-lines"></div>
      </div>
    </div>
  )
}

// Main App component with provider
function App() {
  return (
    <AlbumProvider>
      <AppContent />
    </AlbumProvider>
  )
}

export default App
