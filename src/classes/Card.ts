export class Card {
  id: string
  x: number
  y: number
  width: number
  height: number
  tier: number
  value: number
  originalX: number
  originalY: number
  isFlipped: boolean
  isMatched: boolean
  isNotMatched: boolean
  image: HTMLImageElement
  imageLoaded: boolean
  isSelected: boolean = false

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    tier: number,
    value: number
  ) {
    this.id = id
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.tier = tier
    this.value = value
    this.originalX = x
    this.originalY = y
    this.isFlipped = false
    this.isMatched = false
    this.isNotMatched = false
    this.imageLoaded = false
    this.image = new Image()

    // Add image load handler
    this.image.onload = () => {
      this.imageLoaded = true
    }
    this.image.onerror = () => {
      console.warn(`Failed to load image for card tier ${tier} value ${value}`)
      this.imageLoaded = false
    }
    this.image.src = `/images/cards/${tier}/${value}.png`
  }

  isPointInside(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    )
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    // Draw card background
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = this.isSelected ? '#4CAF50' : '#000000'
    ctx.lineWidth = this.isSelected ? 2 : 1
    ctx.beginPath()
    ctx.roundRect(this.x, this.y, this.width, this.height, 6)
    ctx.fill()
    ctx.stroke()

    // Only try to draw image if it's loaded
    if (this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    } else {
      // Draw fallback text
      ctx.fillStyle = '#000000'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `${this.value}`,
        this.x + this.width / 2,
        this.y + this.height / 2
      )
      ctx.font = '12px Arial'
      ctx.fillText(
        `T${this.tier}`,
        this.x + this.width / 2,
        this.y + this.height / 2 + 20
      )
    }

    // Draw highlight effects
    if ((this.isFlipped && !this.isMatched) || this.isSelected) {
      ctx.fillStyle = this.isSelected
        ? 'rgba(76, 175, 80, 0.1)'
        : 'rgba(255, 215, 0, 0.3)'
      ctx.fill()
    }

    if (this.isNotMatched) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
      ctx.fill()
    }

    // Draw info button when selected
    if (this.isSelected) {
      const buttonSize = 16
      const buttonX = this.x + this.width - buttonSize - 4
      const buttonY = this.y + 4

      ctx.fillStyle = '#4CAF50'
      ctx.beginPath()
      ctx.arc(
        buttonX + buttonSize / 2,
        buttonY + buttonSize / 2,
        buttonSize / 2,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Draw 'i' symbol
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('i', buttonX + buttonSize / 2, buttonY + buttonSize / 2)
    }

    ctx.restore()
  }

  isInfoButtonClicked(x: number, y: number): boolean {
    if (!this.isSelected) return false

    const buttonSize = 16
    const buttonX = this.x + this.width - buttonSize - 4
    const buttonY = this.y + 4

    const dx = x - (buttonX + buttonSize / 2)
    const dy = y - (buttonY + buttonSize / 2)
    return dx * dx + dy * dy <= ((buttonSize / 2) * buttonSize) / 2
  }
}
