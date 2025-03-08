interface ScoreProps {
  score: number
}

export const Score = ({ score }: ScoreProps) => {
  return (
    <div className="flex justify-center items-center absolute top-2.5 left-2.5 right-2.5">
      <div className="text-3xl text-black">{score}</div>
    </div>
  )
}
