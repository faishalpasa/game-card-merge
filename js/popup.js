export class Popup {
  constructor() {
    this.createPopupElements();
    this.isVisible = false;
    this.selectedCard = null;
  }

  createPopupElements() {
    // Create info button
    this.infoButton = document.createElement('button');
    this.infoButton.className = 'fixed bottom-4 right-4 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hidden';
    this.infoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center';
    
    // Create modal content
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4';
    
    // Create close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700';
    this.closeButton.innerHTML = '×';
    
    // Create card details container
    this.cardDetails = document.createElement('div');
    this.cardDetails.className = 'text-center';
    
    // Append elements
    this.modalContent.appendChild(this.closeButton);
    this.modalContent.appendChild(this.cardDetails);
    this.modal.appendChild(this.modalContent);
    document.body.appendChild(this.infoButton);
    document.body.appendChild(this.modal);
    
    // Add event listeners
    this.infoButton.addEventListener('click', () => this.showCardDetails());
    this.closeButton.addEventListener('click', () => this.hideCardDetails());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hideCardDetails();
    });
  }

  setSelectedCard(card) {
    this.selectedCard = card;
    this.infoButton.classList.toggle('hidden', !card);
  }

  showCardDetails() {
    if (!this.selectedCard) return;

    this.cardDetails.innerHTML = `
      <div class="mb-4">
        <img src="${this.selectedCard.image.src}" 
            alt="Card ${this.selectedCard.value}" 
            class="mx-auto w-32 h-48 object-contain">
      </div>
      <div class="space-y-2">
        <p class="text-xl font-bold">Card Details</p>
        <p>Tier: ${this.selectedCard.tier}</p>
        <p>Points per second: ${this.selectedCard.tier * this.selectedCard.value}</p>
      </div>
    `;

    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  }

  hideCardDetails() {
    this.modal.classList.remove('flex');
    this.modal.classList.add('hidden');
  }
}
