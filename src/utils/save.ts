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
  try {
    const encrypted = encrypt(JSON.stringify(gameState))
    localStorage.setItem(GAME_STATE_KEY, encrypted)
    console.log('Game saved successfully')
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

export const loadGameState = (): GameState | null => {
  try {
    const gameState = localStorage.getItem(GAME_STATE_KEY)
    if (!gameState) return null

    const decryptedGameState = decrypt(gameState)
    return JSON.parse(decryptedGameState)
  } catch (error) {
    console.error('Failed to load game:', error)
    return null
  }
}
