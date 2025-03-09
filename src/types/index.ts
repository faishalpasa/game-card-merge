import { Card } from '@/classes/Card'

export type { Card }

export interface UseGameState {
  displayScore: number
  score: number
  scorePerSecond: number
  cards: Card[]
  addCardPrice: number
  handleAddCard: (price: number) => boolean
  handleRemoveCard: (cardId: string) => void
  handleSetCards: (cards: Card[]) => void
  gameLoaded: boolean
  initializeGame: () => void
}
