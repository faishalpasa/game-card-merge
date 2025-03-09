import { useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameHeader } from './components/GameHeader'
import { ButtonAddCard } from './components/ButtonAddCard'
import { PopupInstruction } from './components/PopupInstruction'
import { useGameState } from './hooks/useGameState'
import { PopupHighScore } from './components/PopupHighScore'

import { loadGameState, checkForceResetGameState } from './utils/save'
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
  const [isLoadingGameData, setIsLoadingGameData] = useState<boolean>(true)
  const [showHighScore, setShowHighScore] = useState<boolean>(false)

  useEffect(() => {
    if (isLoadingGameData) return

    initializeGame()
    console.log(packageJson.version)

    if (import.meta.env.VITE_NODE_ENV === 'development') {
      const gameState = loadGameState()
      console.log({ gameState })
    }
  }, [initializeGame, isLoadingGameData])

  useEffect(() => {
    setIsLoadingGameData(true)
    setTimeout(() => {
      checkForceResetGameState()
      setIsLoadingGameData(false)
    }, 1000)
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
          <div className="text-white font-bold text-2xl">Loading...</div>
        </div>
      ) : (
        <>
          <GameHeader
            score={displayScore}
            scorePerSecond={scorePerSecond}
            onShowHighScore={() => setShowHighScore(true)}
          />
          <GameCanvas cards={cards} onSetCards={handleSetCards} />
          <ButtonAddCard
            price={addCardPrice}
            score={score}
            onAddCard={handleAddCard}
          />
          {showInstructions && (
            <PopupInstruction
              onClose={() => {
                setShowInstructions(false)
                localStorage.setItem('hasSeenInstructions', 'true')
              }}
            />
          )}
          {showHighScore && (
            <PopupHighScore
              currentScore={score}
              onClose={() => setShowHighScore(false)}
            />
          )}
        </>
      )}
    </main>
  )
}

export default App
