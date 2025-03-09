import { useState, useEffect, useMemo, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import packageJson from '../../package.json'
import { UseGameState } from '@/types'
import { Card } from '@/classes/Card'
import {
  INITIAL_CARDS,
  BASE_PRICE,
  PRICE_INCREASE_RATE,
  MAX_CARDS
} from '@/constants/game'
import { saveGameState, loadCloudData } from '@/utils/save'
import { CARD_WIDTH, CARD_HEIGHT } from '@/constants/game'
import { GameState } from '@/types/game'

const defaultUid = uuidv4()

export const useGameState = (): UseGameState => {
  const [player, setPlayer] = useState<GameState['player']>({
    id: defaultUid,
    name: `player-${defaultUid}`,
    isNameEditable: true
  })
  const [highScore, setHighScore] = useState<number>(0)
  const [displayScore, setDisplayScore] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [scorePerSecond, setScorePerSecond] = useState<number>(0)
  const [cards, setCards] = useState<Card[]>([])
  const [addCardPrice, setAddCardPrice] = useState<number>(BASE_PRICE)
  const [loadedGameState, setLoadedGameState] = useState<GameState | null>(null)
  const [gameLoaded, setGameLoaded] = useState<boolean>(false)

  const createInitialCards = () => {
    const newCards: Card[] = []
    for (let i = 0; i < INITIAL_CARDS; i++) {
      newCards.push(
        new Card(
          uuidv4(),
          0, // x - will be set by layout
          0, // y - will be set by layout
          CARD_WIDTH, // width
          CARD_HEIGHT, // height
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
    setDisplayScore((prev) => prev - price)
    setAddCardPrice((prev) => prev + PRICE_INCREASE_RATE * price)

    const newCard = new Card(
      uuidv4(),
      0, // x - will be set by layout
      0, // y - will be set by layout
      CARD_WIDTH, // width
      CARD_HEIGHT, // height
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

  const handleSetPlayerName = useCallback((newName: string) => {
    setPlayer((prev) => ({ ...prev, name: newName, isNameEditable: false }))
  }, [])

  const handleLoadCloudData = useCallback(async () => {
    const cloudGameState = await loadCloudData()
    setLoadedGameState(cloudGameState)
  }, [])

  const initializeGame = useCallback(() => {
    if (loadedGameState) {
      const { score, cards, price, highScore, player } = loadedGameState

      // Reconstruct Card objects with saved positions
      const reconstructedCards = cards.map((cardData: any) => {
        const card = new Card(
          cardData.id,
          cardData.x,
          cardData.y,
          cardData.width,
          cardData.height,
          cardData.level,
          cardData.value
        )
        // Restore original positions
        card.originalX = cardData.originalX
        card.originalY = cardData.originalY
        card.placeOrder = cardData.placeOrder
        return card
      })

      if (player) {
        setPlayer(player)
      }
      setHighScore(highScore)
      setScore(score || 0)
      setDisplayScore(score || 0)
      setCards(reconstructedCards)
      setAddCardPrice(price)
    } else {
      setCards(createInitialCards())
    }
    setGameLoaded(true)
  }, [loadedGameState])

  // Save game state
  const gameState = useMemo(
    () => ({
      timestamp: Date.now(),
      player: {
        id: player.id,
        name: player.name,
        isNameEditable: player.isNameEditable
      },
      highScore,
      score,
      cards: cards.map((card) => ({
        id: card.id,
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        level: card.level,
        value: card.value,
        originalX: card.originalX,
        originalY: card.originalY,
        placeOrder: card.placeOrder
      })),
      price: addCardPrice,
      version: packageJson.version
    }),
    [score, cards, addCardPrice, highScore, player]
  )

  useEffect(() => {
    handleLoadCloudData()
  }, [handleLoadCloudData])

  // Save periodically
  useEffect(() => {
    if (!gameLoaded) return

    saveGameState(gameState)
  }, [gameLoaded, gameState])

  // Update display score every centisecond
  useEffect(() => {
    if (!gameLoaded) return

    const accumulatedScore = cards.reduce(
      (sum, card) => sum + card.level * card.value,
      0
    )

    const scorePerCentisecond = accumulatedScore / 100

    const interval = setInterval(() => {
      setDisplayScore((prev) => prev + scorePerCentisecond)
    }, 10)

    return () => clearInterval(interval)
  }, [cards, gameLoaded])

  // Update real score every second
  useEffect(() => {
    if (!gameLoaded) return

    const accumulatedScore = cards.reduce(
      (sum, card) => sum + card.level * card.value,
      0
    )

    const interval = setInterval(() => {
      setScore((prev) => prev + accumulatedScore)
    }, 1000)

    setScorePerSecond(accumulatedScore)

    return () => clearInterval(interval)
  }, [cards, gameLoaded])

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
    }
  }, [score, highScore])

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
    displayScore,
    score,
    scorePerSecond,
    highScore,
    cards,
    addCardPrice,
    handleAddCard,
    handleRemoveCard,
    handleSetCards,
    gameLoaded,
    initializeGame,
    player,
    handleSetPlayerName
  }
}
