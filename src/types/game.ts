export type GameState = {
  score: number
  cards: {
    id: string
    x: number
    y: number
    width: number
    height: number
    tier: number
    value: number
    originalX: number
    originalY: number
    placeOrder: number
  }[]
  price: number
}
