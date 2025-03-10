import { POINT_INCREASE_RATE } from '@/constants/game'

export class Card {
  id: string
  x: number
  y: number
  width: number
  height: number
  level: number
  value: number
  originalX: number
  originalY: number
  isFlipped: boolean
  isMatched: boolean
  isNotMatched: boolean
  image: HTMLImageElement
  thumbImage: HTMLImageElement
  imageLoaded: boolean
  thumbImageLoaded: boolean
  isSelected: boolean = false
  placeOrder: number = 0
  point: number = 0

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    level: number,
    value: number
  ) {
    this.id = id
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.level = level
    this.value = value
    this.originalX = x
    this.originalY = y
    this.isFlipped = false
    this.isMatched = false
    this.isNotMatched = false
    this.imageLoaded = false
    this.placeOrder = 0
    this.image = new Image()
    this.thumbImage = new Image()
    this.thumbImageLoaded = false
    this.point = value * Math.pow(POINT_INCREASE_RATE, level)

    // Add image load handler
    this.image.onload = () => {
      this.imageLoaded = true
    }
    this.image.onerror = () => {
      console.warn(
        `Failed to load image for card level ${level} value ${value}`
      )
      this.imageLoaded = false
    }
    this.image.src = `${import.meta.env.VITE_BASE_URL}/images/cards/big/${level}/${value}.png`

    // Add thumb image load handler
    this.thumbImage.onload = () => {
      this.thumbImageLoaded = true
    }
    this.thumbImage.onerror = () => {
      this.thumbImageLoaded = false
    }
    this.thumbImage.src = `${import.meta.env.VITE_BASE_URL}/images/cards/thumb/${level}/${value}.png`
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
    ctx.lineWidth = this.isSelected ? 4 : 1
    ctx.beginPath()
    ctx.roundRect(this.x, this.y, this.width, this.height, 6)
    ctx.fill()
    ctx.stroke()

    // Only try to draw image if it's loaded
    if (this.thumbImageLoaded) {
      ctx.roundRect(this.x, this.y, this.width, this.height, 6)
      ctx.clip()
      ctx.drawImage(
        this.thumbImage,
        16,
        40,
        240,
        300,
        this.x,
        this.y,
        this.width,
        this.height
      )
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
        `Lv ${this.level}`,
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
      ctx.fillStyle = '#4CAF50'
      ctx.beginPath()
      ctx.fill()
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
