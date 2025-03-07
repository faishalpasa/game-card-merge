export class AddCardButton {
  constructor(score, onAddCard, savedPriceIncrease = 100) {
    this.basePrice = 100;
    this.priceIncrease = savedPriceIncrease;
    this.currentPrice = this.basePrice;
    this.button = this.createButton();
    this.onAddCard = onAddCard;
    this.updateButton(score);
  }

  createButton() {
    const button = document.createElement('button');
    button.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>Add Card (${this.currentPrice})</span>
    `;
    
    button.addEventListener('click', () => {
      if (this.onAddCard(this.currentPrice)) {
        this.currentPrice += this.priceIncrease;
        button.querySelector('span').textContent = `Add Card (${this.currentPrice})`;
      }
    });
    
    document.body.appendChild(button);
    return button;
  }

  updateButton(score) {
    this.button.disabled = score < this.currentPrice;
  }
}
