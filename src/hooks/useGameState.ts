import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { GameState } from '../types'
import { Card } from '@/classes/Card'
import {
  INITIAL_CARDS,
  BASE_PRICE,
  PRICE_INCREASE,
  MAX_CARDS
} from '@/constants/game'
export const useGameState = (): GameState => {
  const [score, setScore] = useState<number>(0)
  const [cards, setCards] = useState<Card[]>([])
  const [addCardPrice, setAddCardPrice] = useState<number>(BASE_PRICE)
  const [gameLoaded, setGameLoaded] = useState<boolean>(false)

  const createInitialCards = () => {
    const newCards: Card[] = []
    for (let i = 0; i < INITIAL_CARDS; i++) {
      newCards.push(
        new Card(
          uuidv4(),
          0, // x - will be set by layout
          0, // y - will be set by layout
          50, // width
          75, // height
          1, // tier
          Math.floor(Math.random() * 5) + 1 // value
        )
      )
    }
    return newCards
  }

  const handleAddCard = (price: number): boolean => {
    if (score < price || cards.length >= MAX_CARDS) return false

    setScore((prev) => prev - price)
    setAddCardPrice((prev) => prev + PRICE_INCREASE)

    const newCard = new Card(
      uuidv4(),
      0, // x - will be set by layout
      0, // y - will be set by layout
      50, // width
      75, // height
      1, // tier
      Math.floor(Math.random() * 5) + 1 // value
    )

    setCards((prev) => [...prev, newCard])
    return true
  }

  const handleRemoveCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  const handleSetCards = (cards: Card[]) => {
    setCards(cards)
  }

  const initializeGame = () => {
    const savedGame = localStorage.getItem('cardGameState')
    if (savedGame) {
      const { savedScore, savedCards, savedPrice } = JSON.parse(savedGame)
      setScore(savedScore)

      // Reconstruct Card objects with saved positions
      const reconstructedCards = savedCards.map((cardData: any) => {
        const card = new Card(
          cardData.id,
          cardData.x,
          cardData.y,
          cardData.width,
          cardData.height,
          cardData.tier,
          cardData.value
        )
        // Restore original positions
        card.originalX = cardData.originalX
        card.originalY = cardData.originalY
        return card
      })

      setCards(reconstructedCards)
      setAddCardPrice(savedPrice)
    } else {
      setCards(createInitialCards())
    }
    setGameLoaded(true)
  }

  // Save game state
  useEffect(() => {
    if (!gameLoaded) return

    const gameState = {
      savedScore: score,
      savedCards: cards.map((card) => ({
        id: card.id,
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        tier: card.tier,
        value: card.value,
        originalX: card.originalX, // Save original position
        originalY: card.originalY // Save original position
      })),
      savedPrice: addCardPrice
    }
    localStorage.setItem('cardGameState', JSON.stringify(gameState))
  }, [score, cards, addCardPrice, gameLoaded])

  // Update score every second
  useEffect(() => {
    if (!gameLoaded) return

    const interval = setInterval(() => {
      const pointsToAdd = cards.reduce(
        (sum, card) => sum + card.tier * card.value,
        0
      )
      setScore((prev) => prev + pointsToAdd)
    }, 1000)

    return () => clearInterval(interval)
  }, [cards, gameLoaded])

  // Add this effect to handle matched cards
  useEffect(() => {
    if (!gameLoaded) return

    // Remove matched cards
    const unmatchedCards = cards.filter((card) => !card.isMatched)

    if (unmatchedCards.length !== cards.length) {
      setCards(unmatchedCards)
    }
  }, [cards, gameLoaded])

  return {
    score,
    cards,
    addCardPrice,
    handleAddCard,
    handleRemoveCard,
    handleSetCards,
    gameLoaded,
    initializeGame
  }
}
