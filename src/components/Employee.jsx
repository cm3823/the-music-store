import { useState, useEffect } from 'react'
import './Employee.css'

const Employee = ({ hasAlbums }) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Messages for different scenarios
  const welcomeMessages = [
    "Hey there! Welcome to The Music Store!",
    "Looking for some groovy tunes today?",
    "Need help finding your next favorite album?"
  ]

  const emptyCollectionMessages = [
    "I see you're new here! Ready to start your collection?",
    "Every great collection starts with that first record...",
    "What kind of music gets your soul moving?"
  ]

  const hasCollectionMessages = [
    "Nice collection you've got there!",
    "See anything that catches your eye?",
    "Ready to add some more vinyl to the mix?"
  ]

  const messages = hasAlbums ? hasCollectionMessages : emptyCollectionMessages

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [messages.length])

  // Hide/show employee periodically for dynamic feel
  useEffect(() => {
    const visibilityTimer = setInterval(() => {
      setIsVisible(prev => !prev)
      setTimeout(() => setIsVisible(true), 1000)
    }, 15000)

    return () => clearInterval(visibilityTimer)
  }, [])

  if (!isVisible) return <div className="employee-placeholder"></div>

  return (
    <div className="employee-container">
      {/* Speech bubble */}
      <div className="speech-bubble">
        <div className="speech-content">
          <p className="speech-text">{messages[currentMessage]}</p>
        </div>
        <div className="speech-tail"></div>
      </div>

      {/* Employee character */}
      <div className="employee-character">
        <div className="employee-body">
          {/* Head */}
          <div className="employee-head">
            <div className="employee-hair"></div>
            <div className="employee-face">
              <div className="employee-eyes">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>
              </div>
              <div className="employee-mouth"></div>
            </div>
          </div>

          {/* Body */}
          <div className="employee-torso">
            <div className="employee-shirt">
              {/* Retro pattern on shirt */}
              <div className="shirt-pattern"></div>
            </div>
            <div className="employee-arms">
              <div className="arm left-arm"></div>
              <div className="arm right-arm"></div>
            </div>
          </div>

          {/* Legs */}
          <div className="employee-legs">
            <div className="leg left-leg"></div>
            <div className="leg right-leg"></div>
          </div>
        </div>

        {/* Name tag */}
        <div className="name-tag">
          <span className="name-tag-text">VINYL VIC</span>
        </div>

        {/* Accessories */}
        <div className="accessories">
          <div className="headphones"></div>
          <div className="record-pin"></div>
        </div>
      </div>

      {/* Interactive elements */}
      <div className="employee-actions">
        <button 
          className="chat-button"
          onClick={() => setCurrentMessage((prev) => (prev + 1) % messages.length)}
          aria-label="Get another message from Vinyl Vic"
        >
          💬
        </button>
      </div>
    </div>
  )
}

export default Employee