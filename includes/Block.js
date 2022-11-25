class Block {
    constructor(x, y, s) {
        this.pos = createVector(x, y);

        var g = Math.floor(random(256));
        var a = Math.floor(random(256));

        this.grey = createVector(g, a);
        this.greyVel = createVector(0, 0, 0);
        this.greyAcc = createVector(0, 0, 0);
        
        this.size = s;
        this.maxspeed = 1;
        this.maxforce = 0.01;

        this.radius = 15;
    }

    applyForce(force) {
        this.greyAcc.add(force);
    }

    flock(blocks) {
        var sep = this.separate(blocks);
        var ali = this.align(blocks);
        var coh = this.cohesion(blocks);
        
        sep.mult(1.2); // 1.5
        ali.mult(1);
        coh.mult(2);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    // applyBehaviors(blocks, target) {
    //     var separate = separate(blocks);
    //     var seek = seek(target);

    //     separate.mult(0.5);
    //     seek.mult(1.5);

    //     applyForce(separate);
    //     applyForce(seek);
    // }

    seek(target) {
        var desired = p5.Vector.sub(target, this.grey);
        desired.normalize();
        desired.mult(this.maxspeed); // normalize and then scale
        var steer = p5.Vector.sub(desired, this.greyVel);
        steer.limit(this.maxforce);
        return steer;
    }

    separate(blocks) {
        var sum = createVector(0, 0);
        var count = 0;
        var steer = createVector(0, 0);

        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i] != null) {
                var diff = p5.Vector.sub(this.grey, blocks[i].grey);
                diff.normalize();
                sum.add(diff);
                count++;
            }
        }

        // for some reason, javascript doesn't like this syntax and throws no errors/warnings
        // for (var block in blocks) {
        //     if (block != null) {
        //         var diff = p5.Vector.sub(this.grey, block.grey);
        //         diff.normalize();
        //         sum.add(diff);
        //         count++;
        //     }
        // }

        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxspeed);

            steer = p5.Vector.sub(sum, this.greyVel);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    align(blocks) {
        var sum = createVector(0, 0);
        var count = 0;
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i] != null) {
                sum.add(blocks[i].greyVel);
                count++;
            }
        }
        // for (var block in blocks) {
        //     if (block != null) {
        //         sum.add(block.greyVel);
        //         count++;
        //     }
        // }

        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxspeed);
            var steer = p5.Vector.sub(sum, this.greyVel);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    cohesion(blocks) {
        var sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
        var count = 0;
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i] != null) {
                sum.add(blocks[i].grey);
                count++;
            }
        }

        // for (var block in blocks) {
        //     if (block != null) {
        //         sum.add(block.grey); // Add location
        //         count++;
        //     }
        // }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);  // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    }

    display() {
        noStroke();
        fill(this.grey.x, this.grey.y);
        rect(this.pos.x, this.pos.y, this.size, this.size);
        //for (int x = 0; x < size; x += 3) {
        //  for (int y = 0; y < size; y += 5) {
        //    rect(x+pos.x, y+pos.y, 2, 2);
        //  }
        //}
        //ellipse(pos.x, pos.y, size, size);
    }

    update() {
        this.greyVel.add(this.greyAcc);
        this.greyVel.limit(this.maxspeed);
        this.grey.add(this.greyVel);

        this.edges();

        this.greyAcc.mult(0); // reset acceleration
    }

    edges() {
        if (this.grey.x > 255) {
            this.grey.x = 255;
            this.greyVel.x *= -1;
        } else if (this.grey.x < 0) {
            this.grey.x = 0;
            this.greyVel.x *= -1;
        }

        if (this.grey.y > 255) {
            this.grey.y = 255;
            this.greyVel.y *= -1;
        } else if (this.grey.y < 0) {
            this.grey.y = 0;
            this.greyVel.y *= -1;
        }
    }
}
