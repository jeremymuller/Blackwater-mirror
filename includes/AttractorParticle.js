class AttractorParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.prev = createVector(x, y);
        this.vel = createVector();
        // this.vel.setMag(random(2, 5));
        this.acc = createVector();
        // this.history = [];
    }
    update() {
        this.vel.add(this.acc);
        this.vel.limit(5);
        this.pos.add(this.vel);
        this.acc.mult(0);
        // this.history.push(this.pos.copy());
        // if (this.history.length > 4) this.history.splice(0, 1);
    }
    show() {
        stroke(255, 75);
        strokeWeight(2);
        line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
        // beginShape();
        // for (var i = 0; i < this.history.length; i++) {
        //   var pos = this.history[i];
        //   vertex(pos.x, pos.y);
        // }
        // endShape();
        this.prev.x = this.pos.x;
        this.prev.y = this.pos.y;
    }
    attracted(target) {
        var force = p5.Vector.sub(target, this.pos);
        var d = force.mag();
        if (d < 30) {
            force.mult(-10);
        }
        d = constrain(d, 1, 25);
        var G = 50;
        var strength = G / (d * d);
        force.setMag(strength);
        this.acc.add(force);
    }
}
