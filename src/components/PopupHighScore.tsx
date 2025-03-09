import React from 'react'

interface HighScoreEntry {
  rank: number
  name: string
  score: number
  isCurrentUser?: boolean
}

interface PopupHighScoreProps {
  highScore: number
  onClose: () => void
}

export const PopupHighScore: React.FC<PopupHighScoreProps> = ({
  highScore,
  onClose
}) => {
  // Dummy data for top 10
  const dummyHighScores: HighScoreEntry[] = [
    { rank: 1, name: 'Player 1', score: 1500000 },
    { rank: 2, name: 'Player 2', score: 1200000 },
    { rank: 3, name: 'Player 3', score: 1000000 },
    { rank: 4, name: 'Player 4', score: 800000 },
    { rank: 5, name: 'Player 5', score: 600000 },
    { rank: 6, name: 'Player 6', score: 500000 },
    { rank: 7, name: 'Player 7', score: 400000 },
    { rank: 8, name: 'Player 8', score: 300000 },
    { rank: 9, name: 'Player 9', score: 200000 },
    { rank: 10, name: 'Player 10', score: 100000 }
  ]

  // Insert current user's score and sort
  const allScores = [
    ...dummyHighScores,
    { rank: 0, name: 'You', score: highScore, isCurrentUser: true }
  ]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  // Get top 10 and ensure current user is included
  const currentUserRank = allScores.findIndex((entry) => entry.isCurrentUser)
  const displayScores = allScores.slice(0, 10)

  if (currentUserRank >= 10) {
    displayScores[9] = allScores[currentUserRank]
  }

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
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 w-16">Rank</th>
                <th className="py-2">Name</th>
                <th className="py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {displayScores.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`border-b ${
                    entry.isCurrentUser ? 'bg-yellow-100' : ''
                  }`}
                >
                  <td className="py-2">{entry.rank}</td>
                  <td className="py-2">{entry.name}</td>
                  <td className="py-2 text-right">
                    {entry.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
