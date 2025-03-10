export type GameState = {
  timestamp: number
  player: {
    id: string
    name: string
    isNameEditable: boolean
  }
  highScore: number
  score: number
  cards: {
    id: string
    x: number
    y: number
    width: number
    height: number
    level: number
    value: number
    originalX: number
    originalY: number
    placeOrder: number
  }[]
  additionalSlotRows: number
  addCardPrice: number
  addSlotPrice: number
  version?: string
}
