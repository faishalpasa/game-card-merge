import { formatNumber } from '@/utils/number'

interface GameHeaderProps {
  score: number
  scorePerSecond: number
  onShowHighScore: () => void
  onEditName: () => void
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  scorePerSecond,
  onShowHighScore,
  onEditName
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(+score)}
          </div>
          <div className="text-sm text-white">
            {formatNumber(+scorePerSecond)}/s
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onShowHighScore}
            className="bg-yellow-500 text-white p-3 rounded-full active:scale-95 active:bg-yellow-600"
          >
            <img
              src={`${import.meta.env.VITE_BASE_URL}/icons/trophy.svg`}
              alt="High Score"
              className="size-4"
            />
          </button>
          <button
            className="bg-yellow-500 text-white p-3 rounded-full active:scale-95 active:bg-yellow-600"
            onClick={onEditName}
          >
            <img
              src={`${import.meta.env.VITE_BASE_URL}/icons/cog.svg`}
              alt="Settings"
              className="size-4"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
