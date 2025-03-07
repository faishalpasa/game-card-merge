export class Card {
  constructor(x, y, width, height, tier,value) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = value;
    this.tier = tier;
    this.isFlipped = false;
    this.isMatched = false;
    this.isNotMatched = false;
    this.image = new Image();
    this.imageLoaded = false;
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = `images/cards/${tier}/${value}.png`;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.clip();

    if (this.imageLoaded) {
      // Only draw the image if it's loaded
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Draw a placeholder while image is loading
      ctx.fillStyle = '#ddd';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Handle not matched effect
    if (this.isNotMatched) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red overlay
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Normal highlight for flipped cards
    else if (this.isFlipped && !this.isMatched) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }
}
