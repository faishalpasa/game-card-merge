import CryptoJS from 'crypto-js'

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'
import packageJson from '../../package.json'

import { GAME_STATE_KEY, GAME_STATE_COLLECTION } from '@/constants/save'
import { GameState } from '@/types/game'
import { db } from '@/utils/firebase'

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY

export const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString()
}

export const decrypt = (data: string) => {
  return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8)
}

export const saveGameState = (gameState: GameState, { cloud = false } = {}) => {
  try {
    const encrypted = encrypt(JSON.stringify(gameState))
    localStorage.setItem(GAME_STATE_KEY, encrypted)
    if (cloud) {
      saveCloudData(gameState.player.id, encrypted)
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
    const newGameState = {
      ...gameState,
      cards: [],
      version: packageJson.version
    }
    saveGameState(newGameState)
  }
}

export const saveCloudData = async (id: string, gameState: string) => {
  try {
    const decryptedState = decrypt(gameState)
    const parsedState = JSON.parse(decryptedState)

    await setDoc(doc(db, GAME_STATE_COLLECTION, id), {
      gameState: gameState,
      playerName: parsedState.player.name || '',
      highScore: parsedState.highScore || 0,
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

export const getHighScores = async (datalimit = 10) => {
  try {
    const highScoresRef = collection(db, GAME_STATE_COLLECTION)
    const q = query(
      highScoresRef,
      orderBy('highScore', 'desc'),
      limit(datalimit)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          playerId: doc.id,
          playerName: data.playerName || 'Unknown Player',
          score: data.highScore || 0,
          isCurrentUser: false
        }
      })
      .filter((score) => score.score > 0)
  } catch (error) {
    console.error('Error getting high scores:', error)
    return []
  }
}
