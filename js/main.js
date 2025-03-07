import { Card } from './card.js';
import { Popup } from './popup.js';
import { AddCardButton } from './addCard.js';
import { GameSaver } from './save.js';

const MAX_CARDS = 20;

const scoreElement = document.getElementById('score');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

scoreElement.classList.add('hidden');

let animationFrameId;
let cards = [];
let selectedCards = [];
let currentRound = 1;
let score = 0;
let isProcessingMatch = false;
let isLoading = true;
let scoreInterval;
let lastScoreUpdate = 0;
let isDragging = false;
let draggedCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Add after other const declarations
const popup = new Popup();
let addCardButton;

// Add after other declarations
let lastSaveTime = 0;
const SAVE_INTERVAL = 5000; // Save every 5 seconds

function adjustCanvasSize() {
  if (window.innerWidth <= 720) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = 720;
    canvas.height = window.innerHeight;
  }
  if (cards.length > 0) {
    layoutCards();
  }
}

function layoutCards() {
  const cardWidth = 50;
  const cardHeight = 75;
  const padding = 4;
  const initialCards = 4;  // Set initial number of cards
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(MAX_CARDS));
  const rows = Math.ceil(MAX_CARDS / cols);
  
  // Calculate starting position to center the grid
  const gridWidth = cols * (cardWidth + padding) - padding;
  const gridHeight = rows * (cardHeight + padding) - padding;
  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;
  
  cards = [];

  // Create initial cards in first row
  for (let i = 0; i < initialCards; i++) {
    const x = startX + i * (cardWidth + padding);
    const y = startY;
    const value = Math.floor(Math.random() * 5) + 1;
    const card = new Card(x, y, cardWidth, cardHeight, 1, value);
    cards.push(card);
  }
}

function startNewRound() {
  if (currentRound < 10) {
    currentRound++;
    selectedCards = [];
    isProcessingMatch = false;
    layoutCards();
  } else {
    // Game completed
    clearInterval(scoreInterval);
    alert(`Game Complete! Final Score: ${score}`);
  }
}

function getHighlightedCard() {
  return cards.find(card => card.isFlipped && !card.isMatched);
}

// Modify mouse/touch event handlers
function getEventCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Account for canvas scaling
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Add this function to handle single clicks
function handleClick(e) {
  const coords = getEventCoordinates(e);
  
  // Reset all cards' selected state
  cards.forEach(card => card.isSelected = false);
  
  // Find clicked card
  for (const card of cards) {
    if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
      card.isSelected = true;
      popup.setSelectedCard(card);
      return;
    }
  }
  
  // If we click outside any card, deselect all
  popup.setSelectedCard(null);
}

function handleStart(e) {
  e.preventDefault();
  const coords = getEventCoordinates(e);
  
  // Store the start time to differentiate between clicks and drags
  const startTime = Date.now();
  
  for (const card of cards) {
    if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
      isDragging = true;
      draggedCard = card;
      dragOffsetX = coords.x - card.x;
      dragOffsetY = coords.y - card.y;
      card.isFlipped = true;
      
      // Handle the end of the interaction
      const handleEndInteraction = () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // If it was a short tap/click (less than 200ms), treat it as a click
        if (duration < 200 && Math.abs(card.x - card.originalX) < 5 && Math.abs(card.y - card.originalY) < 5) {
          handleClick(e);
        }
      };
      
      // Add one-time listener for mouseup/touchend
      const cleanup = (ev) => {
        handleEndInteraction();
        canvas.removeEventListener('mouseup', cleanup);
        canvas.removeEventListener('touchend', cleanup);
      };
      
      canvas.addEventListener('mouseup', cleanup, { once: true });
      canvas.addEventListener('touchend', cleanup, { once: true });
      
      break;
    } else {
      cards.forEach(card => card.isSelected = false);
      popup.setSelectedCard(null);
    }
  }
}

function handleMove(e) {
  e.preventDefault();
  if (!isDragging || !draggedCard) return;
  
  const coords = getEventCoordinates(e);
  
  // Update card position
  draggedCard.x = coords.x - dragOffsetX;
  draggedCard.y = coords.y - dragOffsetY;
  
  // Check for potential matches while dragging
  for (const card of cards) {
    if (card !== draggedCard && !card.isMatched) {
      if (card.isPointInside(coords.x, coords.y)) {
        card.isFlipped = true;
      } else {
        card.isFlipped = false;
      }
    }
  }
}

function handleEnd(e) {
  e.preventDefault();
  if (!isDragging || !draggedCard) return;
  
  const coords = getEventCoordinates(e.changedTouches ? e.changedTouches[0] : e);
  
  // Check if we dropped on another card
  for (const card of cards) {
    if (card !== draggedCard && !card.isMatched && card.isPointInside(coords.x, coords.y)) {
      // Check if cards match
      if (card.value === draggedCard.value && card.tier === draggedCard.tier) {
        // Merge cards
        cards = cards.filter(c => c !== draggedCard);
        card.tier++;
        card.image.src = `images/cards/${card.tier}/${card.value}.png`;
        card.isFlipped = false;
        
        // Reset states immediately for matching cards
        isDragging = false;
        draggedCard = null;
      } else {
        // Cards don't match - show red highlight
        card.isNotMatched = true;
        draggedCard.isNotMatched = true;
        
        // Store the draggedCard reference
        const draggedCardRef = draggedCard;
        
        // Reset after 500ms
        setTimeout(() => {
          card.isNotMatched = false;
          if (draggedCardRef && cards.includes(draggedCardRef)) {
            draggedCardRef.isNotMatched = false;
            draggedCardRef.x = draggedCardRef.originalX;
            draggedCardRef.y = draggedCardRef.originalY;
            draggedCardRef.isFlipped = false;
          }
          
          // Reset drag state after animation
          isDragging = false;
          draggedCard = null;
          
          // Reset all card highlights
          cards.forEach(c => {
            if (!c.isMatched) {
              c.isFlipped = false;
            }
          });
        }, 250);
        
        return; // Exit the function to prevent immediate reset
      }
      break;
    }
  }
  
  // Only reset position if we didn't drop on another card
  if (cards.includes(draggedCard)) {
    draggedCard.x = draggedCard.originalX;
    draggedCard.y = draggedCard.originalY;
    draggedCard.isFlipped = false;
  }
  
  // Reset drag state
  isDragging = false;
  draggedCard = null;
  
  // Reset all card highlights
  cards.forEach(card => {
    if (!card.isMatched) {
      card.isFlipped = false;
    }
  });
  
  // Reset all cards' selected state after drag
  cards.forEach(card => card.isSelected = false);
  popup.setSelectedCard(null);
}

function drawPlaceholders() {
  const cardWidth = 50;
  const cardHeight = 75;
  const padding = 4;
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(MAX_CARDS));
  const rows = Math.ceil(MAX_CARDS / cols);
  
  // Calculate starting position to center the grid
  const gridWidth = cols * (cardWidth + padding) - padding;
  const gridHeight = rows * (cardHeight + padding) - padding;
  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;

  // Draw placeholder rectangles for all potential card positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      // Draw grey placeholder with black border
      ctx.save();
      ctx.fillStyle = '#e0e0e0';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawPlaceholders();
  cards.forEach(card => card.draw(ctx));
  
  // Auto-save every SAVE_INTERVAL milliseconds
  const currentTime = Date.now();
  if (currentTime - lastSaveTime > SAVE_INTERVAL) {
    GameSaver.saveGame(createGameState());
    lastSaveTime = currentTime;
  }
  
  animationFrameId = requestAnimationFrame(gameLoop);
}

function preloadImages(callback) {
  const totalImages = 5; // Total number of different images
  let loadedImages = 0;
  const images = [];

  for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        callback();
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image ${i}`);
      loadedImages++;
      if (loadedImages === totalImages) {
        callback();
      }
    };
    img.src = `images/cards/1/${i}.png`;
    images.push(img);
  }
}

function drawLoadingScreen() {
  isLoading = true;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#000000';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
}

function fadeOutLoading(opacity, callback) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw semi-transparent white overlay
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw loading text with same opacity
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
  
  if (opacity > 0) {
    requestAnimationFrame(() => fadeOutLoading(opacity - 0.05, callback));
  } else {
    callback();
    isLoading = false;
    scoreElement.classList.remove('hidden');
  }
}

function updateScore() {
  if (isLoading) return;
  
  const scoreToAdd = cards.reduce((sum, card) => sum + (card.tier * card.value), 0);
  score += scoreToAdd;
  scoreElement.textContent = `${score}`;
  
  // Update add card button state
  addCardButton.updateButton(score);
}

function startGame() {
  adjustCanvasSize();
  drawLoadingScreen();
  
  setTimeout(() => {
    fadeOutLoading(1, () => {
      // Try to load saved game
      const savedGame = GameSaver.loadGame();
      
      if (savedGame) {
        // Restore game state
        cards = savedGame.cards;
        score = savedGame.score;
        currentRound = savedGame.currentRound;
        
        // Initialize add card button with saved price and priceIncrease
        addCardButton = new AddCardButton(
          score, 
          handleAddCard, 
          savedGame.priceIncrease  // Pass saved priceIncrease
        );
        addCardButton.currentPrice = savedGame.addCardPrice;
        addCardButton.updateButton(score);
        
        // Update score display
        scoreElement.textContent = `${score}`;
      } else {
        // Start new game
        layoutCards();
        addCardButton = new AddCardButton(score, handleAddCard);
      }
      
      gameLoop();
      scoreInterval = setInterval(updateScore, 1000);
    });
  }, 500);
}

preloadImages(() => {
  startGame();
});

// Replace the event listeners at the bottom of the file
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

// Add touch event listeners
canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd, { passive: false });

window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrameId);
  clearInterval(scoreInterval);
});

// Modify the handleCanvasClick function
function handleCanvasClick(e) {
  // Don't handle clicks if we're dragging
  if (isDragging) return;
  
  const coords = getEventCoordinates(e);
  
  // Check if we clicked on any card first
  for (const card of cards) {
    if (!card.isMatched && card.isPointInside(coords.x, coords.y)) {
      // Let the other click handler manage card clicks
      return;
    }
  }
  
  // If we get here, we clicked outside all cards
  cards.forEach(card => card.isSelected = false);
  popup.setSelectedCard(null);
}

// Move the click event listener to be before the mousedown listener
canvas.removeEventListener('click', handleCanvasClick); // Remove any existing listener
canvas.addEventListener('click', handleCanvasClick);

// Add this function to find first empty placeholder position
function findEmptyPosition() {
  const cardWidth = 50;
  const cardHeight = 75;
  const padding = 4;
  
  const cols = Math.ceil(Math.sqrt(MAX_CARDS));
  const rows = Math.ceil(MAX_CARDS / cols);
  
  const gridWidth = cols * (cardWidth + padding) - padding;
  const gridHeight = rows * (cardHeight + padding) - padding;
  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;

  // Check each position in the grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      // Check if this position is empty
      const isOccupied = cards.some(card => 
        card.originalX === x && card.originalY === y
      );
      
      if (!isOccupied) {
        return { x, y };
      }
    }
  }
  return null;
}

// Add this function to handle adding new cards
function handleAddCard(price) {
  if (score < price) return false;
  
  const position = findEmptyPosition();
  if (!position) return false;
  
  // Deduct points
  score -= price;
  scoreElement.textContent = `${score}`;
  
  // Create new card
  const newCard = new Card(
    position.x,
    position.y,
    50, // width
    75, // height
    1,  // tier
    Math.floor(Math.random() * 5) + 1 // random value 1-5
  );
  
  cards.push(newCard);
  
  // Update button state
  addCardButton.updateButton(score);
  
  return true;
}

// Add this function to create game state object
function createGameState() {
  return {
    cards,
    score,
    currentRound,
    addCardPrice: addCardButton ? addCardButton.currentPrice : 100,
    priceIncrease: addCardButton ? addCardButton.priceIncrease : 100
  };
}

// Add save game when switching tabs
// document.addEventListener('visibilitychange', () => {
//   if (document.hidden) {
//     GameSaver.saveGame(createGameState());
//   }
// });
