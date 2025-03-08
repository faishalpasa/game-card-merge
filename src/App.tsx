import { useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { Score } from './components/Score'
import { AddCardButton } from './components/AddCardButton'
import { InstructionPopup } from './components/InstructionPopup'
import { useGameState } from './hooks/useGameState'

import packageJson from '../package.json'

const App = () => {
  const {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!gameLoaded) {
    return <div>Loading...</div>
  }

  return (
    <main className="bg-brown-500 h-screen relative">
      <GameCanvas cards={cards} onSetCards={handleSetCards} />
      <Score score={score} scorePerSecond={scorePerSecond} />
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
    </main>
  )
}

export default App
