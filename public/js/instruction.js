export class InstructionPopup {
  constructor() {
    this.hasSeenInstructions = localStorage.getItem('hasSeenInstructions')
    if (!this.hasSeenInstructions) {
      this.createPopup()
    }
  }

  createPopup() {
    // Create modal container
    this.modal = document.createElement('div')
    this.modal.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'

    // Create modal content
    this.modalContent = document.createElement('div')
    this.modalContent.className =
      'bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative'

    // Create content
    this.modalContent.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">How to Play</h2>
      
      <div class="space-y-4 mb-6">
        <div class="space-y-2">
          <p class="font-semibold">🎮 Basic Gameplay:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Drag and drop cards of the same tier and value to merge them</li>
            <li>Merged cards upgrade to the next tier</li>
            <li>Higher tier cards generate more points per second</li>
          </ul>
        </div>

        <div class="space-y-2">
          <p class="font-semibold">💰 Points System:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Each card generates points based on its tier × value</li>
            <li>Use points to buy new cards</li>
            <li>Card price increases with each purchase</li>
          </ul>
        </div>

        <div class="space-y-2">
          <p class="font-semibold">ℹ️ Tips:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Click a card to see its details</li>
            <li>Try to create higher tier cards for more points</li>
            <li>Plan your merges carefully!</li>
          </ul>
        </div>
      </div>

      <button id="startGameBtn" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
        Start Playing!
      </button>
    `

    this.modal.appendChild(this.modalContent)
    document.body.appendChild(this.modal)

    // Add event listener to start button
    document.getElementById('startGameBtn').addEventListener('click', () => {
      this.hideInstructions()
    })
  }

  hideInstructions() {
    this.modal.remove()
    localStorage.setItem('hasSeenInstructions', 'true')
  }
}
