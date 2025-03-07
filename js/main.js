import { Card } from './card.js';
import { Popup } from './popup.js';

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
  const totalCards = 4;
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(MAX_CARDS));
  const rows = Math.ceil(MAX_CARDS / cols);
  
  // Calculate starting position to center the grid
  const gridWidth = cols * (cardWidth + padding) - padding;
  const gridHeight = rows * (cardHeight + padding) - padding;
  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;
  
  cards = [];
  const values = [];

  // Generate array of cards
  for (let i = 1; i <= totalCards; i++) {
    // Add each value twice to create pairs
    values.push(Math.floor(Math.random() * 5) + 1);
  }

  // Shuffle the values array
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // Create cards
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (index < totalCards) {
        const x = startX + col * (cardWidth + padding);
        const y = startY + row * (cardHeight + padding);
        cards.push(new Card(x, y, cardWidth, cardHeight, 1, values[index]));
        index++;
      }
    }
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
  
  // Draw placeholders first
  drawPlaceholders();
  
  // Draw all cards on top
  cards.forEach(card => card.draw(ctx));
  
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
  
  // Sum up all (tier * value) for each card
  const scoreToAdd = cards.reduce((sum, card) => sum + (card.tier * card.value), 0);
  score += scoreToAdd;
  scoreElement.textContent = `${score}`;
}

function startGame() {
  adjustCanvasSize();
  drawLoadingScreen();
  
  setTimeout(() => {
    fadeOutLoading(1, () => {
      layoutCards();
      gameLoop();
      // Start the score interval after loading
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
