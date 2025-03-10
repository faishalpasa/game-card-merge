import { Card } from '@/classes/Card'
import { GameState } from '@/types/game'
export type { Card }

export interface UseGameState {
  highScore: number
  displayScore: number
  score: number
  scorePerSecond: number
  cards: Card[]
  addCardPrice: number
  addSlotPrice: number
  handleAddCard: (price: number) => boolean
  additionalSlotRows: number
  handleAddAdditionalSlotRow: (price: number) => boolean
  handleRemoveCard: (cardId: string) => void
  handleSetCards: (cards: Card[]) => void
  gameLoaded: boolean
  initializeGame: () => void
  player: GameState['player']
  handleSetPlayerName: (name: string) => void
  offlineScore: number | null
  handleUpdateScoreFromOffline: (score: number | null) => void
  offlineData: {
    score: number
    timeAway: number
  } | null
}
