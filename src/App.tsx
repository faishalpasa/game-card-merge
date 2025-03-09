import { useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { Score } from './components/Score'
import { AddCardButton } from './components/AddCardButton'
import { InstructionPopup } from './components/InstructionPopup'
import { useGameState } from './hooks/useGameState'

import { loadGameState } from './utils/save'
import packageJson from '../package.json'

const App = () => {
  const {
    displayScore,
    score,
    scorePerSecond,
    cards,
    addCardPrice,
    handleAddCard,
    gameLoaded,
    initializeGame,
    handleSetCards
  } = useGameState()

  const [showInstructions, setShowInstructions] = useState<boolean>(
    !localStorage.getItem('hasSeenInstructions')
  )

  useEffect(() => {
    initializeGame()
    console.log(packageJson.version)

    if (import.meta.env.VITE_NODE_ENV === 'development') {
      const gameState = loadGameState()
      console.log({ gameState })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main
      className="bg-green-100 h-screen relative max-w-screen-sm mx-auto"
      style={{
        backgroundImage: `url(${import.meta.env.VITE_BASE_URL}/images/bg.png)`,
        backgroundSize: '48px 48px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat'
      }}
    >
      {!gameLoaded ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-neutral-700 font-bold text-2xl">Loading...</div>
        </div>
      ) : (
        <>
          <GameCanvas cards={cards} onSetCards={handleSetCards} />
          <Score score={displayScore} scorePerSecond={scorePerSecond} />
          <AddCardButton
            price={addCardPrice}
            score={score}
            onAddCard={handleAddCard}
          />
          {showInstructions && (
            <InstructionPopup
              onClose={() => {
                setShowInstructions(false)
                localStorage.setItem('hasSeenInstructions', 'true')
              }}
            />
          )}
        </>
      )}
    </main>
  )
}

export default App
