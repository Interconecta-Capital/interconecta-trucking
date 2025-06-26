import React, { useEffect, useState } from 'react'

interface FloatingActionButtonProps {
  icon: React.ReactNode
  text: string
  onClick: () => void
  isVisible: boolean
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  text,
  onClick,
  isVisible
}) => {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setCompact(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fab-container">
      <button
        className={`fab-button ${compact ? 'compact' : ''}`}
        onClick={onClick}
        aria-label={text}
      >
        {icon}
        {!compact && <span className="fab-label">{text}</span>}
      </button>
    </div>
  )
}
