import React, { useState } from 'react'

import { GameState } from '@/types/game'

interface PopupPlayerNameProps {
  player: GameState['player']
  onSave: (name: string) => void
  onClose: () => void
}

export const PopupPlayerName = ({
  player,
  onSave,
  onClose
}: PopupPlayerNameProps) => {
  const [name, setName] = useState(player.name)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (trimmedName.length < 3) {
      setError('Name must be at least 3 characters')
      return
    }
    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters')
      return
    }

    onSave(trimmedName)
    onClose()
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(player.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-center">Player Name</h2>

          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              autoFocus
              disabled={!player.isNameEditable}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {player.isNameEditable && (
            <p className="text-sm text-gray-500">
              Name is editable for the first time you play the game.
            </p>
          )}

          {!player.isNameEditable && (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-500 truncate flex-1">
                {player.id}
              </p>
              <button
                type="button"
                onClick={handleCopyId}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
          )}

          {player.isNameEditable && (
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Save Name
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
