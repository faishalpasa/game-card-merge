interface GameHeaderProps {
  score: number
  scorePerSecond: number
  onShowHighScore: () => void
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  scorePerSecond,
  onShowHighScore
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(score).toLocaleString()}
          </div>
          <div className="text-sm text-white">
            {scorePerSecond.toLocaleString()}/s
          </div>
        </div>
        <button
          onClick={onShowHighScore}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          High Scores
        </button>
      </div>
    </div>
  )
}
