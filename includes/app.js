//
// app.js
// by Jeremy Muller
// To be used in my piece "Blackwater" for snare drums and mobile devices
//

window.addEventListener("load", init);

// comment this out, this is for debugging on old iphones
// window.addEventListener("error", handleError, true);

// function handleError(evt) {
//     if (evt.message) { // Chrome sometimes provides this
//         alert("error: " + evt.message + " at linenumber: " + evt.lineno + " of file: " + evt.filename);
//     } else {
//         alert("error: " + evt.type + " from element: " + (evt.srcElement || evt.target));
//     }
// }


/************* variables *************/
var startButton, text, wrapper;

var play = false;

var colors = { "red": 0, "sky": 184, "blue": 249, "purple": 275 };

var backgroundHue = 0;
var backgroundSat = 100;
var backgroundLight = 0;
var light = 50;
var incr = 0.2;

var animate = false;

var noSleep = new NoSleep();
var pubnub, oneMeasure;

/****************** Musical Material ******************/
var pointDensity = 1; // TODO: playback rate doesn't seem to work as well, try pointDensity
var pointillistic = new Tone.Loop(function(time) {
    Tone.Draw.schedule(function (time) {
        setColor("random");
    }, time);
    noise1.bandpass.frequency.setValueAtTime(random(30, 15000), time);
    noise1.triggerAttackRelease(0.01, time);
    // bandpass.frequency.setValueAtTime(random(30, 15000), time);
    // noiseSynth1.triggerAttackRelease(0.01, time);
}, 0.1);
pointillistic.humanize = 0.1;

// var triangles = new Tone.Loop(function(time) {
//     var randTime = random(0.2, 0.32);
//     noise1.gain.setValueAtTime(0, Tone.now());
//     noise1.gain.linearRampToValueAtTime(40, time+randTime);    
//     noise1.bandpass.frequency.setValueAtTime(random(60, 10000), time);
//     noise1.bandpass.Q.setValueAtTime(50, Tone.now());
//     noise1.bandpass.Q.linearRampToValueAtTime(3, time+randTime);
//     noise1.triggerAttackRelease(randTime, time);



//     // gainSynth1.setValueAtTime(0, Tone.now());
//     // gainSynth1.linearRampToValueAtTime(40, time+randTime);    
//     // bandpass.frequency.setValueAtTime(random(60, 10000), time);
//     // bandpass.Q.setValueAtTime(50, Tone.now());
//     // bandpass.Q.linearRampToValueAtTime(3, time+randTime);
//     // noiseSynth1.triggerAttackRelease(randTime, time);
// }, 0.6);
// triangles.humanize = 0.2;

// THIS DOESN'T WORK!!!
// function Triangle() {
//     this.loop = false;    

//     this.start = function(time) {
//         this.loop = true;
//         this.update(time);
//     };

//     this.stop = function() {
//         this.loop = false;
//     };

//     this.update = function(time) {
//         console.log("loop? " + this.loop);
//         if (this.loop) {
//             var randTime = random(0.2, 0.32);
//             noise1.gain.setValueAtTime(0, Tone.now());
//             noise1.gain.linearRampToValueAtTime(40, time + randTime);
//             noise1.bandpass.frequency.setValueAtTime(random(60, 10000), time);
//             noise1.bandpass.Q.setValueAtTime(50, Tone.now());
//             noise1.bandpass.Q.linearRampToValueAtTime(3, time + randTime);
//             noise1.triggerAttackRelease(randTime, time);

//             var next = "+" + random(0.4, 0.8);
//             console.log("times: " + randTime + ", next: " + next);

//             Tone.Transport.schedule(this.update, next);
//         }
//         console.log("loop? " + this.loop);
//     }
// }

/***************** LOOPED CRESCENDO PATTERN *****************/
var loopTriangles = false;
function triangles(time) {
    if (loopTriangles) {
        var randTime = random(0.2, 0.75);
        noise1.gain.setValueAtTime(0, Tone.now());
        noise1.gain.linearRampToValueAtTime(40, time + randTime);
        noise1.bandpass.frequency.setValueAtTime(random(60, 10000), time);
        noise1.bandpass.Q.setValueAtTime(50, Tone.now());
        noise1.bandpass.Q.linearRampToValueAtTime(1, time + randTime);
        noise1.triggerAttackRelease(randTime, time);

        var next = "+" + (randTime + 0.4);
        // var next = time + (randTime + 0.2);
        console.log("times: " + randTime + ", next: " + next);

        Tone.Draw.schedule(function (time) {
            setColor("black");
        }, time);
        Tone.Draw.schedule(function (time) {
            setColor("white");
        }, time+randTime);
        Tone.Transport.schedule(triangles, next);
    }
}

function trianglesStart(time) {
    if (!loopTriangles) {
        loopTriangles = true;
        triangles(time);
    }
}

function trianglesStop() {
    loopTriangles = false;
}

/***************** LOOPED LFO PATTERN *****************/
var loopLFO = false;
var flutterProb = 0;
var lfoMax = 600;
function streamingLFO(time) {
    if (Math.random() < flutterProb) {
        noise4.bandpass.Q.setValueAtTime(5, time);
        noise4.bandpass.Q.linearRampToValueAtTime(50, '+8n');
        noise4.bandpass.frequency.setValueAtTime(random(500, 7500), time);
        noise4.triggerAttackRelease('8n', time);
        var next = "+" + 0.5;
        Tone.Transport.schedule(streamingLFO, next);
    } else if (loopLFO) {    
        var randTime = random(6.0, 8.0);
        var settings = getLFOValues(lfoMax);
        lfoMax += 100;
        noise5.setVibrato(settings[0], settings[1], settings[2]);
        noise5.triggerAttackRelease(randTime, time);
        var next = "+" + (randTime + 0.4);
        Tone.Transport.schedule(streamingLFO, next);
    }
}

function streamingLFOStart(time) {
    if (!loopLFO) {
        loopLFO = true;
        streamingLFO(time);
    }
}

function streamingLFOStop() {
    loopLFO = false;
    noise5.triggerRelease();
}

/***************** LOOPED FLUTTER PATTERN *****************/
var loopFlutter = false;
var srBuffer = 10000;
function flutter(time) {
    if (loopFlutter) {
        var randTime = random(0.5, 2.0);
        if (Math.random() > 0.0) {
            noise4.bandpass.Q.setValueAtTime(5, time);
            noise4.bandpass.Q.linearRampToValueAtTime(50, '+8n');
            noise4.bandpass.frequency.setValueAtTime(random(500, 7500), time);
            noise4.triggerAttackRelease('8n', time);
        } else { // is this part old?
            noiseCrushEnv.triggerAttackRelease(randTime-0.5, time);
            srBuffer -= 1000;
            if (srBuffer < 1000) srBuffer = 1000;
            genNoiseBuffer(srBuffer);
        }
        var next = "+" + (randTime + 0.4);
        Tone.Transport.schedule(flutter, next);
    }
}

function flutterStart(time) {
    if (!loopFlutter) {
        loopFlutter = true;
        flutter(time);
    }
}

function flutterStop() {
    loopFlutter = false;
}

/***************** LOOPED BARCODE PATTERN *****************/
var barcode1 = [[0, 0], [1, 0], [1, 1], [1, 0], [0, 0], [1, 1], [0, 0], [1, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 0], [0, 0], [1, 1], [0, 0], [0, 1], [0, 1], [1, 1], [0, 0], [0, 0], [0, 1], [0, 1], [0, 0], [1, 1], [0, 0], [0, 0], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 0], [1, 1], [1, 0], [0, 1], [0, 0], [0, 0]];
var barcode2 = [[0, 0], [0, 1], [1, 0], [0, 1], [0, 1], [0, 1], [1, 0], [0, 1], [0, 0], [0, 0], [1, 1], [1, 0], [0, 0], [1, 0], [0, 1], [0, 0], [0, 1], [0, 0], [1, 1], [0, 0], [0, 1], [1, 0], [0, 1], [0, 0], [0, 0], [0, 1], [0, 1], [0, 0], [0, 1], [1, 0], [0, 1], [0, 0], [0, 1], [1, 1], [0, 1], [0, 0], [0, 0], [1, 1], [0, 0], [0, 1], [1, 0], [0, 1], [1, 1], [0, 0], [0, 1], [0, 0], [0, 0], [0, 1], [1, 0], [1, 1], [0, 1], [0, 1], [0, 0], [0, 0], [0, 1], [0, 0]];
var barcode3 = [[0, 0], [0, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 1], [0, 1], [1, 1], [1, 0], [0, 1], [0, 0], [0, 1], [0, 1], [0, 1], [0, 1], [0, 0], [0, 1], [0, 1], [0, 0], [0, 0], [0, 1], [0, 0], [1, 0], [1, 1], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 0], [1, 1], [1, 0], [0, 1], [0, 0], [0, 0], [1, 0], [0, 1], [0, 1], [0, 0], [0, 0]];
var barcode4 = [[0, 0], [0, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 1], [0, 1], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 0], [0, 0], [1, 0], [0, 1], [0, 0]];
var barcode5 = [[0, 0], [1, 0], [0, 0], [1, 0], [0, 1], [0, 0], [0, 0], [0, 1], [1, 1], [1, 0], [1, 0], [1, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 0], [1, 1], [1, 0], [0, 1], [0, 0], [0, 0], [0, 1], [0, 0], [1, 0], [1, 1], [1, 0], [0, 0], [0, 1], [0, 0], [0, 0], [0, 0], [0, 1], [1, 0], [1, 1], [1, 0], [1, 0], [1, 0], [0, 1], [0, 1], [0, 0], [0, 1], [0, 1], [0, 1], [0, 0], [0, 1], [1, 1], [0, 0]];
var barcodeIndex = 0;
var loopBarCode = false;
var barcodeSpeed = 0.6;
var variableBarCodeSpeed = false;
function barCode(time) {
    if (loopBarCode) {
        // TODO
        var noteDur, spaceDur;
        // var noteDur = random([0.1, 0.2]);
        // var spaceDur = random([0.1, 0.2]);
        var bc = barcode1[barcodeIndex];
        noteDur = bc[0] === 0 ? 0.1 * barcodeSpeed : 0.2 * barcodeSpeed; // 0.1 0.2
        spaceDur = bc[1] === 0 ? 0.1 * barcodeSpeed : 0.2 * barcodeSpeed;

        Tone.Draw.schedule(function (time) {
            setColor("white");
        }, time);

        var randTime = noteDur + spaceDur;
        noiseCrushEnv.triggerAttackRelease(noteDur, time);
        var next = "+" + randTime;

        Tone.Draw.schedule(function (time) {
            setColor("grey");
        }, time+noteDur);

        barcodeIndex++;
        barcodeIndex %= barcode1.length;
        if (barcodeIndex === 0) console.log("looped");




        Tone.Transport.schedule(barCode, next);
    }
}

function barCodeStart(time) {
    if (!loopBarCode) {
        loopBarCode = true;
        barCode(time);
    }
}

function barCodeStop() {
    loopBarCode = false;
}

/***************** ACCELERANDO PATTERN *****************/
var loopAccel = false;
var repeatAccel = false;
var accelStartTime = 60 / 70.0;
var filterMaxMin = [600, 400];
function accelerando(time) {
    if (loopAccel) {
        // noise2.filter(9000, 300, time);
        noise2.filter(filterMaxMin[0], filterMaxMin[1], time);
        filterMaxMin[0] += 100;
        filterMaxMin[0] += 100;
        noise2.triggerAttackRelease(accelStartTime * 0.75, time);

        Tone.Draw.schedule(function (time) {
            setColor("white");
        }, time);

        Tone.Draw.schedule(function (time) {
            setColor("black");
        }, time+(accelStartTime*0.75));

        var next = "+" + accelStartTime;
        accelStartTime *= 0.9;
        if (accelStartTime < 0.05) {
            if (repeatAccel) {
                console.log("peak speed");
                accelStartTime = 60 / 70.0;
                filterMaxMin = [600, 400];
                var n = "+" + 0.5;
                Tone.Transport.schedule(accelerando, n);
            } else {
                accelStop();
            }
        } else {
            Tone.Transport.schedule(accelerando, next);
        }
    }
}

function accelStart(time) {
    if (!loopAccel) {
        loopAccel = true;
        accelerando(time);
    }
}

function accelStop() {
    loopAccel = false;
    accelStartTime = 60 / 70.0;
    filterMaxMin = [600, 400];
}

 
var motiveA = new Tone.Loop(function(time) {
    noise2.triggerAttackRelease("32n", time);
    // noiseSynth2.triggerAttackRelease("32n", time);
    Tone.Draw.schedule(function(time) {
        setColor("toggle");
        // if ((motiveA.index % 5) == 0) setColor(k);
    }, time);
}, "16n");

// TODO
var motiveB = new Tone.Loop(function (time) {
    Tone.Draw.schedule(function (time) {
        setColor("random");
    }, time);
    noise1.triggerAttackRelease(0.01, time);
    // noiseSynth1.triggerAttackRelease(0.01, time);
}, 0.1);
motiveB.humanize = 0.1;

/************** synths **************/

// var motiveAEnv = {
//     'envelope': {
//         'attack': 0.005,
//         'decay': 0.03,
//         'sustain': 1,
//         'release': 0.1,
//         "attackCurve": "linear",
//         "releaseCurve": "exponential"
//     }
// };

var softerEnv = {
    'envelope': {
        'attack': 0.005,
        'decay': 0.03,
        'sustain': 1,
        'release': 0.1,
        "attackCurve": "linear",
        "releaseCurve": "exponential"
    }
};

var pointyEnv = {
    'envelope' : {
        "attack": 0.001,
        "decay": 0.03,
        "sustain": 0.2,
        "release": 0.1,
        "attackCurve": "linear",
        "releaseCurve": "exponential"
    }
};

var barCodeEnv  = {
    'envelope': {
        "attack": 0.001,
        "decay": 0.001,
        "sustain": 0.1,
        "release": 0.01,
        "attackCurve": "linear",
        "releaseCurve": "exponential"
    }
};

function Noise1 (filter) {
    this.synth = new Tone.NoiseSynth();
    this.min = 200;
    this.max = 10000;
    this.counter = 0;
    this.mastergain = new Tone.Gain(1);
    
    if (filter == 0) {        
        this.bandpass = new Tone.Filter(7500, 'bandpass');
        this.gain = new Tone.Multiply(15); // 20
        this.synth.chain(this.bandpass, this.gain, this.mastergain, Tone.Master);
        this.bandpass.set({
            'Q': 3
        });

    } else if (filter == 1) {
        this.lop = new Tone.Filter(8000, "lowpass");
        this.hip = new Tone.Filter(7000, "highpass");
        this.synth.chain(this.lop, this.hip, this.mastergain, Tone.Master);
    }

    this.set = function(env) {
        this.synth.set(env);
    }

    this.start = function(time) {
        this.synth.start(time);
    }
    this.stop = function(time) {
        this.synth.stop(time);
    }
    this.triggerAttackRelease = function(dur, time) {
        this.synth.triggerAttackRelease(dur, time);
    }
    
    this.triggerRelease = function() {
        this.synth.triggerRelease();
    }

    this.filter = function(hiCut, lowCut, time) {
        this.lop.frequency.setValueAtTime(hiCut, time);
        this.hip.frequency.setValueAtTime(lowCut, time);
    }

    this.filterLinRamp = function(hiCut, lowCut, time) {
        var loF = this.lop.frequency.value;
        var hiF = this.hip.frequency.value;
        this.lop.frequency.setValueAtTime(loF, Tone.now());
        this.hip.frequency.setValueAtTime(hiF, Tone.now());
        this.lop.frequency.linearRampToValueAtTime(hiCut, time);
        this.hip.frequency.linearRampToValueAtTime(lowCut, time);
    }

    this.tremolo = function(freq, min, max) {
        // attaches to volume
        this.tremLFO = new Tone.LFO(freq, min, max);
        this.tremLFO.type = 'square';
        this.tremLFO.connect(this.synth.volume);
        this.tremLFO.start();
    }

    this.vibrato = function(freq, min, max) {
        // attaches to frequency
        this.vibLFO = new Tone.LFO(freq, min, max);
        this.vibLFO.connect(this.bandpass.frequency);
        this.vibLFO.start();
    }

    this.setVibrato = function(freq, min, max) {
        this.vibLFO.phase = 0;
        this.vibLFO.frequency.value = freq;
        this.vibLFO.min = min;
        this.vibLFO.max = max;
    }

    this.vibratoRandom = function() {
        this.randLFO = new Tone.Noise("brown");
        var norm = new Tone.Normalize(-1, 1);
        // this.randLFO.connect(this.norm);
        // var add = new Tone.Add(1);
        var scaling = new Tone.Scale(5000, 15000);
        // this.norm.connect(this.scaling);
        // playbackrate?
        // var meter = new Tone.Meter();
        // this.scaling.connect(meter);
        // this.scaling.connect(this.bandpass.frequency);
        
        this.randLFO.chain(norm, scaling, this.bandpass.frequency);
        // var amp = new Tone.Gain(20);
        // this.randLFO.chain(amp, this.bandpass.frequency);
        this.randLFO.start();
    }

    this.getMin = function() {
        return this.min;
    }

    this.getMax = function() {
        return this.max;
    }

    this.setRanges = function(min, max) {
        this.min = min;
        this.max = max;
    }
}

// class Noise1 {
//     constructor() {
//         this.synth = new Tone.NoiseSynth();
//         this.synth.set(pointyEnv);
//         this.bandpass = new Tone.Filter(7500, 'bandpass');
//         this.gain = new Tone.Multiply(20);
//         this.synth.chain(this.bandpass, this.gain, Tone.Master);

//         this.bandpass.set({
//             'Q' : 3
//         });
//     }

//     start(time) {
//         this.synth.start(time);
//     }

//     stop(time) {
//         this.synth.stop(time);
//     }

//     triggerAttackRelease(dur, time) {
//         this.synth.triggerAttackRelease(dur, time);
//     }
// }

var noise1 = new Noise1(0);
noise1.set(pointyEnv);
noise1.setRanges(11000, 15000);

var noise2 = new Noise1(1);
noise2.set(softerEnv);

var noise4 = new Noise1(0);
noise4.set(softerEnv);
noise4.bandpass.Q.value = 50;
noise4.tremolo(12, -500, 0);
// noise4.vibrato(0.75, 7000, 8000);
// noise4.vibratoRandom();

var noise5 = new Noise1(0);
noise5.set(softerEnv);
noise5.bandpass.Q.value = 50;
noise5.vibrato(0.75, 7000, 1000); // 200 500

// web audio api noise buffer
// var bitCrushBufferSize = 2 * Tone.context.sampleRate;
// var bitCrushBuffer = Tone.context.createBuffer(1, bitCrushBufferSize, Tone.context.sampleRate);
// var bitOutput = bitCrushBuffer.getChannelData(0);
// var bitCrushInterval = ~~(Tone.context.sampleRate/100);
// var randBitCrush = Math.random() * 2 - 1;
// for (var i = 0; i < bitCrushBufferSize; i++) {
//     bitOutput[i] = randBitCrush;
//     bitCrushInterval--;
//     if (bitCrushInterval < 0) {
//         randBitCrush = Math.random() * 2 - 1;
//         bitCrushInterval = 441;
//     }
// }

// web audio api noise buffer
var bitCrushBufferSize = 2 * Tone.context.sampleRate;
var bitCrushBuffer = Tone.context.createBuffer(1, bitCrushBufferSize, Tone.context.sampleRate);
function genNoiseBuffer(sr) { // arg is in freq
    var bitOutput = bitCrushBuffer.getChannelData(0);
    var interval = ~~(Tone.context.sampleRate / sr);
    console.log("interval: " + interval);
    
    var int = interval;
    var randBitCrush = Math.random() * 2 - 1;
    for (var i = 0; i < bitCrushBufferSize; i++) {
        bitOutput[i] = randBitCrush;
        interval--;
        if (interval < 0) {
            randBitCrush = Math.random() * 2 - 1;
            interval = int;
        }
    }
}

var noiseCrushEnv = new Tone.AmplitudeEnvelope(0.01, 0.01, 0.5, 0.0); // .toMaster();
noiseCrushEnv.releaseCurve = "exponential";
var noiseCrushGain = new Tone.Gain(0.5); // .connect(noiseCrushEnv);
genNoiseBuffer(10000);
var noiseCrush = new Tone.BufferSource(bitCrushBuffer, function () {
    console.log("noise crush buffer loaded");
}); // .connect(noiseCrushGain);
noiseCrush.loop = true;
var noiseCrushMult = new Tone.Multiply(1);
var noiseCrushLFO = new Tone.LFO(4, 0, 1);
noiseCrushLFO.type = 'square';
noiseCrushLFO.connect(noiseCrushMult);
noiseCrushLFO.start();
noiseCrush.start();
var noiseCrushLop = new Tone.Filter(15000, 'lowpass');
var noiseCrushHip = new Tone.Filter(100, 'highpass');
noiseCrush.chain(noiseCrushEnv, noiseCrushLop, noiseCrushHip, Tone.Master);

function openNoiseCrushFilter(time) {
    noiseCrushLop.frequency.setValueAtTime(15000, time);
    noiseCrushHip.frequency.setValueAtTime(100, time);    
}

function noiseCrushFilter(hiCut, lowCut, time) {
    noiseCrushLop.frequency.setValueAtTime(hiCut, time);
    noiseCrushHip.frequency.setValueAtTime(lowCut, time);
}

function noiseCrushFilterLinRamp(hiCut, lowCut, time) {
    var loF = noiseCrushLop.frequency.value;
    var hiF = noiseCrushHip.frequency.value;
    noiseCrushLop.frequency.setValueAtTime(loF, Tone.now());
    noiseCrushHip.frequency.setValueAtTime(hiF, Tone.now());
    noiseCrushLop.frequency.linearRampToValueAtTime(hiCut, time);
    noiseCrushHip.frequency.linearRampToValueAtTime(lowCut, time);
}

/***************** OLD SYNTHS!! REMOVE EVENTUALLY *****************/

var noiseSynth1 = new Tone.NoiseSynth();
noiseSynth1.set(pointyEnv);
var bandpass = new Tone.Filter(7500, 'bandpass');
var gainSynth1 = new Tone.Multiply(20);
noiseSynth1.chain(bandpass, gainSynth1, Tone.Master);
bandpass.set({
    'Q' : 3
});

var noiseSynth2 = new Tone.NoiseSynth();
noiseSynth2.set(softerEnv);
var lopSynth2 = new Tone.Filter(8000, "lowpass");
var hipSynth2 = new Tone.Filter(7000, "highpass").toMaster();
noiseSynth2.chain(lopSynth2, hipSynth2);
var noiseSynth2Filter = function(hiCut, lowCut, time) {
    lopSynth2.frequency.setValueAtTime(hiCut, time);
    hipSynth2.frequency.setValueAtTime(lowCut, time);

}; 

var noiseSynth2FilterLinRamp = function (hiCut, lowCut, time) {
    var loF = lopSynth2.frequency.value;
    var hiF = hipSynth2.frequency.value;
    lopSynth2.frequency.setValueAtTime(loF, Tone.now());
    hipSynth2.frequency.setValueAtTime(hiF, Tone.now());
    lopSynth2.frequency.linearRampToValueAtTime(hiCut, time);
    hipSynth2.frequency.linearRampToValueAtTime(lowCut, time);
};

var noiseSynth3 = new Tone.NoiseSynth();
noiseSynth3.set(softerEnv);
var lfo3 = new Tone.LFO("4n", 200, 3000);
var bandpass3 = new Tone.Filter(300, 'bandpass');
lfo3.connect(bandpass3.frequency);
var gainSynth3 = new Tone.Multiply(1);
noiseSynth3.chain(bandpass3, gainSynth3, Tone.Master);
lfo3.start();
bandpass3.set({
    'Q': 25
});


/***************** FIRE HISSING *****************/
// Works, but the problem is the noise algorithm. 
// The noise is a buffer (probably 1 second) so you can hear the pattern when used as an envelope

// web audio api 3 second noise buffer
var hissBufferSize = 3 * Tone.context.sampleRate;
var hissBuffer = Tone.context.createBuffer(1, hissBufferSize, Tone.context.sampleRate);
var hissOutput = hissBuffer.getChannelData(0);
for (var i = 0; i < hissBufferSize; i++) {
    hissOutput[i] = Math.random() * 2 - 1;
}
function genHissBuffer() {
    // regenerate every 3 beats to hide the pattern
    for (var i = 0; i < hissBufferSize; i++) {
        hissOutput[i] = Math.random() * 2 - 1;
    }   
}

var fireHissing = new Tone.BufferSource(hissBuffer, function () {
    console.log("buffer loaded");
});
fireHissing.loop = true;
// var fireHissing = new Tone.Noise();
var hip1000 = new Tone.Filter(1000, "highpass");

var lop1 = new Tone.Filter(1, "lowpass");
fireHissing.fan(hip1000, lop1); // noise source connected to both filters
var mult10 = new Tone.Multiply(10);
var pow4 = new Tone.Pow(4);
var mult500 = new Tone.Multiply(500);
lop1.chain(mult10, pow4, mult500);

var mult = new Tone.Multiply().toMaster();
hip1000.connect(mult, 0, 0);
mult500.connect(mult, 0, 1);

/***************** FIRE CRACKLING *****************/

var fireCrackling = new Tone.NoiseSynth().toMaster();
var crackleFilter = new Tone.Filter(2000, "bandpass").toMaster();
var crackle = new Tone.Envelope(0.0, 0.0, 0.0, 0.04);
fireCrackling.connect(crackleFilter);
var crackle = {
    'envelope': {
        "attack": 0.0,
        "decay": 0.0,
        "sustain": 0.0,
        "release": 0.1, // 0.04
        "attackCurve": "linear",
        "releaseCurve": "exponential"
    }
}
fireCrackling.set(crackle);
var fireCrackleLoop = new Tone.Loop(function(time) {
    crackleFilter.frequency.setValueAtTime(random(1500, 16500), time)
    fireCrackling.triggerAttackRelease(random(0.03), time);
}, 0.05);
fireCrackleLoop.humanize = 0.04;
fireCrackleLoop.probability = 0.3;

/***************** FIRE FLAMES *****************/
var flames = new Tone.Noise();
var flamesFilter = new Tone.Filter(30, "lowpass");
// var flamesFilter = new Tone.Filter(30, "bandpass").toMaster();
// flamesFilter.Q.value = 5;
var mult20 = new Tone.Multiply(15);
flames.connect(flamesFilter);
flames.chain(flamesFilter, mult20, Tone.Master);

var squareWithLFO = new Tone.Synth({
    "oscillator": {
        "type": "square",
        "volume": 3
    },
    "envelope": {
        "attack": 0.05, // 0.05
        "decay": 0.1,
        "sustain": 0.9,
        "release": 0.1
    }
}).toMaster();

var lfo = new Tone.LFO({
    "frequency": "16n",
    "type": "square",
    "min": -100,
    "max": 3
}).sync().start();
lfo.connect(squareWithLFO.oscillator.volume);

/*****************************/
/********* functions *********/
/*****************************/

function draw() {
    // TODO
    if (animate) requestAnimationFrame(draw);
    document.body.style.backgroundColor = "hsl(0, 0%, " + backgroundLight + "%)";
    backgroundLight += incr;

    // incr += 0.1;

    // if (backgroundLight > 100) {
    //     // incr = 3.0;
    //     backgroundLight = 0;
    // }
    

    if (backgroundLight > 75 || backgroundLight < 0) incr *= -1;

}

/**********************************/
function startDraw() {
    animate = true;
    draw();
}

function stopDraw() {
    animate = false;
    light = backgroundLight;
}


function buttonAction() {
    // everything that needs to happen when you press start
    console.log("STARTED");
    score();
    wrapper.remove();

    // /* Get the documentElement (<html>) to display the page in fullscreen */
    // var elem = document.documentElement;
    // /* View in fullscreen */
    // if (elem.requestFullscreen) {
    //     elem.requestFullscreen();
    // } else if (elem.mozRequestFullScreen) { /* Firefox */
    //     elem.mozRequestFullScreen();
    // } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    //     elem.webkitRequestFullscreen();
    // } else if (elem.msRequestFullscreen) { /* IE/Edge */
    //     elem.msRequestFullscreen();
    // }

    noSleep.enable();

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
        channels: ['JeremyMuller_Blackwater'],
        withPresence: true
    });
}

/************** helpers **************/

// function draw() {
// 	// this slowly animates background hue
// 	requestAnimationFrame(draw);
// 	document.body.style.backgroundColor = "hsl(" + backgroundHue + ", 100%, 50%)";
// 	if (play) backgroundHue += 0.1; backgroundHue % 360;
//
// 	// document.getElementsByTagName("p")[0].innerHTML = "audio context: " + Tone.now().toFixed(3);
//     // document.querySelector('p').textContent = Tone.now().toFixed(3);
//     var transport = Tone.Transport.seconds.toFixed(3);
//
//     // document.querySelector('span').textContent = "bars: " + Tone.Time(transport).toBarsBeatsSixteenths();
// }

function init() {
    StartAudioContext(Tone.context);
    // Tone.Master.volume.value = -500;
    Tone.Transport.bpm.value = 70;
    oneMeasure = 60 / Tone.Transport.bpm.value;
    
    // Tone.Transport.start("+0.1");

    setColor("init");
    // backgroundHue = random(hues);
    // if (backgroundHue == 275) {
    //     backgroundLight = 43;
    //     light = 43;
    // }
    // document.body.style.backgroundColor = "hsl(" + backgroundHue + ", 100%, 0%)";
    // document.body.style.backgroundColor = "hsl(" + backgroundHue + ", 100%, 100%)";
    // document.body.style.backgroundColor = "rgb(255, 0, 0)";

    // create button
    startButton = document.createElement("button");
    startButton.onclick = buttonAction;
    text = document.createTextNode("Tap to connect");
    startButton.appendChild(text);
    startButton.className = "splash";
    wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "container";
    wrapper.appendChild(startButton);
    document.body.appendChild(wrapper);

    var s = 3.45;
    console.log("" + s + " seconds to notation: " + Tone.Time(s).toNotation());
    console.log("" + s + " seconds to Bars:Beats:Sixteenths: " + Tone.Time(s).toBarsBeatsSixteenths());
    console.log("random: " + random([0, 1, 2, 3], 10));
    console.log("shuffle: " + shuffle([1, 2, 3, 4]));

    // Tone.Transport.on('start', score);

}

function cleanUp() {
    pubnub.unsubscribe({
        channels: ['JeremyMuller_Blackwater']
    });
}

function getLFOValues(m) {
    
    var lfosettings = [];
    lfosettings.push(random(0.1, 0.5)); // freq
    lfosettings.push(random(100, 300)); // min
    lfosettings.push(random(500, m)); // max value increases over time

    // if (Math.random() > 0.3) {
    //     // slow
    //     lfosettings.push(random(0.1, 0.5));
    //     switch(random([0,1,2])) {
    //         case 0:
    //             // wide
    //             lfosettings.push(random(100, 500)); // min
    //             lfosettings.push(random(5000, 6000)); // max
    //             break;
    //         case 1:
    //             // narrowhigh
    //             lfosettings.push(random(1000, 2000)); // min
    //             lfosettings.push(random(5000, 6000)); // max
    //             break;
    //         case 2:
    //             // narrowlow
    //             lfosettings.push(random(200, 300)); // min
    //             lfosettings.push(random(500, 600)); // max
    //             break;
    //     }
    // } else {
    //     // fast (only shallow depth can be fast)
    //     lfosettings.push(random(2, 4));
    //     if (Math.random() > 0.5) {
    //         // narrowhigh
    //         lfosettings.push(random(1000, 2000)); // min
    //         lfosettings.push(random(5000, 6000)); // max
    //     } else {
    //         // narrowlow
    //         lfosettings.push(random(200, 300)); // min
    //         lfosettings.push(random(500, 600)); // max
    //     }
    // }

    console.log("lfo settings: " + lfosettings);
    return lfosettings; // [freq, min, max]
}

function handleMessage(m) {
    console.log("start: " + m.message['start']);
    console.log("time: " + m.message['time']);

    if (m.message['start'] == false) Tone.Transport.stop();
    else {
        var mm = m.message['time'];
        // console.log("mm type: " + (typeof mm));
        if (Tone.Transport.state == "stopped") {
            Tone.Transport.start(Tone.now(), mm);
        } else {
            Tone.Transport.pause();
            Tone.Transport.start("+0.1", mm + 0.1);
            console.log("transport was paused and restarted");
        }
    }
}

function setColor(c) {
    //TODO!!!!! probably only be black and white
    stopDraw();
    if (c === "init") {
        document.body.style.backgroundColor = "hsl(0, 0%, " + backgroundLight + "%)";
    } else if (c === "toggle") {        
        if (backgroundLight > 50) backgroundLight = 0;
        else backgroundLight = 100;
    } else if (c === "black") {
        backgroundLight = 0;
    } else if (c === "white") {
        backgroundLight = 100;
    } else if (c === "grey") {
        backgroundLight = 50;
    } else if (c === "random") {
        backgroundLight = ~~(random(100));
    } else if (c === "cresc") {
        backgroundLight = 0;
        startDraw();
    }
    
    document.body.style.backgroundColor = "hsl(0, 0%, " + backgroundLight + "%)";



    // if (c === "init") {
    //     var keys = Object.keys(colors);
    //     hue = random(keys);
    //     if (hue === "purple") light = 43;
    //     backgroundLight = light;
    //     document.body.style.backgroundColor = "hsl(" + colors[hue] + ", 100%, 0%)";
    // } else if (c === "grey" || c === "gray") {
    //     document.body.style.backgroundColor = "hsl(" + colors[hue] + ", 100%, 10%)";
    // } else if (c === "black") {
    //     document.body.style.backgroundColor = "hsl(" + colors[hue] + ", 100%, 0%)";
    // } else if (c == null) {
    //     document.body.style.backgroundColor = "hsl(" + colors[hue] + ", 100%, " + light + "%)";
    // } else {
    //     document.body.style.backgroundColor = "hsl(" + colors[c] + ", 100%, " + light + "%)";
    // }
}

function stopPatterns() {
    // TODO: update this list
    pointillistic.stop();
    motiveA.stop();
    motiveB.stop();
    barCodeStop();
    flutterStop();
    trianglesStop();


    // TODO: reset patterns to index 0?
}

function score() {

    // THIS IS JUST FOR QUICK TESTING!!!
    // DELETE OR COMMENT OUT
    // Tone.Transport.scheduleOnce(function (time) {
    //     // noise5.triggerAttackRelease(10, time);
        
    //     // noiseCrush.start();
    //     // noiseCrushEnv.triggerAttackRelease(5, time);
    //     // noiseCrushLoop.start();
    //     // noiseCrushLoop.stop("+4n");

        
    //     // loopTri = true;
    //     // triLoop(time);
    //     // trianglesLoop.start(time);
    //     // trianglesStart(time);
    //     // pointillistic.start();
    //     // startDraw();
    //     // fireCrackling.start();
    //     // flames.start();
    //     // var r = random([0, 1, 2]);
    //     // console.log("r = " + r);
        
    

    //     // noise2.set(pointyEnv);
    //     // accelStart(time);

    //     // genNoiseBuffer(250);
    //     // noiseCrushEnv.triggerAttackRelease(3, time);
    //     // noiseCrushFilter(15000, 5000, time);
    //     // noiseCrushFilterLinRamp(15000, 100, time + 3);
    // }, "1m");
    // Tone.Transport.scheduleOnce(function (time) {
    //     accelStop();
    // }, "3:2");



    Tone.Transport.schedule(function (time) {
        noise2.filter(5000, 4000, time);
        // noiseSynth2Filter(5000, 4000, time);
        motiveA.start();
        // startDraw();
    }, "1m");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filter(5000, 4000, time);
        // noiseSynth2Filter(5000, 4000, time);
        motiveA.start();
    }, "2m");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(10000, 9000, "+2n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+2n+4n");
    }, "4:3");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filter(5000, 4000, time);
        // noiseSynth2Filter(5000, 4000, time);
    }, "8m");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filter(5000, 4000, time);
    }, "8:1");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(10000, 9000, "+1n+2n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+2n+4n");
    }, "11:1");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(5000, 4000, time);
        // noiseSynth2Filter(5000, 4000, time);
        pointillistic.start();
    }, "13m");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.stop();
        motiveA.start();
    }, "15:2");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(10000, 9000, "+1n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+4n");
    }, "19m");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(5000, 4000, "+1n+4n");
        // noiseSynth2FilterLinRamp(5000, 4000, "+1n+4n");
    }, "20:1");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(10000, 9000, "+1n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+4n");
    }, "22:3");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        pointillistic.start();
    }, "25m");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.stop();
        motiveA.start();
        noise2.filterLinRamp(10000, 9000, "+1n+1n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+1n");
    }, "26:3");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(9000, 300, time);
        // noiseSynth2Filter(9000, 300, time);
        pointillistic.start();
    }, "28:3");

    /************ 
     * This slows down because playbackRate 
     * doesn't have ramp capabilities 
     * ************/
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.6;
    }, "29m");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.5;
    }, "29:1");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.4;
    }, "29:2");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.3;
    }, "29:3");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.2;
    }, "30m");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.playbackRate = 0.1;
    }, "30:1");

    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.stop();
        pointillistic.playbackRate = 1;
        noise2.filter(9000, 300, time);
        motiveA.start();
    }, "30:2");
    Tone.Transport.scheduleOnce(function (time) {
        Tone.Draw.schedule(function (time) {
            setColor("grey");
        }, time);

        motiveA.stop();
        noise1.bandpass.frequency.value = random(30, 15000);
        noise1.bandpass.Q.setValueAtTime(25, time);

        var dur = oneMeasure * random(2.5, 3);
        
        noise1.triggerAttackRelease(dur);
        pointillistic.start("+" + dur);
    }, "32:2");
    Tone.Transport.scheduleOnce(function (time) {
        // TODO: CRESCENDO!!
        Tone.Draw.schedule(function (time) {
            setColor("grey");
        }, time);
        
        pointillistic.stop();
        var dur = oneMeasure * random(2.75, 3.75);

        noise1.triggerAttackRelease(dur);
        pointillistic.start("+" + dur);
        noise1.gain.setValueAtTime(0.5, time + dur);
    }, "34:2");
    Tone.Transport.scheduleOnce(function (time) {
        noise1.gain.setValueAtTime(0.5, time);
        noise1.gain.linearRampToValueAtTime(30, "+2n+4n");
        noise1.bandpass.Q.setValueAtTime(25, time);
        noise1.bandpass.Q.linearRampToValueAtTime(3, "+2n+4n");
    }, "35:1");
    Tone.Transport.scheduleOnce(function (time) {
        Tone.Draw.schedule(function (time) {
            setColor("cresc");
        }, time);
        pointillistic.stop();
        // triangles.start("+" + random(0.25));
        trianglesStart(time);
        noise2.filter(10000, 200, time);
        // noiseSynth2Filter(10000, 200, time);
    }, "36:2");
    Tone.Transport.scheduleOnce(function (time) {
        // triangles.stop();
        trianglesStop();
        noise1.bandpass.Q.setValueAtTime(3, time);
        noise1.gain.setValueAtTime(20, time);
        motiveA.start();
    }, "40m");
    Tone.Transport.scheduleOnce(function (time) {
        noise2.filterLinRamp(10000, 9000, "+1n+1n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+1n");
    }, "40:1");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        pointillistic.start();
    }, "44:1");
    Tone.Transport.scheduleOnce(function (time) {
        noise1.gain.setValueAtTime(20, time);
        noise1.gain.linearRampToValueAtTime(0.5, "+1n");
    }, "45m");
    if (random(100) > 50) { // 50% chance this happens
        Tone.Transport.scheduleOnce(function (time) {
            pointillistic.stop();
            noiseSynth3.triggerAttackRelease("1n+2n+4n");
            bandpass3.frequency.setValueAtTime(200, time);
            bandpass3.frequency.linearRampToValueAtTime(9000, time, "1n+2n+4n");
            gainSynth3.setValueAtTime(1, time);
            gainSynth3.linearRampToValueAtTime(20, "+1n+2n+4n");
        }, "46m");
        Tone.Transport.scheduleOnce(function (time) {
            
            pointillistic.start();
        }, "47:3");
    }
    Tone.Transport.scheduleOnce(function (time) {
        noise1.gain.setValueAtTime(0.5, time);
        noise1.gain.linearRampToValueAtTime(30, "+1n");
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
    }, "51m");
    Tone.Transport.scheduleOnce(function (time) {
        pointillistic.stop();
        noise1.gain.setValueAtTime(20, time);
        motiveA.start();
        noise2.filterLinRamp(10000, 9000, "+1n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n+4n");
    }, "52m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n+2n+4n");
    }, "53:1");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        motiveA.start();
        noise2.filterLinRamp(10000, 9000, "+1n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+1n");
    }, "55m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n+2n");
    }, "56m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        motiveA.start();
        noise2.filterLinRamp(10000, 9000, "+2n+4n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+2n+4n");
    }, "57:2");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n+4n");
    }, "58:1");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        motiveA.start();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        noise2.filterLinRamp(10000, 9000, "+2n");
        // noiseSynth2FilterLinRamp(10000, 9000, "+2n");
    }, "59:2");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noise2.filter(300, 200, time);
        // noiseSynth2Filter(300, 200, time);
        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
    }, "60m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        // triangles.start("+" + random(0.25));
        trianglesStart(time);
    }, "61m");
    Tone.Transport.scheduleOnce(function (time) {
        // triangles.stop();
        trianglesStop();
        if (random(100) > 50) {
            motiveA.start();
            noise2.filterLinRamp(10000, 9000, "+1n+1n+1n");
            // noiseSynth2FilterLinRamp(10000, 9000, "+1n+1n+1n");
        } else {
            motiveB.start();
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n+1n+1n");
        }
    }, "64m");

    if (Math.random() > 0.5) {
        Tone.Transport.scheduleOnce(function (time) {
            stopPatterns();
            motiveB.start();
            noise1.bandpass.Q.setValueAtTime(3, time);
            noise1.bandpass.Q.linearRampToValueAtTime(25, "+1n+1n");
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
            noise1.gain.setValueAtTime(20, time);
            noise1.gain.linearRampToValueAtTime(0, "+1n+1n+1n+1n+1n");
        }, "67m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
        }, "68m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
        }, "69m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
        }, "70m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n");
        }, "71m");
        Tone.Transport.scheduleOnce(function (time) {
            startDraw();
            
            stopPatterns();
            noise5.mastergain.gain.setValueAtTime(0.1, time);
            streamingLFOStart(time);
        }, "72m");
    } else {
        Tone.Transport.scheduleOnce(function (time) {
            startDraw();

            stopPatterns();
            noise5.mastergain.gain.setValueAtTime(0.1, time);
            streamingLFOStart(time);
        }, "67m");
    }
    
    // else {
    //     Tone.Transport.scheduleOnce(function (time) {
    //         stopPatterns();
    //         noise5.mastergain.gain.setValueAtTime(0.1, time);
    //     }, "67m");
    //     switch(random([0, 1, 2])) {
    //         case 0:
    //             Tone.Transport.scheduleRepeat(function (time) {
    //                 var settings = getLFOValues();
    //                 noise5.setVibrato(settings[0], settings[1], settings[2]);
    //                 noise5.triggerAttackRelease("2n+4n+8n", time);
    //             }, "1n", "67m", "1m");
    //             break;
    //         case 1:
    //             Tone.Transport.scheduleRepeat(function (time) {
    //                 var settings = getLFOValues();
    //                 noise5.setVibrato(settings[0], settings[1], settings[2]);
    //                 noise5.triggerAttackRelease("1n+8n", time);
    //             }, "1n+4n", "67m", "1m");
    //             break;
    //         case 2:
    //             Tone.Transport.scheduleRepeat(function (time) {
    //                 var settings = getLFOValues();
    //                 noise5.setVibrato(settings[0], settings[1], settings[2]);
    //                 noise5.triggerAttackRelease("1n+4n+8n", time);
    //             }, "1n+2n", "67m", "1m");
    //             break;
    //     }
    //     // Tone.Transport.scheduleOnce(function (time) {
    //     //     // TODO
    //     //     stopPatterns();
    //     //     noise5.setVibrato(random(0.1, 0.5), random(1000, 2000), random(9000, 11000)); // 200 500
    //     //     noise5.triggerAttackRelease("10m", time);
    //     // }, "67m");
    //     // Tone.Transport.scheduleOnce(function (time) {
    //     //     noise5.setVibrato(random(2, 4), random(400, 500), random(700, 800));
    //     // }, "68m");
        
    // }

    Tone.Transport.scheduleOnce(function (time) {
        flutterProb = 0.25;
    }, "80m");
    Tone.Transport.scheduleOnce(function (time) {
        flutterProb = 0.5;
    }, "87m");
    Tone.Transport.scheduleOnce(function (time) {
        flutterProb = 0.75;
    }, "91m");
    Tone.Transport.scheduleOnce(function (time) {
        stopDraw();

        streamingLFOStop();
        flutterStart(time);
    }, "95m");
    Tone.Transport.scheduleOnce(function (time) {
        flutterStop();
        genNoiseBuffer(10000);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "100m");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(8000);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "100:1");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(6000);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "100:2");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(4000);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "100:3");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(2000);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "101m");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(900);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "101:1");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(500);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "101:2");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(250);
        noiseCrushEnv.triggerAttackRelease("8n", time);
    }, "101:3");
    Tone.Transport.scheduleOnce(function (time) {
        genNoiseBuffer(100);
        noiseCrushEnv.triggerAttackRelease("2n+4n+8n", time);
    }, "102m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushEnv.attack = 0.01;
        noiseCrushEnv.decay = 0.008;
        noiseCrushEnv.sustain = 0.1;
        genNoiseBuffer(250);

        noiseCrushFilter(15000, 5000, time);
        barCodeStart(time);
    }, "103m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilterLinRamp(15000, 100, "+2m+2+4n");
    }, "106:1");
    Tone.Transport.scheduleOnce(function (time) {
        openNoiseCrushFilter(time);
        barCodeStop();

        noise2.filter(9000, 300, time);
        motiveA.start();
    }, "109m");
    // Tone.Transport.scheduleOnce(function (time) {
    //     motiveA.stop();
    // }, "109m+4n+8n");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        barCodeStart(time);
    }, "109:2");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilterLinRamp(15000, 5000, "+1m+2n");
    }, "110m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilterLinRamp(500, 100, "+2n");
    }, "112m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(15000, 5000, time);
    }, "112:2");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(10000, 1000, time);
    }, "113m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(500, 100, time);
    }, "113:1");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(15000, 5000, time);
    }, "113:3");
    Tone.Transport.scheduleOnce(function (time) {
        barCodeStop();
        noiseCrushFilter(10000, 500, time);

        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(10000, 9000), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(200, 300), "+2n+4n");
    }, "114m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        barCodeStart(time);
    }, "114:3");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(15000, 10000, time);
    }, "115:2");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(500, 100, time);
    }, "116m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(900, 500, time);
    }, "116:1");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(15000, 10000, time);
    }, "116:3");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(9000, 5000, time);
    }, "117m");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(500, 100, time);
    }, "117:1");
    Tone.Transport.scheduleOnce(function (time) {
        noiseCrushFilter(15000, 10000, time);
    }, "117:3");
    Tone.Transport.scheduleOnce(function (time) {
        barCodeStop();
        noiseCrushFilter(15000, 5000, time);
        noise2.filter(9000, 300, time);
        motiveA.start();
    }, "118m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveA.stop();
        noiseCrushFilterLinRamp(900, 1000, "+2m+2n");
        barCodeStart(time);
    }, "118:2");
    Tone.Transport.scheduleOnce(function (time) {
        barCodeStop();
        openNoiseCrushFilter(time);

        genNoiseBuffer(10000);

        motiveB.start();
        noise1.bandpass.frequency.setValueAtTime(random(10000, 9000), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(200, 300), "+2n+4n");
    }, "121m");
    Tone.Transport.scheduleOnce(function (time) {
        motiveB.stop();
        barCodeStart(time);
    }, "121:3");
    Tone.Transport.scheduleOnce(function (time) {
        barCodeStop();

        motiveB.start();
        noise1.bandpass.Q.setValueAtTime(40, time);
        noise1.bandpass.frequency.setValueAtTime(random(9000, 10000), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(200, 300), "+2n+4n");
    }, "125m");
    Tone.Transport.scheduleOnce(function (time) {
        // motiveB.stop();
        // flutterStart(time);

        noise1.bandpass.Q.setValueAtTime(40, time);
        noise1.bandpass.Q.linearRampToValueAtTime(1, "+1n+4n");
        // noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        // noise1.bandpass.frequency.linearRampToValueAtTime(random(9000, 10000), "+1n+2n");
        // motiveB.start();
    }, "125:3");
    Tone.Transport.scheduleOnce(function (time) {
        noise1.bandpass.Q.setValueAtTime(1, time);
        noise1.bandpass.Q.linearRampToValueAtTime(40, "+1n+1n");
        noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
        noise1.bandpass.frequency.linearRampToValueAtTime(random(9000, 10000), "+1n+1n");
        
        
        noise1.setRanges(200, 400); // ?????
    }, "127m");



    // later in the piece...
    // incorporate this in at measure 125 beat 4
    // Tone.Transport.scheduleOnce(function (time) {
    //     noise1.bandpass.Q.setValueAtTime(40, time);
    //     noise1.bandpass.Q.linearRampToValueAtTime(1, "+1n+1n");
    //     noise1.bandpass.frequency.setValueAtTime(random(200, 300), time); // TODO: set values
    //     noise1.bandpass.frequency.linearRampToValueAtTime(random(10000, 9000), "+1n+2n"); // TODO: set values
    //     motiveB.start();
    // }, "200m");
    // Tone.Transport.scheduleOnce(function (time) {
    //     noise1.bandpass.Q.setValueAtTime(1, time);
    //     noise1.bandpass.Q.linearRampToValueAtTime(25, "+1n+1n");
    //     noise1.setRanges(200, 400);
    // }, "202m");
    // Tone.Transport.scheduleOnce(function (time) {
    //     noise1.setRanges(11000, 15000);
    // }, "204m");


    if (Math.random() > 0.5) {
        Tone.Transport.scheduleOnce(function (time) {
            motiveB.stop();
            noise2.set(pointyEnv);
            openNoiseCrushFilter(time);
            barCodeStart(time);
        }, "129m");
    } else {
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.Q.setValueAtTime(40, time);
            noise1.bandpass.Q.linearRampToValueAtTime(1, "+1n+1n");
            noise1.bandpass.frequency.setValueAtTime(random(9000, 10000), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(200, 300), "+1n+1n");
        }, "129m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.Q.setValueAtTime(1, time);
            noise1.bandpass.Q.linearRampToValueAtTime(40, "+1n+1n");
            noise1.bandpass.frequency.setValueAtTime(random(200, 300), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(9000, 10000), "+1n+1n");
        }, "131m");
        Tone.Transport.scheduleOnce(function (time) {
            noise1.bandpass.Q.setValueAtTime(40, time);
            noise1.bandpass.Q.linearRampToValueAtTime(1, "+1n+1n+1n");
            noise1.bandpass.frequency.setValueAtTime(random(9000, 10000), time);
            noise1.bandpass.frequency.linearRampToValueAtTime(random(200, 300), "+1n+1n+1n");
        }, "133m");

        Tone.Transport.scheduleOnce(function (time) {
            barCodeStop();
            motiveB.stop();

            repeatAccel = true;
            var randTime = random(0.5, 1.5);
            accelStart(time + randTime);
        }, "136m");
        Tone.Transport.scheduleOnce(function (time) {
            accelStop();
            repeatAccel = false;
        }, "144:2");
    }
    Tone.Transport.scheduleOnce(function (time) {
        stopPatterns();
    }, "144:3");
    Tone.Transport.scheduleOnce(function (time) {
        repeatAccel = false;
        barCodeStop();
        accelStart(time);
    }, "145m");

    Tone.Transport.scheduleOnce(function (time) {
        startDraw();

        switch(random([0,1,2])) {
            case 0:
                fireHissing.start();
                break;
            case 1:
                fireCrackleLoop.start();
                break;
            case 2:
                flames.start();
                break;
        }
    }, "148m");
    Tone.Transport.scheduleRepeat(function (time) {
        genHissBuffer();
        console.log("regen");
    }, "2n+4n", "148:3", "17m+4n");

    Tone.Transport.scheduleOnce(function (time) {
        Tone.Draw.schedule(function (time) {
            setColor("black");
        }, time);
        Tone.Master.volume.setValueAtTime(0, time);
        Tone.Master.volume.linearRampToValueAtTime(-500, "+4m");
    }, "162m");

    Tone.Transport.schedule(function (time) {
        console.log("STOP!!");
        stopDraw();
        Tone.Draw.schedule(function (time) {
            setColor("black");
        }, time);
        Tone.Transport.stop(time + 0.1);
        // Tone.Master.volume.value = -500;
        // Tone.Master.volume.linearRampToValue(-500, "4m");
    }, "167m");
}