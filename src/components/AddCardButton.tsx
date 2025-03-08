import { formatNumber } from '@/utils/number'

interface AddCardButtonProps {
  price: number
  score: number
  onAddCard: (price: number) => boolean
}

export const AddCardButton = ({
  price,
  score,
  onAddCard
}: AddCardButtonProps) => {
  return (
    <button
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={score < price}
      onClick={() => onAddCard(price)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      <span>Card ({formatNumber(price)})</span>
    </button>
  )
}
