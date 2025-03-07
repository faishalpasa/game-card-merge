export class Card {
    constructor(x, y, width, height, value) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
        this.isFlipped = false;
        this.isMatched = false;
        this.image = new Image();
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.src = `/images/cards/1/${value}.png`;
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

        // If not flipped or matched, cover with a semi-transparent overlay
        if (this.isFlipped && !this.isMatched) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.isFlipped && this.isMatched) {
          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          ctx.fillRect(this.x, this.y, this.width, this.height);
      }

        ctx.restore();
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}
