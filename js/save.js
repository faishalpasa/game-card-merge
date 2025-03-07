import { Card } from './card.js';

export class GameSaver {
  static SAVE_KEY = 'cardGameSave';
  static MAX_OFFLINE_HOURS = 2;

  static saveGame(gameState) {
    const saveData = {
      ...gameState,
      timestamp: Date.now()
    };
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
  }

  static loadGame() {
    const savedData = localStorage.getItem(this.SAVE_KEY);
    if (!savedData) return null;

    const gameState = JSON.parse(savedData);
    const currentTime = Date.now();
    const timeDiff = currentTime - gameState.timestamp;
    const maxOfflineTime = this.MAX_OFFLINE_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds

    // Calculate offline earnings
    if (timeDiff > 0) {
      const offlineTime = Math.min(timeDiff, maxOfflineTime);
      const offlineSeconds = Math.floor(offlineTime / 1000);
      
      // Calculate total points per second from saved cards
      const pointsPerSecond = gameState.cards.reduce((sum, card) => 
        sum + (card.tier * card.value), 0
      );
      
      // Add offline earnings to score
      gameState.score += offlineSeconds * pointsPerSecond;
    }

    // Reconstruct Card objects
    gameState.cards = gameState.cards.map(cardData => {
      const card = new Card(
        cardData.x,
        cardData.y,
        cardData.width,
        cardData.height,
        cardData.tier,
        cardData.value
      );
      card.originalX = cardData.originalX;
      card.originalY = cardData.originalY;
      return card;
    });

    return gameState;
  }

  static clearSave() {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
