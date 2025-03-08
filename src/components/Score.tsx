import { formatNumber } from '@/utils/number'

interface ScoreProps {
  score: number
  scorePerSecond: number
}

export const Score = ({ score, scorePerSecond }: ScoreProps) => {
  return (
    <div className="flex flex-col justify-center items-center absolute top-2.5 left-2.5 right-2.5">
      <div className="text-3xl text-black">{formatNumber(score)}</div>
      <div className="text-sm text-gray-500">
        +{formatNumber(scorePerSecond)}/s
      </div>
    </div>
  )
}
