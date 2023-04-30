const WHITE = '0';
const BLACK = '1';
const LINES = '4';
const ATTRACTORS = '6';
const FLOCKING = '7';

var startButton, text, wrapper;
var motive = '0';
var linesY = [];
var maxLines = 100;
var yoff = 0.0; // use noise()?
var margin = 5;
var maxSquares = 100;
var cellSize = 10;
var cellFills = [];

var blocks = [];
var numOfBlocks = 4500;

var cols = 5;
var rows = 5;
var invaderCellSize;
var arrayOfInvaders = [];
var singleInvader;
var pos = [[], [], [], [], []];
var grid = [[], [], [], [], []];
var travelers = [];

var flockBlocks, flockRows, flockCols;

var attractorsArray = [];
var particlesArray = [];
var attractorAlpha = 255;
var alphaInc = -5;

var inc = 0.1;
var scl = 20;
var dotCols, dotRows;

var zoff = 0;

var dots = [];
var flowfield;

var qrcode;

var globalFade = false;
var globalAlpha = 0;
var takeKeyInput = true;

var dict;
var phrase = "*BLACKWATER THE LITTLE PRINCE MERCENARY";
phrase += " OUTSOURCING US MILITARY OPERATIONS IN MUSLIM COUNTRIES";
phrase += " THE WORLDS MOST POWERFUL MERCENARY ARMY";
phrase += " THE WHORES OF WAR*";
var wideBar = 5;
var wideSpace = wideBar;
var narrowBar = 1.9;
var narrowSpace = narrowBar;
var barHeights;
var charWidth = 26.4;
var barCodeScale = 1.5;
var barCodeVector;
var scrollBarCodes = [0, 0];
var scrollIncrement = [-2, -2];
var arrayOfBarCodes = [];
var singleBarCode;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    cursor();

    textSize(60);
    textAlign(CENTER);

    // pixelDensity(1);
    imageMode(CENTER);
    // qrcode = createImage(600, 600);
    qrcode = loadImage('images/blackwater-qrcode1000x1000.png');

    console.log("phrase: " + phrase);


    barHeights = height/2;
    barCodeVector = createVector();
    dict = {
        "A" : "201013102",
        "B" : "102013102",
        "C" : "202013101",
        "D" : "101023102",
        "E" : "201023101",
        "F" : "102023101",
        "G" : "101013202",
        "H" : "201013201",
        "I" : "102013201",
        "J" : "101023201",
        "K" : "201010132",
        "L" : "102010132",
        "M" : "202010131",
        "N" : "101020132",
        "O" : "201020131",
        "P" : "102020131",
        "Q" : "101010232",
        "R" : "201010231",
        "S" : "102010231",
        "T" : "101020231",
        "U" : "231010102",
        "V" : "132010102",
        "W" : "232010101",
        "X" : "131020102",
        "Y" : "231020101",
        "Z" : "132020101",
        "0" : "101320201",
        "1" : "201310102",
        "2" : "102310102",
        "3" : "202310101",
        "4" : "101320102",
        "5" : "201320101",
        "6" : "102320101",
        "7" : "101310202",
        "8" : "201310201",
        "9" : "102310201",
        " " : "132010201",
        "." : "231010201",
        "*" : "131020201"
    };

    // TODO
    // create button
    // startButton = document.createElement("button");
    // startButton.onclick = buttonAction;
    // text = document.createTextNode("Tap to connect");
    // startButton.appendChild(text);
    // startButton.className = "splash";
    // wrapper = document.createElement("div");
    // wrapper.className = "wrapper";
    // wrapper.id = "container";
    // wrapper.appendChild(startButton);
    // document.body.appendChild(wrapper);

    // initialize lines array
    for (let i = 0; i < maxLines; i++) {
        linesY[i] = random(height);
        // linesY[i] = {'y': random(height), 'a': random(100, 255)};
    }

    var i = 0;
    for (let x = 0; x < width; x += cellSize) {
        for (let y = 0; y < height/2; y += cellSize) {
            if (random() < 0.5) cellFills[i] = 0;
            else cellFills[i] = 255;
            i++;
        }
    }

    for (var i = 0; i < numOfBlocks; i++) {
        var rx = Math.floor(random() * (width/cellSize));
        var ry = Math.floor(random() * (height/2/cellSize));
        blocks[i] = createVector(cellSize * rx, cellSize * ry);
    }
    // cell = createVector(cellSize, cellSize);

    invaderCellSize = width / 2 / rows;

    for (var i = 0; i < 10; i++) {
        travelers[i] = new Particle(random(width), random(height));
    }


    var w = 20;
    flockCols = ~~(width/w);
    flockRows = ~~(height/w);

    flockBlocks = new Array(flockRows);
    for (var i = 0; i < flockRows; i++) {
        flockBlocks[i] = new Array(flockCols);
    }

    for (var y = 0; y < flockRows; y++) {
        for (var x = 0; x < flockCols; x++) {
            flockBlocks[y][x] = new Block(x*w, y*w, w);
        }
    }

    dotCols = floor(width / scl);
    dotRows = floor(height / scl);

    flowfield = new Array(dotCols * dotRows);

    for (var i = 0; i < 5000; i++) {
        dots[i] = new Dot();
    }

    // var pos = createVector(width/4, 0);
    // arrayOfBarCodes[0] = new Barcode(pos, width/2, height/2);


}

function draw() {
    background(255);
    // fill(0);
    // noStroke();
    switch(motive) {
        case '0':
            background(255);
            fill(0);
            text('blackwater.jeremymuller.com', width/2, height/2-325);
            // qrcode.loadPixels();
            // for (var y = 0; y < qrcode.width; y++) {
            //     for (var x = 0; x < qrcode.height; x++) {
            //         var index = (x + y * qrcode.width) * 4;
            //         var r = qrcode.pixels[index];
            //         var g = qrcode.pixels[index+1];
            //         var b = qrcode.pixels[index+2];
            //         var bright = (r+g+b) / 3;

            //         noStroke();
            //         fill(bright);
            //         rect(x * 0.6 + (width/2 - 300), y * 0.6 + (height/2 - 300), 1, 1);
            //     }
            // }
            // qrcode.updatePixels();
            image(qrcode, width/2, height/2, 600, 600);

            // noStroke();
            // fill(0);
            // rect(0, 0, width, height);
            break;
        case 'b':
        case 'B':
            background(0);
            break;
        case '1':
            clearBG();
            break;
        case 'l':
        case 'L':
        case '2':
            noStroke();
            fill(0);
            rect(width / 2, 0, width, height);
            break;
        case '3':
        case 'r':
        case 'R':
            noStroke();
            fill(0);
            rect(0, 0, width/2, height);
            break;
        case '4':
            lines();
            break;
        case '5':
            squares();
            break;
        case '6':
            invaders();
            // singleInvader.display();
            break;
        case '7':
            gridOfInvaders();
            break;
        case '8':
            travel();
            break;
        case '9':
            background(255);
            drawFlockBlocks();
            break;
        case 'f':
        case 'F':
            background(0);
            drawFlowfield();
            break;
        case 'a':
        case 'A':
            drawAttractorsParticles();
            break;
        case 'g':
        case 'G':
            shrinkingGrid();
            break;
        case 'c':
        case 'C':
            // barCode(pos, code);
            // animateBarCodes(); // todo

            singleBarCode.show();
            // singleBarCode.update();

            // arrayOfBarCodes[0].show();
            // arrayOfBarCodes[0].update();
            // arrayOfBarCodes[1].show();
            // push();
            // translate(width/2+height/2, 0);
            // rotate(HALF_PI);
            // arrayOfBarCodes[0].show();
            // pop();



            // scrollIncrement[1] = -2;
            // push();
            // translate(scrollBarCodes[1]+2, 0);
            // barCodeVector.mult(0);
            // for (var i = 0; i < phrase.length; i++) {
            //     var char = phrase[i];
            //     barCode(barCodeVector, dict[char]);
            //     barCodeVector.x += (charWidth * barCodeScale + narrowSpace);
            // }
            // pop();
            // scrollBarCodes[1] += scrollIncrement[1];
            break;
        case 'v':
        case 'V':
            singleBarCode.show();
            break;
        case 's':
        case 'S':

            for (var i = 0; i < arrayOfBarCodes.length; i++) {
                arrayOfBarCodes[i].show();
                arrayOfBarCodes[i].update();
            }

            // scrollIncrement[1] = -4;
            // push();
            // translate(barHeights + scrollBarCodes[1], height / 4);
            // barCodeVector.mult(0);
            // for (var i = 0; i < phrase.length; i++) {
            //     var char = phrase[i];
            //     barCode(barCodeVector, dict[char]);
            //     barCodeVector.x += (charWidth * barCodeScale + narrowSpace);
            // }
            // pop();
            // scrollBarCodes[1] += scrollIncrement[1];

            // fill(255);
            // noStroke();
            // rect(0, 0, barHeights, height);
            // push();
            // // translate(scrollBarCodes, height / 4);
            // translate(barHeights, scrollBarCodes[0]);
            // rotate(HALF_PI);
            // barCodeVector.mult(0);
            // for (var i = 0; i < phrase.length; i++) {
            //     var char = phrase[i];
            //     barCode(barCodeVector, dict[char]);
            //     barCodeVector.x += (charWidth * barCodeScale + narrowSpace);
            // }
            // pop();
            // scrollBarCodes[0] += scrollIncrement[0];
            break;
        // default:
            // clearBG();
    }

    // global fade out
    if (globalFade) {
        if (globalAlpha < 255) globalAlpha += 0.5;
        else globalFade = 255;
        noStroke();
        fill(0, globalAlpha);
        rect(0, 0, width, height);
    }
}

function keyPressed() {
    // TODO
    if (takeKeyInput) {
        if (key !== 'O') {
            console.log("key: " + key);
            motive = key;
            singleInvader.genGrid();
            if (key === 'V')
                singleBarCode.variableHeight = true;
            else
                singleBarCode.variableHeight = false;
        } else if (key === 'O') {
            globalFade = true;
        }
        // loop();
    }
}

// function buttonAction() {
//     // everything that needs to happen when you press start
//     console.log("STARTED");
//     wrapper.remove();
//     play = true;

//     noSleep.enable();

//     // Subscribe
//     pubnub.addListener({
//         message: function (m) {
//             handleMessage(m);
//         },
//         presence: function (p) {
//             console.log("occupancy: " + p.occupancy);
//         }
//     });
//     pubnub.subscribe({
//         channels: ['JeremyMuller_Blackwater'],
//         withPresence: true
//     });
// }

function animateBarCodes(x, y, rot) {
    push();
    // translate(scrollBarCodes, height / 4);
    translate(x, y);
    rotate(rot);
    fill(255, 0, 0);
    ellipse(0, 0, 50, 50);
    barCodeVector.mult(0);
    for (var i = 0; i < phrase.length; i++) {
        var char = phrase[i];
        barCode(barCodeVector, dict[char]);
        barCodeVector.x += (charWidth * barCodeScale + narrowSpace);
    }
    pop();
    scrollBarCodes[0] -= 2;
}

// TODO: put this in its own class in order to make grids of barcodes
function barCode(pos, code) {
    var xpos = 0;
    push();
    translate(pos.x, pos.y);
    noStroke();
    fill(0);
    for (var i = 0; i < code.length; i++) {
        if (code[i] === '0') {
            xpos += (narrowSpace * barCodeScale);
        } else if (code[i] === '1') {
            var r = random(10); // use maybe?
            rect(xpos, 0, narrowBar * barCodeScale, barHeights);
            xpos += (narrowBar * barCodeScale);
        } else if (code[i] === '2') {
            var r = random(10);
            rect(xpos, 0, wideBar * barCodeScale, barHeights);
            xpos += (wideBar * barCodeScale);
        } else if (code[i] === '3') {
            xpos += (wideSpace * barCodeScale);
        }
    }
    pop();
}

function clearBG() {
    background(255);
    // noStroke();
    // fill(255);
    // rect(0, 0, width, height);
}

function travel() {
    background(0);


    for (var i = 0; i < travelers.length; i++) {
        // for (var j = 0; j < travelers.length; j++) {
        //     if (i != j) {
        //         var force = travelers[j].repel(travelers[i]);
        //         // travelers[i].applyForce(-force);
        //     }
        // }
        // var force = createVector(1, 0);
        // travelers[i].applyForce(force);
        
        var maxDist = width * 0.5;
        console.log(maxDist);


        for (var j = i; j < travelers.length; j++) {
            var posA = travelers[i].pos.copy();
            var posB = travelers[j].pos.copy();
            var dist = p5.Vector.dist(posA, posB);
            if (dist < maxDist) {
                var alpha = map(dist, 0, maxDist, 200, 20);
                var thickness = map(dist, 0, maxDist, 6, 2);
                stroke(255, 255, 255, alpha);
                strokeWeight(thickness);
                line(travelers[i].pos.x, travelers[i].pos.y, travelers[j].pos.x, travelers[j].pos.y);
            }
        }
        // if (travelers[i].dropBlocks <= 0) {
        //     // var nextIndex = (i + 1) % travelers.length;
        //     for (var j = 0; j < travelers.length; j++) {
        //         if (j != i) {
        //             var posA = travelers[i].pos.copy();
        //             var posB = travelers[j].pos.copy();
        //             var dist = p5.Vector.dist(posA, posB);
        //             if (dist < 500) {
        //                 var alpha = map(dist, 0, 1400, 50, 10);
        //                 var thickness = map(dist, 0, 1400, 5, 1);
        //                 stroke(255, 255, 255, alpha);
        //                 strokeWeight(2);
        //                 line(travelers[i].pos.x, travelers[i].pos.y, travelers[j].pos.x, travelers[j].pos.y);
        //             }
        //
        //         }
        //     }
        // }
        var r = p5.Vector.random2D().mult(0.5);
        travelers[i].applyForce(r);
        travelers[i].update();
        travelers[i].show();
    }

    // for (var i = 0; i < travelers.length; i++) {
    //     travelers[i].update();
    //     travelers[i].show();
    // }
}

function lines() {
    stroke(0);
    strokeWeight(3);

    for (let i = 0; i < maxLines; i++) {
        var y = linesY[i];
        line(margin, y, width-margin, y);

        y += random(-0.5, 0.5);
        if (y >= height) y -= 2;
        if (y <= 0) y += 2;
        linesY[i] = y;
    }
}

function squares() {
    // TODO
    noStroke();
    fill(0);

    for (var i = 0; i < numOfBlocks; i++) {
        rect(blocks[i].x, blocks[i].y, cellSize, cellSize);
        if (random() < 0.001) {
            var r = random();
            if (r > 0.1) blocks[i].y += (cellSize*2); // 90% chance of drifting down screen
            // if (r < 0.25) blocks[i].x += cellSize;
            // else if (r > 0.25 && r < 0.5) blocks[i].x -= cellSize;
            // else if (r > 0.5 && r < 0.9) blocks[i].y += cellSize;
            // else blocks[i].y -= cellSize;
        }

        if (blocks[i].x <= 0) blocks[i].x = 0;
        if (blocks[i].x >= width) blocks[i].x = width;
        if (blocks[i].y <= 0) blocks[i].y = 0;
        if (blocks[i].y >= height) blocks[i].y = height / 2;
    }
}

function invaders() {

    singleInvader.display();

    // OLD!!
    // noLoop();

    // noStroke();
    // fill(0);

    // // noStroke();
    // // rectMode(CENTER);
    // push();
    // translate(width/4, 0);

    // for (let i = 0; i < cols; i++) {
    //     for (let j = 0; j < rows; j++) {
    //         pos[i][j] = createVector(invaderCellSize*i, invaderCellSize*j);
    //         grid[i][j] = false;
    //     }
    // }

    // // left half
    // for (let i = 0; i < cols; i++) {
    //     for (let j = 0; j < rows; j++) {
    //         if (i <= cols / 2) {
    //             if (random(100) < 50) {
    //                 rect(pos[i][j].x, pos[i][j].y, invaderCellSize, invaderCellSize);
    //                 grid[i][j] = true;
    //             }
    //         } else {
    //             if (grid[i % 2][j]) {
    //                 rect(pos[i][j].x, pos[i][j].y, invaderCellSize, invaderCellSize);
    //             }
    //         }
    //     }
    // }

    // noLoop();
    // pop();
}

function gridOfInvaders() {
    // TODO
    for (var i = 0; i < arrayOfInvaders.length; i++) {
        arrayOfInvaders[i].display();
        if (Math.random() < 0.001) arrayOfInvaders[i].genGrid(); // 0.1% chance of regenerating invader
    }
}

function drawFlockBlocks() {
    for (var y = 0; y < flockRows; y++) {
        for (var x = 0; x < flockCols; x++) {
            var west = null;
            var east = null;
            var north = null;
            var south = null;
            if (x > 0) west = flockBlocks[y][x - 1];
            if (x < flockCols - 1) east = flockBlocks[y][x + 1];
            if (y > 0) north = flockBlocks[y - 1][x];
            if (y < flockRows - 1) south = flockBlocks[y + 1][x];

            // corners
            var northwest = null;
            var northeast = null;
            var southwest = null;
            var southeast = null;
            if ((x > 0) && (y > 0)) northwest = flockBlocks[y - 1][x - 1];
            if ((x < flockCols - 1) && (y > 0)) northeast = flockBlocks[y - 1][x + 1];
            if ((y < flockRows - 1) && (x > 0)) southwest = flockBlocks[y + 1][x - 1];
            if ((y < flockRows - 1) && (x < flockCols - 1)) southeast = flockBlocks[y + 1][x + 1];

            //Block b[] = {west, east, north, south};
            var b = [west, east, north, south, northwest, northeast, southwest, southeast];

            flockBlocks[y][x].flock(b);

            flockBlocks[y][x].display();
            flockBlocks[y][x].update();
        }
    }

}

function drawAttractorsParticles() {
    background(0);

    if (Math.random() < 0.001) {
        attractorsArray[random([0, 1, 2, 3])].set(random(width), random(height));
    }

    attractorAlpha += alphaInc;
    if (attractorAlpha < 50 || attractorAlpha > 254) alphaInc *= -1;

    for (let i = 0; i < particlesArray.length; i++) {
        var particle = particlesArray[i];
        for (let j = 0; j < attractorsArray.length; j++) {
            particle.attracted(attractorsArray[j], j);
        }
        particle.update();
        particle.show();
    }

    for (let i = 0; i < attractorsArray.length; i++) {
        noStroke();
        fill(255, attractorAlpha);
        rect(attractorsArray[i].x - 5, attractorsArray[i].y - 5, 20, 20);
    }
}

// might not use this at all
function drawFlowfield() {
    var yoff = 1000;
    for (var y = 0; y < dotRows; y++) {
        var xoff = 0;
        for (var x = 0; x < dotCols; x++) {
            var index = x + y * dotCols;
            var angle = noise(xoff, yoff, zoff) * TWO_PI * 2.0;
            var v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            flowfield[index] = v;
            xoff += inc;
            // stroke(255, 150);
            stroke(255, 50);
            strokeWeight(1);
            // push();
            // translate(x * scl, y * scl);
            // rotate(v.heading());
            // line(0, 0, scl, 0);
            // pop();
        }
        yoff += inc;

        zoff += 0.0003;
    }

    for (var i = 0; i < dots.length; i++) {
        dots[i].follow(flowfield);
        dots[i].update();
        dots[i].edges();
        dots[i].show();
    }
}

// TODO
var resolution = 4;
// dotCols = floor(width / scl);
// dotRows = floor(height / scl);

// flowfield = new Array(dotCols * dotRows);
function shrinkingGrid() {
    background(255);
    var scl = height/2;
    var cols = ~~(width / scl);
    var rows = ~~(height / scl);
    noStroke();
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            if (x % 2 == 0) {
                fill(0);
            } else {
                fill(255);
            }

            rect(x*scl, y*scl, scl, scl);
        }
    }
}

function mousePressed() {
    fullscreen(true);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    if (fullscreen()) noCursor();
    else cursor();

    // reinitialize lines array
    for (let i = 0; i < maxLines; i++) {
        linesY[i] = random(height);
        // linesY[i] = { 'y': random(height), 'a': random(100, 255) };
    }

    // reinitialize blocks array
    for (var i = 0; i < numOfBlocks; i++) {
        var rx = Math.floor(random() * (width / cellSize));
        var ry = Math.floor(random() * (height / 2 / cellSize));
        blocks[i] = createVector(cellSize * rx, cellSize * ry);
    }

    // reinitialize invader cells
    invaderCellSize = width / 2 / rows;

    var i = 0;
    var gridCell = width / 20;
    for (var x = 0; x < width; x += gridCell) {
        for (var y = 0; y < height; y += gridCell) {
            var pos = createVector(x, y);
            arrayOfInvaders[i] = new Invader(pos, gridCell);
            arrayOfInvaders[i].genGrid();
            i++;
        }
    }

    // large single invader
    var c = height;
    var loc = createVector(width / 2 - c / 2, 0);
    singleInvader = new Invader(loc, c);
    singleInvader.genGrid();

    // reinitialize flockblocks
    var w = 20;
    flockCols = ~~(width / w);
    flockRows = ~~(height / w);

    flockBlocks = new Array(flockRows);
    for (var i = 0; i < flockRows; i++) {
        flockBlocks[i] = new Array(flockCols);
    }

    for (var y = 0; y < flockRows; y++) {
        for (var x = 0; x < flockCols; x++) {
            flockBlocks[y][x] = new Block(x * w, y * w, w);
        }
    }

    // reset flowfield
    dotCols = floor(width / scl);
    dotRows = floor(height / scl);

    flowfield = new Array(dotCols * dotRows);

    for (var i = 0; i < 10000; i++) {
        dots[i] = new Dot();
    }

    for (let i = 0; i < 2000; i++) {
        // particlesArray.push(new AttractorParticle(width/2, height/2));
        particlesArray[i] = new AttractorParticle(random(width), random(height));
    }

    attractorsArray[0] = createVector(width/4, height/4);
    attractorsArray[1] = createVector(width/4+width/2, height/4);
    attractorsArray[2] = createVector(width/4, height/4+height/2);
    attractorsArray[3] = createVector(width/4+width/2, height/4+height/2);
    // for (let i = 0; i < 4; i++) {
    //     attractorsArray[i] = createVector(random(width), random(height));
    // }

    barcodeCell = 175;
    barcodeCols = floor(width / barcodeCell);
    barcodeRows = floor(height / barcodeCell);
    barcodeColsOffset = (width - (barcodeCols*barcodeCell)) / 2; // offset to center grid

    for (var y = 0; y < barcodeRows; y++) {
        for (var x = 0; x < barcodeCols; x++) {
            var pos = createVector(x * barcodeCell + barcodeColsOffset, y * barcodeCell);
            var index = x + y * barcodeCols;
            var rotation = 0;
            if (Math.random() > 0.75) rotation = HALF_PI;
            arrayOfBarCodes[index] = new Barcode(pos, barcodeCell, barcodeCell, rotation);
        }
    }

    var bcPos = createVector(0, 0);
    singleBarCode = new Barcode(bcPos, width, height/2, 0);


    // Subscribe
    pubnub.addListener({
        message: function (m) {
            handleMessage(m);
        },
        presence: function (p) {
            console.log("occupancy: " + p.occupancy);
        }
    });
    pubnub.subscribe({
        channels: ['JeremyMuller_Blackwater_animation'],
        withPresence: true
    });
}

function handleMessage(m) {
    takeKeyInput = false;
    console.log("animation: " + m.message['animation']);
    if (m.message['animation'] === 'o') {
        globalFade = true;
    } else {
        motive = m.message['animation'];
        if (motive === '6') singleInvader.genGrid();
        else if (motive === 'v') singleBarCode.variableHeight = true;
    }
}

function cleanUp() {
    pubnub.unsubscribe({
        channels: ['JeremyMuller_Blackwater_animation']
    });
}
