import { RefObject, useEffect, useState, useCallback } from 'react'
import { Card } from '@/types'
import { Card as CardClass } from '@/classes/Card'
import {
  MAX_CARDS,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_PADDING,
  CARD_RADIUS
} from '@/constants/game'

interface DragState {
  isDragging: boolean
  draggedCard: Card | null
  dragOffsetX: number
  dragOffsetY: number
}

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement>,
  cards: Card[],
  onCardClick?: (card: Card) => void,
  onSetCards?: (cards: CardClass[]) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCard: null,
    dragOffsetX: 0,
    dragOffsetY: 0
  })

  const [clickStartTime, setClickStartTime] = useState<number>(0)
  const [clickStartPos, setClickStartPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  })

  // Memoize drawPlaceholders to prevent recreation on every render
  const drawPlaceholders = useCallback((ctx: CanvasRenderingContext2D) => {
    const cols = Math.ceil(Math.sqrt(MAX_CARDS))
    const rows = Math.ceil(MAX_CARDS / cols)

    // Calculate grid dimensions
    const gridWidth = cols * (CARD_WIDTH + CARD_PADDING) - CARD_PADDING
    const gridHeight = rows * (CARD_HEIGHT + CARD_PADDING) - CARD_PADDING
    const startX = (ctx.canvas.width - gridWidth) / 2
    const startY = (ctx.canvas.height - gridHeight) / 2

    // Draw placeholders
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (CARD_WIDTH + CARD_PADDING)
        const y = startY + row * (CARD_HEIGHT + CARD_PADDING)

        ctx.save()
        ctx.fillStyle = '#e0e0e0'
        ctx.strokeStyle = '#666666'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }
    }
  }, [])

  const getEventCoordinates = useCallback(
    (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if (e instanceof MouseEvent) {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
        }
      } else {
        const touch = e.touches[0] || e.changedTouches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY
        }
      }
    },
    [canvasRef]
  )

  // Memoize event handlers
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const coords = getEventCoordinates(e)
      setClickStartTime(Date.now())
      setClickStartPos(coords)

      // Clear selection if clicking outside any card
      let clickedOnCard = false
      for (const card of cards) {
        if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
          clickedOnCard = true
          break
        }
      }

      // Reset all cards if clicking outside
      if (!clickedOnCard) {
        cards.forEach((card) => {
          card.isSelected = false
          card.isFlipped = false
        })
        onSetCards?.(cards)
        return
      }

      // Start drag if clicking on a card
      for (const card of cards) {
        if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
          setDragState((prev) => ({
            ...prev,
            // isDragging: true,
            draggedCard: card,
            dragOffsetX: coords.x - card.x,
            dragOffsetY: coords.y - card.y
          }))
          // card.isFlipped = true
          break
        }
      }
    },
    [cards, getEventCoordinates, onSetCards]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedCard) return

      const coords = getEventCoordinates(e)

      // Calculate distance moved from initial click
      const distanceMoved = Math.hypot(
        coords.x - clickStartPos.x,
        coords.y - clickStartPos.y
      )

      // Only start dragging if moved more than 5px
      if (!dragState.isDragging && distanceMoved > 20) {
        setDragState((prev) => ({
          ...prev,
          isDragging: true
        }))
        dragState.draggedCard.isFlipped = true
        dragState.draggedCard.isSelected = false
      }

      // Only update position if dragging
      if (dragState.isDragging) {
        dragState.draggedCard.x = coords.x - dragState.dragOffsetX
        dragState.draggedCard.y = coords.y - dragState.dragOffsetY

        // Check for potential matches while dragging
        cards.forEach((card) => {
          if (card !== dragState.draggedCard && !card.isMatched) {
            card.isFlipped = card.isPointInside(coords.x, coords.y)
          }
        })
      }
    },
    [cards, dragState, getEventCoordinates, clickStartPos.x, clickStartPos.y]
  )

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const coords = getEventCoordinates(e)
      const clickDuration = Date.now() - clickStartTime
      const distance = Math.hypot(
        coords.x - clickStartPos.x,
        coords.y - clickStartPos.y
      )

      // Handle click events (for selection and info button)
      if (clickDuration < 200 && distance < 5) {
        // Check for info button click first
        const selectedCard = cards.find((card) => card.isSelected)
        if (selectedCard && selectedCard.isPointInside(coords.x, coords.y)) {
          onCardClick?.(selectedCard)
        }

        // Handle card selection
        let clickedCard = false
        cards.forEach((card) => {
          if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
            card.isSelected = !card.isSelected // Toggle selection
            clickedCard = true
          } else {
            card.isSelected = false
          }
        })

        // If clicked outside any card, clear selection
        if (!clickedCard) {
          cards.forEach((card) => {
            card.isSelected = false
            card.isFlipped = false
          })
        }

        setDragState({
          isDragging: false,
          draggedCard: null,
          dragOffsetX: 0,
          dragOffsetY: 0
        })

        onSetCards?.(cards)
        return
      }

      // Handle drag and drop
      if (!dragState.isDragging || !dragState.draggedCard) return
      const draggedCard = dragState.draggedCard

      // Calculate grid positions
      const cardWidth = CARD_WIDTH
      const cardHeight = CARD_HEIGHT
      const padding = CARD_PADDING
      const cols = Math.ceil(Math.sqrt(MAX_CARDS))
      const rows = Math.ceil(MAX_CARDS / cols)

      // Calculate grid dimensions
      const canvas = canvasRef.current
      if (!canvas) return

      const gridWidth = cols * (cardWidth + padding) - padding
      const gridHeight = rows * (cardHeight + padding) - padding
      const startX = (canvas.width - gridWidth) / 2
      const startY = (canvas.height - gridHeight) / 2

      // Check if we're over a placeholder position
      const col = Math.floor((coords.x - startX) / (cardWidth + padding))
      const row = Math.floor((coords.y - startY) / (cardHeight + padding))
      const isValidPosition =
        col >= 0 &&
        col < cols &&
        row >= 0 &&
        row < rows &&
        row * cols + col < MAX_CARDS

      if (isValidPosition) {
        const newX = startX + col * (cardWidth + padding)
        const newY = startY + row * (cardHeight + padding)

        // Check if position is occupied
        const isOccupied = cards.some(
          (card) =>
            card !== draggedCard &&
            !card.isMatched &&
            card.originalX === newX &&
            card.originalY === newY
        )

        if (!isOccupied) {
          // Move card to new position
          draggedCard.x = newX
          draggedCard.y = newY
          draggedCard.originalX = newX
          draggedCard.originalY = newY
          draggedCard.isFlipped = false

          cards.forEach((card) => {
            if (card.id === draggedCard.id) {
              card.x = newX
              card.y = newY
              card.originalX = newX
              card.originalY = newY
              card.placeOrder = row * cols + col
            }
          })

          onSetCards?.(cards)
          setDragState({
            isDragging: false,
            draggedCard: null,
            dragOffsetX: 0,
            dragOffsetY: 0
          })
          return
        }
      }

      // Check for card merging
      for (const card of cards) {
        if (
          card !== draggedCard &&
          !card.isMatched &&
          card.isPointInside(coords.x, coords.y)
        ) {
          if (
            card.value === draggedCard.value &&
            card.level === draggedCard.level
          ) {
            // Merge cards: update the target card and mark dragged card as matched
            card.level++

            // Create and load new image before updating the card
            const newImage = new Image()
            newImage.onload = () => {
              card.thumbImage = newImage
              card.thumbImageLoaded = true
            }
            newImage.src = `${import.meta.env.VITE_BASE_URL}/images/cards/thumb/${card.level}/${card.value}.png`

            // Mark the dragged card as matched and remove it
            draggedCard.isMatched = true
            draggedCard.isFlipped = false

            // Reset states
            setDragState((prev) => ({
              ...prev,
              isDragging: false,
              draggedCard: null,
              dragOffsetX: 0,
              dragOffsetY: 0
            }))

            const updatedCards = cards.filter(
              (card) => card.id !== draggedCard.id
            )
            updatedCards.forEach((card) => (card.isFlipped = false))
            onSetCards?.(updatedCards)
            return
          } else {
            // Show not matched animation
            card.isNotMatched = true
            draggedCard.isNotMatched = true
            setTimeout(() => {
              card.isNotMatched = false
              card.isFlipped = false
              if (!draggedCard.isMatched) {
                draggedCard.isNotMatched = false
                draggedCard.x = draggedCard.originalX
                draggedCard.y = draggedCard.originalY
                draggedCard.isFlipped = false
                draggedCard.isSelected = false

                setDragState({
                  isDragging: false,
                  draggedCard: null,
                  dragOffsetX: 0,
                  dragOffsetY: 0
                })
              }
            }, 250)
            return
          }
        }
      }

      // Reset position if not dropped on valid position
      draggedCard.x = draggedCard.originalX
      draggedCard.y = draggedCard.originalY
      draggedCard.isFlipped = false

      setDragState({
        isDragging: false,
        draggedCard: null,
        dragOffsetX: 0,
        dragOffsetY: 0
      })
    },
    [
      cards,
      dragState,
      getEventCoordinates,
      canvasRef,
      onSetCards,
      clickStartTime,
      clickStartPos,
      onCardClick
    ]
  )

  // Memoize event handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleMouseDown(e as unknown as MouseEvent)
    },
    [handleMouseDown]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleMouseMove(e as unknown as MouseEvent)
    },
    [handleMouseMove]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleMouseUp(e as unknown as MouseEvent)
    },
    [handleMouseUp]
  )

  // Update the canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw placeholders
      drawPlaceholders(ctx)

      // Draw non-dragged cards first
      cards.forEach((card) => {
        if (card.id !== dragState.draggedCard?.id) {
          card.draw(ctx)
        }
      })

      // Draw dragged card last (on top)
      if (dragState.draggedCard) {
        dragState.draggedCard.draw(ctx)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [cards, drawPlaceholders, canvasRef, dragState])

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
