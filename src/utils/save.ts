import CryptoJS from 'crypto-js'

import packageJson from '../../package.json'

import { GAME_STATE_KEY, GAME_STATE_COLLECTION } from '@/constants/save'
import { GameState } from '@/types/game'
import { db, doc, getDoc, setDoc } from '@/utils/firebase'

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY

const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString()
}

const decrypt = (data: string) => {
  return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8)
}

export const saveGameState = (gameState: GameState, { cloud = false } = {}) => {
  try {
    const encrypted = encrypt(JSON.stringify(gameState))
    localStorage.setItem(GAME_STATE_KEY, encrypted)
    if (cloud) {
      saveCloudData(gameState.player.id, encrypted, gameState.player.name)
    }
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

export const loadGameState = ({ raw = false } = {}) => {
  try {
    const gameState = localStorage.getItem(GAME_STATE_KEY)
    if (!gameState) return null

    if (raw) {
      return gameState
    }

    const decryptedGameState = decrypt(gameState)
    return JSON.parse(decryptedGameState)
  } catch (error) {
    console.error('Failed to load game:', error)
    return null
  }
}

export const checkForceResetGameState = () => {
  const gameState = loadGameState()

  if (gameState && gameState.version !== packageJson.version) {
    localStorage.removeItem(GAME_STATE_KEY)
  }
}

export const saveCloudData = async (
  id: string,
  gameState: string,
  name?: string
) => {
  try {
    await setDoc(doc(db, GAME_STATE_COLLECTION, id), {
      gameState: gameState,
      playerName: name,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error syncing game state:', error)
  }
}

export const loadCloudData = async () => {
  const gameState = loadGameState()
  const id = gameState.player.id

  try {
    const docRef = doc(db, GAME_STATE_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      if (data.gameState) {
        const decryptedCloudGameState = decrypt(data.gameState)
        const parsedCloudGameState = JSON.parse(decryptedCloudGameState)

        if (parsedCloudGameState.timestamp > gameState.timestamp) {
          return parsedCloudGameState
        } else {
          return gameState
        }
      }
      console.log('No cloud game state found')
      return gameState
    } else {
      console.log('No cloud game state found')
      return gameState
    }
  } catch (error) {
    console.error('Error loading cloud data:', error)
    return null
  }
}
