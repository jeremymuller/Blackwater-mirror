class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.acc = createVector();
        this.history = [];

        this.pixels = [];
        this.pixelLifespan = 255;
        this.dropPixel = false;
        this.dropPixelCounter = 10;

        this.blocksHistory = [];
        this.dropBlocks = 0;

        this.color = 255;
    }

    repel(mover) {
        var force = p5.Vector.sub(this.pos, mover.pos);
        var distance = force.mag();
        if (distance < 100) {
            distance = constrain(distance, 100.0, 500.0); // TODO
            force.normalize();
            var strength = 1 / (distance * distance);
            force.mult(strength);
            return force;
        } else return 0;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        // var r = p5.Vector.random2D();

        // r.mult(5);
        // this.pos.add(r);
        // this.acc.mult(0);
        // this.acc.add(r);
        // this.acc.limit(1);
        this.vel.add(this.acc);
        this.vel.limit(3);

        if (this.pos.x > width || this.pos.x < 0) this.vel.x *= -1;
        if (this.pos.y > height || this.pos.y < 0) this.vel.y *= -1;

        this.pos.add(this.vel);
        this.acc.mult(0);

        this.history.push(this.pos.copy());

        if (this.history.length > 50) this.history.splice(0, 1);

        if (this.dropBlocks > 0) {
            for (var x = 0; x < width; x += 20) {
                for (var y = 0; y < height; y += 20) {
                    if (this.pos.x > x && this.pos.x < x + 20 && this.pos.y > y && this.pos.y < y + 20) {
                        var p = createVector(x, y, 255);
                        this.blocksHistory.push(p);
                        this.color = 0;
                    }
                }
            }
            this.dropBlocks--;
        } else if (Math.random() < 0.001) {
            this.dropBlocks = 60;
        } else {
            this.color = 255;
        }
    }

    show() {
        // blocks
        for (var i = 0; i < this.blocksHistory.length; i++) {

            var block = this.blocksHistory[i];
            if (block.z > 0) {
                noStroke();
                fill(255, block.z);
                rect(block.x, block.y, 20, 20);
                block.z -= random(1, 3);
            }
        }
        if (this.blocksHistory.length > 50) this.blocksHistory.splice(0, 1);

        // head
        fill(this.color, 200);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 10, 10);
        stroke(this.color, 200);
        strokeWeight(5);
        noFill();
        ellipse(this.pos.x, this.pos.y, 20, 20);

        // tail
        // stroke(this.color, 200);
        // strokeWeight(1);
        // beginShape();
        // for (var i = 0; i < this.history.length; i++) {
        //     var pos = this.history[i];
        //     vertex(pos.x, pos.y);
        // }
        // endShape();
        // var endP = this.history[0];
        // fill(this.color, 200);
        // noStroke();
        // ellipse(endP.x, endP.y, 10, 10);

        // 0.1% chance to drop pixel


        // var center = createVector(width/2, height/2);
        // var origin = createVector();
        // var maxDist = p5.Vector.dist(origin, center);
        // var d = this.pos.dist(center);
        // var prob = map(d, 0, maxDist, 0.02, 0); // 2% when center, 0% when edge

        // if (random() < prob) {
        //     var pix = createVector(this.pos.x, this.pos.y, this.pixelLifespan);
        //     this.pixels.push(pix);
        // }

        // draw pixel
        // OLD?!?!
        for (var i = 0; i < this.pixels.length; i++) {
            var pix = this.pixels[i];
            if (pix.z > 0) {
                var r = p5.Vector.random2D();
                pix.add(r);
                fill(255, pix.z);
                noStroke();
                // ellipse(pix.x, pix.y, 10, 10);
                stroke(255, pix.z);
                // strokeWeight(5);
                strokeWeight(2);
                noFill();
                ellipse(pix.x, pix.y, 15, 15);
                // ellipse(pix.x, pix.y, 20, 20);

                // noStroke();
                // fill(255, pix.z);
                // rect(pix.x - 15, pix.y - 15, 30, 30);
                this.pixels[i].z--;
            }
        }
        if (this.pixels.length > 10) this.pixels.splice(0, 1);
    }
}
