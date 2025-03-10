import React from 'react'
import { formatNumber } from '@/utils/number'

interface OfflineEarningsPopupProps {
  score: number
  onClose: () => void
}

export const OfflineEarningsPopup: React.FC<OfflineEarningsPopupProps> = ({
  score,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm m-4 w-full">
        <h2 className="text-xl font-bold mb-4">Welcome Back!</h2>
        <p className="mb-4">While you were away, your cards earned you:</p>
        <p className="text-2xl font-bold text-green-600 mb-2">
          {formatNumber(score)} points
        </p>
        <p className="text-sm text-gray-500 mb-6">
          (Maximum offline earnings is limited to 2 hours)
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Collect
        </button>
      </div>
    </div>
  )
}
