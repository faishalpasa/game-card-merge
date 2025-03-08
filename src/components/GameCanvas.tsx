import { RefObject, useEffect, useRef, useState } from 'react'

import { useCanvas } from '@/hooks/useCanvas'
import { Card } from '@/types'
import {
  MAX_CARDS,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_PADDING
} from '@/constants/game'
import { CardDetailPopup } from '@/components/CardDetailPopup'

// Add layout function
function layoutCards(cards: Card[], canvas: HTMLCanvasElement) {
  const cols = Math.ceil(Math.sqrt(MAX_CARDS))
  const rows = Math.ceil(MAX_CARDS / cols)

  // Calculate grid dimensions
  const gridWidth = cols * (CARD_WIDTH + CARD_PADDING) - CARD_PADDING
  const gridHeight = rows * (CARD_HEIGHT + CARD_PADDING) - CARD_PADDING
  const startX = (canvas.width - gridWidth) / 2
  const startY = (canvas.height - gridHeight) / 2

  // Create a grid to track occupied positions
  const occupiedPositions: boolean[][] = Array(rows)
    .fill(false)
    .map(() => Array(cols).fill(false))

  // First, mark existing positions as occupied
  cards.forEach((card) => {
    // Only process cards that have been positioned before
    if (card.originalX !== 0 || card.originalY !== 0) {
      // Get card x and y based on placeOrder
      const row = Math.floor(card.placeOrder / cols)
      const col = card.placeOrder % cols

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        occupiedPositions[row][col] = true
        // Update card position
        card.x = startX + col * (CARD_WIDTH + CARD_PADDING)
        card.y = startY + row * (CARD_HEIGHT + CARD_PADDING)
        card.originalX = card.x
        card.originalY = card.y
      }
    }
  })

  // Then, position cards that don't have positions
  cards.forEach((card) => {
    // Only process cards that haven't been positioned
    if (card.originalX === 0 && card.originalY === 0) {
      // Find first empty position
      let placed = false
      for (let row = 0; row < rows && !placed; row++) {
        for (let col = 0; col < cols && !placed; col++) {
          if (!occupiedPositions[row][col]) {
            const newX = startX + col * (CARD_WIDTH + CARD_PADDING)
            const newY = startY + row * (CARD_HEIGHT + CARD_PADDING)
            card.x = newX
            card.y = newY
            card.originalX = newX
            card.originalY = newY
            card.placeOrder = row * cols + col
            occupiedPositions[row][col] = true
            placed = true
          }
        }
      }
    }
  })
}

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
