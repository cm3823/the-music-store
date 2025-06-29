import { useState } from 'react'
import { useAlbums } from '../context/AlbumContext'
import './RecordShelf.css'

const RecordShelf = () => {
  const { searchAlbums, addAlbum, searchResults, isSearching, clearSearch } = useAlbums()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchType, setSearchType] = useState('album')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    await searchAlbums(searchQuery, searchType)
  }

  const handleAddAlbum = async () => {
    if (selectedAlbum && !isAdding) {
      setIsAdding(true)
      
      // Convert search result format to album format for backend
      const albumData = {
        title: selectedAlbum.title,
        artist: selectedAlbum.artist,
        artwork_url: selectedAlbum.artwork_url,
        external_id: selectedAlbum.external_id,
        release_year: selectedAlbum.release_year
      }
      
      const result = await addAlbum(albumData)
      
      if (result.success) {
        // Reset search state on successful add
        setSelectedAlbum(null)
        clearSearch()
        setSearchQuery('')
        setIsSearchOpen(false)
      }
      
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setSelectedAlbum(null)
    clearSearch()
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  return (
    <div className="record-shelf">
      {/* Shelf Header */}
      <div className="shelf-header">
        <h2 className="shelf-title">Record Collection</h2>
        <div className="shelf-controls">
          <button 
            className="add-record-button"
            onClick={() => setIsSearchOpen(true)}
            disabled={isSearchOpen}
          >
            <span className="button-icon">+</span>
            Add New Record
          </button>
        </div>
      </div>

      {/* Search Interface */}
      {isSearchOpen && (
        <div className="search-interface">
          <div className="search-header">
            <h3 className="search-title">Find Your Next Groove</h3>
            <button 
              className="close-search"
              onClick={handleCancel}
              aria-label="Close search"
            >
              ✕
            </button>
          </div>

          {/* Search Form */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-type-selector">
              <label className="search-type-label">Search by:</label>
              <div className="search-type-options">
                <button
                  type="button"
                  className={`type-option ${searchType === 'album' ? 'active' : ''}`}
                  onClick={() => setSearchType('album')}
                >
                  Album
                </button>
                <button
                  type="button"
                  className={`type-option ${searchType === 'artist' ? 'active' : ''}`}
                  onClick={() => setSearchType('artist')}
                >
                  Artist
                </button>
                <button
                  type="button"
                  className={`type-option ${searchType === 'song' ? 'active' : ''}`}
                  onClick={() => setSearchType('song')}
                >
                  Song
                </button>
              </div>
            </div>

            <div className="search-input-group">
              <input
                type="text"
                className="search-input"
                placeholder={`Enter ${searchType} name...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? '🔍' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {isSearching && (
            <div className="search-loading">
              <div className="loading-record">
                <div className="loading-vinyl"></div>
              </div>
              <p className="loading-text">Searching the crates...</p>
            </div>
          )}

          {searchResults.length > 0 && !isSearching && (
            <div className="search-results">
              <h4 className="results-title">Found These Records:</h4>
              <div className="results-grid">
                {searchResults.map((album) => (
                  <div
                    key={album.external_id}
                    className={`result-item ${selectedAlbum?.external_id === album.external_id ? 'selected' : ''}`}
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="result-artwork">
                      <img src={album.artwork_url} alt={`${album.title} by ${album.artist}`} />
                      <div className="result-overlay">
                        <span className="select-indicator">
                          {selectedAlbum?.external_id === album.external_id ? '✓' : '+'}
                        </span>
                      </div>
                    </div>
                    <div className="result-info">
                      <h5 className="result-title">{album.title}</h5>
                      <p className="result-artist">{album.artist}</p>
                      <p className="result-year">{album.release_year}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Cancel Actions */}
              {selectedAlbum && (
                <div className="action-buttons">
                  <button
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    className="add-button"
                    onClick={handleAddAlbum}
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add to Collection'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Decorative shelf elements */}
      <div className="shelf-decoration">
        <div className="shelf-wood"></div>
        <div className="shelf-brackets">
          <div className="bracket left-bracket"></div>
          <div className="bracket right-bracket"></div>
        </div>
        <div className="shelf-records">
          {/* Decorative record spines */}
          <div className="record-spine spine-1"></div>
          <div className="record-spine spine-2"></div>
          <div className="record-spine spine-3"></div>
          <div className="record-spine spine-4"></div>
          <div className="record-spine spine-5"></div>
        </div>
      </div>
    </div>
  )
}

export default RecordShelf