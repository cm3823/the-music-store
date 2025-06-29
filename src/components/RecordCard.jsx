import { useState } from 'react'
import './RecordCard.css'

const RecordCard = ({ album, index, isActive, onRemove }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (window.confirm(`Remove "${album.title}" by ${album.artist} from your collection?`)) {
      onRemove()
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <div 
      className={`record-card ${isActive ? 'active' : ''} ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      {/* Record Front (Album Cover) */}
      <div className="record-face record-front">
        {/* Vinyl record base */}
        <div className="vinyl-record">
          {/* Album cover */}
          <div className="album-cover">
            {!imageLoaded && !imageError && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {imageError ? (
              <div className="image-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">♪</div>
                  <div className="placeholder-text">No Image</div>
                </div>
              </div>
            ) : (
              <img
                src={album.artwork_url || album.artwork}
                alt={`${album.title} by ${album.artist}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            )}
            
            {/* Vinyl record shine effect */}
            <div className="vinyl-shine"></div>
          </div>

          {/* Vinyl grooves */}
          <div className="vinyl-grooves">
            <div className="groove groove-1"></div>
            <div className="groove groove-2"></div>
            <div className="groove groove-3"></div>
            <div className="groove groove-4"></div>
          </div>

          {/* Center label */}
          <div className="center-label">
            <div className="label-content">
              <div className="label-title">{album.title}</div>
              <div className="label-artist">{album.artist}</div>
            </div>
          </div>
        </div>

        {/* Album info overlay */}
        <div className="album-info">
          <h3 className="album-title">{album.title}</h3>
          <p className="album-artist">{album.artist}</p>
          {(album.release_year || album.year) && <p className="album-year">{album.release_year || album.year}</p>}
        </div>

        {/* Hover controls */}
        <div className="record-controls">
          <button 
            className="remove-button"
            onClick={handleRemove}
            aria-label={`Remove ${album.title}`}
          >
            ✕
          </button>
          <button 
            className="flip-button"
            onClick={handleFlip}
            aria-label="Flip record"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Record Back (Track List - Mock for now) */}
      <div className="record-face record-back">
        <div className="back-cover">
          <div className="track-list">
            <h4 className="track-list-title">Track Listing</h4>
            <div className="tracks">
              {/* Mock track list - this would come from API in full implementation */}
              <div className="track-item">
                <span className="track-number">A1.</span>
                <span className="track-name">Track One</span>
              </div>
              <div className="track-item">
                <span className="track-number">A2.</span>
                <span className="track-name">Track Two</span>
              </div>
              <div className="track-item">
                <span className="track-number">B1.</span>
                <span className="track-name">Track Three</span>
              </div>
              <div className="track-item">
                <span className="track-number">B2.</span>
                <span className="track-name">Track Four</span>
              </div>
            </div>
          </div>

          {/* Back cover decorative elements */}
          <div className="back-decoration">
            <div className="barcode">
              <div className="barcode-lines">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="barcode-line"></div>
                ))}
              </div>
              <div className="barcode-number">7 82421 {String(index).padStart(6, '0')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Record index indicator */}
      <div className="record-index">
        {index + 1}
      </div>
    </div>
  )
}

export default RecordCard