import { useState, useRef, useEffect } from 'react'
import RecordCard from './RecordCard'
import './AlbumCarousel.css'

const AlbumCarousel = ({ albums, onRemoveAlbum }) => {
  const carouselRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle mouse drag events
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
    carouselRef.current.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2 // Multiply for faster scroll
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    carouselRef.current.style.cursor = 'grab'
  }

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Navigation arrows
  const scrollToNext = () => {
    if (carouselRef.current) {
      const cardWidth = 220 // Width of each record card + gap
      carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
    }
  }

  const scrollToPrev = () => {
    if (carouselRef.current) {
      const cardWidth = 220
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
    }
  }

  // Update current index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const cardWidth = 220
        const index = Math.round(carouselRef.current.scrollLeft / cardWidth)
        setCurrentIndex(index)
      }
    }

    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll)
      return () => carousel.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Empty state
  if (!albums || albums.length === 0) {
    return (
      <div className="carousel-empty">
        <div className="empty-turntable">
          <div className="turntable-base">
            <div className="turntable-platter">
              <div className="turntable-label">
                <span className="label-text">Start Your Collection</span>
              </div>
              <div className="turntable-arm"></div>
            </div>
          </div>
        </div>
        <p className="empty-message neon-text">
          Your record collection is empty.<br />
          Time to find some groovy tunes!
        </p>
      </div>
    )
  }

  return (
    <div className="album-carousel-container">
      {/* Navigation arrows */}
      <button 
        className="carousel-nav prev-nav"
        onClick={scrollToPrev}
        disabled={currentIndex === 0}
        aria-label="Previous albums"
      >
        ◀
      </button>

      <button 
        className="carousel-nav next-nav"
        onClick={scrollToNext}
        disabled={currentIndex >= albums.length - 3}
        aria-label="Next albums"
      >
        ▶
      </button>

      {/* Carousel */}
      <div 
        className="album-carousel"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {albums.map((album, index) => (
          <RecordCard 
            key={album.id} 
            album={album}
            index={index}
            isActive={index === currentIndex}
            onRemove={() => onRemoveAlbum(album.id)}
          />
        ))}
      </div>

      {/* Carousel indicators */}
      <div className="carousel-indicators">
        {albums.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              const cardWidth = 220
              carouselRef.current.scrollTo({ 
                left: index * cardWidth, 
                behavior: 'smooth' 
              })
            }}
            aria-label={`Go to album ${index + 1}`}
          />
        ))}
      </div>

      {/* Album counter */}
      <div className="album-counter">
        <span className="counter-text">
          {currentIndex + 1} / {albums.length}
        </span>
      </div>
    </div>
  )
}

export default AlbumCarousel