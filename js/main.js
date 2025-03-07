import { Card } from './card.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let animationFrameId;
let cards = [];
let selectedCards = [];
let currentRound = 1;
let score = 0;
let matchedPairs = 0;
let totalPairs = 10; // Start with 2 pairs (4 cards)
let isProcessingMatch = false;

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
    const totalCards = totalPairs * 2;
    
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(totalCards));
    const rows = Math.ceil(totalCards / cols);
    
    // Calculate starting position to center the grid
    const gridWidth = cols * (cardWidth + padding) - padding;
    const gridHeight = rows * (cardHeight + padding) - padding;
    const startX = (canvas.width - gridWidth) / 2;
    const startY = (canvas.height - gridHeight) / 2;
    
    cards = [];
    const values = [];
    
    // Create pairs of values
    for (let i = 1; i <= totalPairs; i++) {
        values.push(i, i);
    }
    
    // Shuffle values
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    // Filter values to only use numbers 1-5
    const availableValues = [1, 2, 3, 4, 5];
    values.length = 0; // Clear existing values
    
    // Create pairs using only numbers 1-5
    for (let i = 0; i < totalPairs; i++) {
        const value = availableValues[i % 5]; // Cycle through 1-5
        values.push(value, value);
    }
    
    // Shuffle values again
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    
    // Create cards without backImage
    let index = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (index < totalCards) {
                const x = startX + col * (cardWidth + padding);
                const y = startY + row * (cardHeight + padding);
                cards.push(new Card(x, y, cardWidth, cardHeight, values[index]));
                index++;
            }
        }
    }
}

function startNewRound() {
    if (currentRound < 10) {
        currentRound++;
        totalPairs = totalPairs + 1; // Increase pairs by 1 each round
        matchedPairs = 0;
        selectedCards = [];
        isProcessingMatch = false;
        layoutCards();
    } else {
        // Game completed
        alert(`Game Complete! Final Score: ${score}`);
    }
}

function checkMatch() {
    if (selectedCards[0].value === selectedCards[1].value) {
        selectedCards[0].isMatched = true;
        selectedCards[1].isMatched = true;
        matchedPairs++;
        score += 100;
        document.getElementById('score').textContent = `Score: ${score}`;
        
        if (matchedPairs === totalPairs) {
            setTimeout(startNewRound, 1000);
        }
        selectedCards = [];
        isProcessingMatch = false;
    } else {
        setTimeout(() => {
            selectedCards[0].isFlipped = false;
            selectedCards[1].isFlipped = false;
            selectedCards = [];
            isProcessingMatch = false;
        }, 1000);
    }
}

function handleClick(e) {
    if (isProcessingMatch) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const card of cards) {
        if (!card.isMatched && !card.isFlipped && card.isPointInside(x, y)) {
            card.isFlipped = true;
            selectedCards.push(card);
            
            if (selectedCards.length === 2) {
                isProcessingMatch = true;
                checkMatch();
            }
            break;
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all cards
    cards.forEach(card => card.draw(ctx));
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

function preloadImages(callback) {
    const totalImages = 10; // Total number of different images
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
        img.src = `/images/cards/${i}.png`;
        images.push(img);
    }
}

// Replace the start game code
function startGame() {
    adjustCanvasSize();
    layoutCards();
    gameLoop();
}

// Replace the immediate startGame call with preloading
preloadImages(() => {
    startGame();
});

canvas.addEventListener('click', handleClick);
window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
});
