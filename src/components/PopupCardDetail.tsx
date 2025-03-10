import { Card } from '../classes/Card'

import { formatNumber } from '@/utils/number'

interface CardDetailPopupProps {
  card: Card
  onClose: () => void
}

export const CardDetailPopup = ({ card, onClose }: CardDetailPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-auto h-[400px] relative">
            {card.imageLoaded ? (
              <img
                src={card.image.src}
                alt={`Card Level ${card.level} Value ${card.value}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                <span className="text-2xl">{card.value}</span>
                <span className="text-sm">Lv {card.level}</span>
              </div>
            )}
          </div>

          <div className="text-center space-y-2 w-full">
            <h3 className="text-xl font-bold">Card Details</h3>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm font-semibold">Lv {card.level}</p>
              <p className="text-sm font-semibold">
                +{formatNumber(card.point)}/s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
