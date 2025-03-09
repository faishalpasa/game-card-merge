interface PopupInstructionProps {
  onClose: () => void
}

export const PopupInstruction = ({ onClose }: PopupInstructionProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <p className="font-semibold">🎮 Basic Gameplay:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Drag and drop cards of the same level to merge them</li>
              <li>Merged cards upgrade to the next level</li>
              <li>Higher level cards generate more points per second</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">💰 Points System:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Each card generates points based on its level</li>
              <li>Use points to buy new cards</li>
              <li>Card price increases with each purchase</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">ℹ️ Tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Double tap a card to see its details</li>
              <li>Try to create higher level cards for more points</li>
              <li>Plan your merges carefully!</li>
            </ul>
          </div>
        </div>

        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={onClose}
        >
          Start Playing!
        </button>
      </div>
    </div>
  )
}
