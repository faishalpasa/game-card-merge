import { Card } from '@/classes/Card'

export type { Card }

export interface GameState {
  score: number
  cards: Card[]
  addCardPrice: number
  handleAddCard: (price: number) => boolean
  handleRemoveCard: (cardId: string) => void
  handleSetCards: (cards: Card[]) => void
  gameLoaded: boolean
  initializeGame: () => void
}
