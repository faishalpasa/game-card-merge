import CryptoJS from 'crypto-js'

import { GAME_STATE_KEY } from '@/constants/save'
import { GameState } from '@/types/game'

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY

const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString()
}

const decrypt = (data: string) => {
  return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8)
}

export const saveGameState = (gameState: GameState) => {
  localStorage.setItem(GAME_STATE_KEY, encrypt(JSON.stringify(gameState)))
}

export const loadGameState = (): GameState | null => {
  const gameState = localStorage.getItem(GAME_STATE_KEY)
  const decryptedGameState = decrypt(gameState || '')
  return decryptedGameState ? JSON.parse(decryptedGameState) : null
}
