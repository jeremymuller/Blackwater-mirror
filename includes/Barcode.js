class Barcode {
    constructor(pos, w, h, rotate) {
        this.xpos = 0;
        this.pos = pos.copy();
        this.vel = createVector();
        this.acc = createVector();

        this.xoff = floor(random(1000));
        this.heightXOff = floor(random(1000));
        this.heightYOff = floor(random(1000));

        this.wideBar = 5;
        this.wideSpace = this.wideBar;
        this.narrowBar = 1.9;
        this.narrowSpace = this.narrowBar;

        this.barHeights = h;
        this.cellWidth = w;
        this.barCodeVector = createVector();
        this.charWidth = 26.4;
        this.barCodeScale = 1.5;
        this.scrollIncrement = 2;
        this.scrollPosition = 0;

        this.rotation = rotate;
        this.variableHeight = false;
        this.heightIndex = 0;
        this.phrase;
        this.chooseNewPhrase();

        // this.barcode = loadImage('images/barcode1.png');

        // switch(random([0, 1, 2, 3, 4])) {
        //     case 0:
        //         this.barcode = loadImage('images/barcode1.png');
        //         break;
        //     case 1:
        //         this.barcode = loadImage('images/barcode2.png');
        //         break;
        //     case 2:
        //         this.barcode = loadImage('images/barcode3.png');
        //         break;
        //     case 3:
        //         this.barcode = loadImage('images/barcode4.png');
        //         break;
        //     case 4:
        //         this.barcode = loadImage('images/barcode5.png');
        //         break;
        // }



        // this.phrase = "*BLACKWATER THE LITTLE PRINCE MERCENARY";
        // this.phrase += " OUTSOURCING US MILITARY OPERATIONS IN MUSLIM COUNTRIES";
        // this.phrase += " THE WORLDS MOST POWERFUL MERCENARY ARMY";
        // this.phrase += " THE WHORES OF WAR";
        // this.phrase += " DEATH SQUADS MERCENARIES AND THE SALVADOR OPTION*";

        this.dict = {
            "A": "201013102",
            "B": "102013102",
            "C": "202013101",
            "D": "101023102",
            "E": "201023101",
            "F": "102023101",
            "G": "101013202",
            "H": "201013201",
            "I": "102013201",
            "J": "101023201",
            "K": "201010132",
            "L": "102010132",
            "M": "202010131",
            "N": "101020132",
            "O": "201020131",
            "P": "102020131",
            "Q": "101010232",
            "R": "201010231",
            "S": "102010231",
            "T": "101020231",
            "U": "231010102",
            "V": "132010102",
            "W": "232010101",
            "X": "131020102",
            "Y": "231020101",
            "Z": "132020101",
            "0": "101320201",
            "1": "201310102",
            "2": "102310102",
            "3": "202310101",
            "4": "101320102",
            "5": "201320101",
            "6": "102320101",
            "7": "101310202",
            "8": "201310201",
            "9": "102310201",
            " ": "132010201",
            ".": "231010201",
            "*": "131020201"
        };
    }

    show() {
        // background(0);
        // imageMode(CORNER);
        push();
        // translate(scrollBarCodes[1] + 2, 0);
        translate(this.pos.x, this.pos.y);
        if (this.rotation > 0) {
            rotate(HALF_PI);
            translate(0, -this.barHeights);
        }
        noStroke();
        fill(255);
        rect(0, 0, this.cellWidth, this.barHeights);
        this.barCodeVector.mult(0);
        this.barCodeVector.x += this.scrollPosition;



        // image(this.barcode, this.barCodeVector.x, 0, this.barcode.width, this.barHeights);
        // image(this.barcode, 0, 0, this.barcode.width, this.barHeights);

        this.heightXOff = 0;

        for (var i = 0; i < this.phrase.length; i++) {
            
            var char = phrase[i];
            this.drawBarCode(this.barCodeVector, dict[char]);
            this.barCodeVector.x += (this.charWidth * this.barCodeScale + this.narrowSpace);
            
            // console.log("barcode tail: " + this.barCodeVector.x);
            // var charspace = this.barCodeVector.x + this.charWidth * this.barCodeScale + this.narrowSpace;
            // if (charspace > this.cellWidth)
            //     break;
            this.heightXOff += 0.1;
        }
        
        this.heightYOff += 0.008;

        
        if (this.barCodeVector.x < 0) {
            this.scrollPosition = this.cellWidth;
            this.chooseNewPhrase();
        }
        
        pop();
        this.scrollPosition -= this.scrollIncrement;
        // console.log("increment: " + this.scrollIncrement);


        // push();
        // translate(this.pos.x, this.pos.y);
        // noStroke();
        // fill(0);

        // for (var i = 0; i < this.phrase.length; i++) {
        //     var char = this.phrase[i];
        //     var code = this.dict[char];
        //     for (var j = 0; j < code.length; j++) {
        //         if (code[j] === '0') {
        //             this.xpos += (this.narrowSpace * this.barCodeScale);
        //         }
        //         else if (code[j] === '1') {
        //             var r = random(10); // use maybe?
        //             rect(this.xpos, 0, this.narrowBar * barCodeScale, this.barHeights);
        //             this.xpos += (this.narrowBar * this.barCodeScale);
        //         }
        //         else if (code[j] === '2') {
        //             var r = random(10);
        //             rect(this.xpos, 0, this.wideBar * this.barCodeScale, this.barHeights);
        //             this.xpos += (this.wideBar * this.barCodeScale);
        //         }
        //         else if (code[j] === '3') {
        //             this.xpos += (this.wideSpace * this.barCodeScale);
        //         }
        //     }
        // }

        // pop();
    }

    update() {
        var n = noise(this.xoff);
        n = map(n, 0, 1, 0.1, 4);
        this.scrollIncrement = n;
        // this.vel.x = n;
        // this.vel.add(this.acc);
        // this.pos.add(this.vel);
        this.acc.mult(0);
        this.xoff += 0.01;
    }

    chooseNewPhrase() {
        switch (random([0, 1, 2, 3, 4])) {
            case 0:
                this.phrase = "*BLACKWATER THE LITTLE PRINCE MERCENARY";
                break;
            case 1:
                this.phrase = "*OUTSOURCING US MILITARY OPERATIONS IN MUSLIM COUNTRIES*";
                break;
            case 2:
                this.phrase = "*THE WORLDS MOST POWERFUL MERCENARY ARMY*";
                break;
            case 3:
                this.phrase = "*THE WHORES OF WAR*";
                break;
            case 4:
                this.phrase = "*DEATH SQUADS MERCENARIES AND THE SALVADOR OPTION*";
                break;
        }
    }

    drawBarCode(loc, code) {
        this.xpos = 0;        
        push();
        translate(loc.x, loc.y);

        noStroke();
        fill(0);
        for (var i = 0; i < code.length; i++) {
            var r = 0;
            if (this.variableHeight) {
                var n = noise(this.heightXOff, this.heightYOff);
                r = map(n, 0, 1, 10, height / 2 - 100);
            }

            if ((loc.x + this.xpos) > this.cellWidth) {                
                break;
            }
            if (code[i] === '0') {
                this.xpos += (this.narrowSpace * this.barCodeScale);
            } else if (code[i] === '1') {

                if ((loc.x+this.xpos) > 0)
                    rect(this.xpos, r, this.narrowBar * this.barCodeScale, this.barHeights-r);
                this.xpos += (this.narrowBar * this.barCodeScale);
            } else if (code[i] === '2') {
                if ((loc.x+this.xpos) > 0)
                    rect(this.xpos, r, this.wideBar * this.barCodeScale, this.barHeights-r);
                this.xpos += (this.wideBar * this.barCodeScale);
            } else if (code[i] === '3') {
                this.xpos += (this.wideSpace * this.barCodeScale);
            }
        }
        // this.heightXOff += 0.01;
        
        pop();        
    }
}
