import { Card } from '../classes/Card'

interface CardDetailPopupProps {
  card: Card
  onClose: () => void
}

export const CardDetailPopup = ({ card, onClose }: CardDetailPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-48 relative">
            {card.imageLoaded ? (
              <img
                src={card.image.src}
                alt={`Card Tier ${card.tier} Value ${card.value}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                <span className="text-2xl">{card.value}</span>
                <span className="text-sm">Tier {card.tier}</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold">Card Details</h3>
            <p>Tier: {card.tier}</p>
            <p>Value: {card.value}</p>
            <p>Points/sec: {card.tier * card.value}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
