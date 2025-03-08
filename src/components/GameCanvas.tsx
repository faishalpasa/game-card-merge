import { RefObject, useEffect, useRef, useState } from 'react'

import { useCanvas } from '@/hooks/useCanvas'
import { Card } from '@/types'
import { MAX_CARDS } from '@/constants/game'
import { CardDetailPopup } from '@/components/CardDetailPopup'

interface GameCanvasProps {
  cards: Card[]
  onSetCards: (cards: Card[]) => void
}

export const GameCanvas = ({ cards, onSetCards }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useCanvas(
    canvasRef as RefObject<HTMLCanvasElement>,
    cards,
    (card) => setSelectedCard(card),
    onSetCards
  )

  // Add canvas resize handler
  useEffect(() => {
    const adjustCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const parent = canvas.parentElement
      if (!parent) return

      // Set canvas size based on parent element
      canvas.width = Math.min(parent.clientWidth, 800) // max width 800px
      canvas.height = window.innerHeight * 0.8 // 80% of viewport height

      // Layout cards after resize
      layoutCards(cards, canvas)
    }

    window.addEventListener('resize', adjustCanvasSize)
    adjustCanvasSize() // Initial size adjustment

    return () => window.removeEventListener('resize', adjustCanvasSize)
  }, [cards])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    cards,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart
  ])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="block mx-auto border-1 border-black touch-none w-full h-[80vh] max-w-screen-sm"
      />
      {selectedCard && (
        <CardDetailPopup
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  )
}

// Add layout function
function layoutCards(cards: Card[], canvas: HTMLCanvasElement) {
  const cardWidth = 50
  const cardHeight = 75
  const padding = 4
  const cols = Math.ceil(Math.sqrt(MAX_CARDS)) // Maximum 16 cards
  const rows = Math.ceil(MAX_CARDS / cols)

  // Calculate grid dimensions
  const gridWidth = cols * (cardWidth + padding) - padding
  const gridHeight = rows * (cardHeight + padding) - padding
  const startX = (canvas.width - gridWidth) / 2
  const startY = (canvas.height - gridHeight) / 2

  // Position each card
  cards.forEach((card, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    card.x = startX + col * (cardWidth + padding)
    card.y = startY + row * (cardHeight + padding)
    card.originalX = card.x
    card.originalY = card.y
  })
}
