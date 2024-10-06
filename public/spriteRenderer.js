class SpriteRenderer {
  constructor(parent, sprite, parts, frames, frameTime,filters,width,height) {
		this.parent = parent;
    this.sprite = sprite;
    this.frameTime = frameTime;
    this.parts = parts;
    this.frames = frames;
		this.width = width;
		this.height = height;
		this.contextes = [];
		this.filters = filters;

		for(let i=0;i<parts;i++){
			const canvas = document.createElement("canvas");
			canvas.style.position = "absolute";
			canvas.style.filter = this.filters[i];
			parent.appendChild(canvas);
			this.contextes.push(canvas.getContext("2d"));
		}

    this.img = new Image();

    this.img.onload = () => {
      this.frameHeight = this.img.height / this.frames;
      this.partWidth = this.img.width / this.parts;

      this.x = this.width - this.partWidth;
      this.y = this.height - this.frameHeight;
    };

    this.img.src = this.sprite;
  }

  start() {
    this.drawNext();
    this.elapsed = 0;
    this.index = 0;
    this.lastTime = 0;

    this.animationId = requestAnimationFrame((timeStamp) =>
      this.animationCallback(timeStamp),
    );
  }

  stop() {
    if (this.animationId != null) cancelAnimationFrame(this.animationId);
  }

  animationCallback(timeStamp) {
    const elapsed = timeStamp - this.lastTime;

    if (elapsed >= this.frameTime) {
      this.lastTime = timeStamp;
      this.drawNext();
    }

    this.animationId = requestAnimationFrame((timeStamp) =>
      this.animationCallback(timeStamp),
    );
  }

	clear() {
		this.parent.innerHTML = "";
	}

  drawNext() {
    for (let i = 0; i < this.parts; i++) {
			this.contextes[i].clearRect(0, 0, this.width, this.height);
      this.contextes[i].drawImage(
        this.img,
        i * this.partWidth,
        this.index * this.frameHeight,
        this.partWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.partWidth,
        this.frameHeight,
      );
    }
    this.index = (this.index + 1) % this.frames;
  }
}
