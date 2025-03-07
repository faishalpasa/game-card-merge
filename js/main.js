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

function handleClick(e) {
  if (isProcessingMatch) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  let clickedCard = null;

  for (const card of cards) {
    if (!card.isMatched && card.isPointInside(x, y)) {
      clickedCard = card;
      
      if (!card.isFlipped) {
        card.isFlipped = true;
        selectedCards.push(card);
        
        if (selectedCards.length === 2) {
          isProcessingMatch = true;
          checkMatch();
        }
      }
      break;
    }
  }
  
  // Update the selected card for the popup - show for highlighted card
  const highlightedCard = getHighlightedCard();
  popup.setSelectedCard(highlightedCard);
}

function checkMatch() {
  if (selectedCards[0].value === selectedCards[1].value && selectedCards[0].tier === selectedCards[1].tier) {
    selectedCards[0].isMatched = true;
    selectedCards[1].isMatched = true;
    scoreElement.textContent = `${score}`;

    cards = cards.filter(card => card !== selectedCards[0]);
    selectedCards[1].tier++;
    selectedCards[1].image.src = `images/cards/${selectedCards[1].tier}/${selectedCards[1].value}.png`;
    selectedCards[1].isFlipped = false;
    selectedCards[1].isMatched = false;

    selectedCards = [];
    isProcessingMatch = false;
    popup.setSelectedCard(null); // Hide popup when cards are matched
  } else {
    selectedCards[0].isNotMatched = true;
    selectedCards[1].isNotMatched = true;
    
    setTimeout(() => {
      selectedCards[0].isFlipped = false;
      selectedCards[1].isFlipped = false;
      selectedCards[0].isNotMatched = false;
      selectedCards[1].isNotMatched = false;
      selectedCards = [];
      isProcessingMatch = false;
      popup.setSelectedCard(null); // Hide popup when cards are unflipped
    }, 500);
  }
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

canvas.addEventListener('click', handleClick);
window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrameId);
  clearInterval(scoreInterval);
});
