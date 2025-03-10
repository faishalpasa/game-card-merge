import { formatNumber } from '@/utils/number'

import {
  MAX_SLOT_CARDS_PER_ROW,
  MAX_ADDITIONAL_SLOT_ROWS,
  MAX_SLOT_CARDS
} from '@/constants/game'
import { Card } from '@/classes/Card'

interface GameFooterProps {
  cards: Card[]
  additionalSlotRows: number
  addCardPrice: number
  addSlotPrice: number
  score: number
  onAddCard: (price: number) => boolean
  onAddAdditionalSlotRow: (price: number) => boolean
}

export const GameFooter = ({
  cards,
  additionalSlotRows,
  addCardPrice,
  addSlotPrice,
  score,
  onAddCard,
  onAddAdditionalSlotRow
}: GameFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex gap-10 justify-center items-center">
      <button
        className="size-20 p-4 bg-green-500 text-white rounded-full shadow-lg flex flex-col justify-center items-center disabled:active:scale-100 active:scale-95 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={
          score < addCardPrice ||
          cards.length >=
            MAX_SLOT_CARDS + additionalSlotRows * MAX_SLOT_CARDS_PER_ROW
        }
        onClick={() => onAddCard(addCardPrice)}
      >
        <img
          src={`${import.meta.env.VITE_BASE_URL}/icons/card-pickup.svg`}
          alt="Card"
          className="size-10"
        />
        <span>{formatNumber(addCardPrice)}</span>
      </button>

      <button
        className="size-20 p-4 bg-green-500 text-white rounded-full shadow-lg flex flex-col justify-center items-center disabled:active:scale-100 active:scale-95 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={
          score < addSlotPrice || additionalSlotRows >= MAX_ADDITIONAL_SLOT_ROWS
        }
        onClick={() => onAddAdditionalSlotRow(addSlotPrice)}
      >
        <img
          src={`${import.meta.env.VITE_BASE_URL}/icons/card-draw.svg`}
          alt="Card"
          className="size-10"
        />
        <span>{formatNumber(addSlotPrice)}</span>
      </button>
    </div>
  )
}
