class Invader {
    constructor(pos, cellSize) {
        this.pos = pos;
        this.cellSize = cellSize;
        this.margin = 12;
        this.pixelSize = (this.cellSize - this.margin*2) / 5;
        this.pixLoc = [[], [], [], [], []];
    }

    genGrid() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (i <= (5/2)) {
                    let r = Math.random() < 0.5 ? 1 : 0; // 1 or 0 to place pixel
                    this.pixLoc[i][j] = createVector(this.pixelSize*i+this.margin, this.pixelSize*j+this.margin, r);
                } else {
                    let r = (this.pixLoc[i%2][j].z == 1) ? 1 : 0;
                    this.pixLoc[i][j] = createVector(this.pixelSize*i+this.margin, this.pixelSize*j+this.margin, r);
                    // if (this.pixLoc[i%2][j]) this.pixLoc[i][j].z = 1;
                }
            }
        }
    }

    display() {     
        push();
        translate(this.pos.x, this.pos.y);
        fill(0);
        // noStroke();
        stroke(0);
        strokeWeight(1);

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                var loc = this.pixLoc[i][j];
                if (loc.z == 1) {
                    rect(loc.x, loc.y, this.pixelSize, this.pixelSize);
                }
            }
        }
        pop();
    }
}
