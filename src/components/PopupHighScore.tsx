import React, { useState, useEffect } from 'react'
import { getHighScores, loadGameState } from '@/utils/save'

interface HighScoreEntry {
  playerId: string
  playerName: string
  score: number
  isCurrentUser: boolean
}

interface PopupHighScoreProps {
  onClose: () => void
}

export const PopupHighScore: React.FC<PopupHighScoreProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<HighScoreEntry[]>([])

  useEffect(() => {
    const loadHighScores = async () => {
      try {
        const cloudScores = await getHighScores()
        const gameState = loadGameState()

        // Mark current user's score from cloud data
        const allScores = cloudScores.map((score) => ({
          ...score,
          isCurrentUser: score.playerId === gameState.player.id
        }))

        setScores(allScores)
      } catch (error) {
        console.error('Error loading high scores:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHighScores()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">High Scores</h2>
        <div className="mb-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 w-16">Rank</th>
                  <th className="py-2">Name</th>
                  <th className="py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, index) => (
                  <tr
                    key={entry.playerId}
                    className={`border-b ${
                      entry.isCurrentUser ? 'bg-yellow-100' : ''
                    }`}
                  >
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{entry.playerName}</td>
                    <td className="py-2 text-right">
                      {entry.score.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
