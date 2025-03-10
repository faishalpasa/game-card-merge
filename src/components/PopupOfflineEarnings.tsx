import React from 'react'
import { formatNumber } from '@/utils/number'

interface OfflineEarningsPopupProps {
  score: number
  onClose: () => void
  timeAway: number // time in milliseconds
}

export const OfflineEarningsPopup: React.FC<OfflineEarningsPopupProps> = ({
  score,
  onClose,
  timeAway
}) => {
  const formatTimeAway = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    let timeText = ''
    if (hours > 0) timeText += `${hours} hours `
    if (minutes > 0) timeText += `${minutes} minutes`

    return timeText.trim() || '1 minute'
  }

  const actualTime = formatTimeAway(timeAway)
  const cappedTime = formatTimeAway(Math.min(timeAway, 2 * 60 * 60 * 1000))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm m-4 w-full">
        <h2 className="text-xl font-bold mb-4">Welcome Back!</h2>
        <p className="mb-4">
          You were away for <b>{actualTime}</b>
          {timeAway > 2 * 60 * 60 * 1000 && ` (capped at ${cappedTime})`}
        </p>
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
