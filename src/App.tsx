import { useEffect, useState } from 'react'
import { logEvent } from 'firebase/analytics'

import { GameCanvas } from './components/GameCanvas'
import { GameHeader } from './components/GameHeader'
import { GameFooter } from './components/GameFooter'
import { PopupInstruction } from './components/PopupInstruction'
import { useGameState } from './hooks/useGameState'
import { PopupHighScore } from './components/PopupHighScore'
import { PopupPlayerName } from './components/PopupPlayerName'
import { analytics } from './utils/firebase'

import { loadGameState, checkForceResetGameState } from './utils/save'
import packageJson from '../package.json'

const App = () => {
  const {
    score,
    scorePerSecond,
    highScore,
    cards,
    addCardPrice,
    handleAddCard,
    gameLoaded,
    initializeGame,
    handleSetCards,
    player,
    handleSetPlayerName
  } = useGameState()

  const [showInstructions, setShowInstructions] = useState<boolean>(
    !localStorage.getItem('hasSeenInstructions')
  )
  const [isLoadingGameData, setIsLoadingGameData] = useState<boolean>(true)
  const [showHighScore, setShowHighScore] = useState<boolean>(false)
  const [showPlayerName, setShowPlayerName] = useState<boolean>(false)

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Game Card Merge',
      page_location: window.location.href,
      page_path: window.location.pathname
    })

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
            score={score}
            scorePerSecond={scorePerSecond}
            onShowHighScore={() => setShowHighScore(true)}
            onEditName={() => setShowPlayerName(true)}
          />
          <GameCanvas cards={cards} onSetCards={handleSetCards} />
          <GameFooter
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
              highScore={highScore}
              onClose={() => setShowHighScore(false)}
            />
          )}
          {showPlayerName && (
            <PopupPlayerName
              player={player}
              onSave={handleSetPlayerName}
              onClose={() => setShowPlayerName(false)}
            />
          )}
        </>
      )}
    </main>
  )
}

export default App
