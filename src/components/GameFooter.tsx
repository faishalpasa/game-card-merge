import { formatNumber } from '@/utils/number'

interface GameFooterProps {
  price: number
  score: number
  onAddCard: (price: number) => boolean
}

export const GameFooter = ({ price, score, onAddCard }: GameFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center">
      <button
        className="size-20 p-4 bg-green-500 text-white rounded-full shadow-lg flex flex-col justify-center items-center disabled:active:scale-100 active:scale-95 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={score < price}
        onClick={() => onAddCard(price)}
      >
        <img
          src={`${import.meta.env.VITE_BASE_URL}/icons/card-pickup.svg`}
          alt="Card"
          className="size-10"
        />
        <span>{formatNumber(price)}</span>
      </button>
    </div>
  )
}
