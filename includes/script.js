//
// script.js
// by Jeremy Muller
// This is used to control the performer's clock
//

const WHITE = '1';
const BLACK = 'b';
const LEFT = 'l';
const RIGHT = 'r';
const LINES = '4';
const SQUARES = '5';
const INVADER = '6';
const INVADER_GRID = '7';
const TRAVELING_PARTICLES = '8';
const GREY_FLOCKING = '9';
const ATTRACTORS = 'a';
const BARCODE = 'c';
const VARIABLE_BARCODES = 'v';
const MULTIPLE_BARCODES = 's';
const FADEOUT = 'o';

var startButton, text, wrapper;

// var clock;
var start = false;
var mm_offset = 0;
var noSleep = new NoSleep();
var metIndex = 0; // I have to use this because transport time isn't always accurate enough
var clickOn = false;
var bars = 0;
var visualization;

var impulse = new Tone.NoiseSynth({
    "noise": {
        "type": "white"
    },
    "envelope": {
        "attack": 0.005,
        "decay": 0.1,
        "sustain": 0,
        "release": 0.1
    }
});

var filter = new Tone.Filter({
    "type": "bandpass",
    "frequency": 1000,
    "Q": 100,
    "gain": 0
}).toMaster();

var boost = new Tone.Multiply(10);
impulse.chain(filter, boost, Tone.Master);

var metronome = new Tone.Loop(function (time) {
    if (clickOn) {
        if (metIndex == 0) filter.frequency.value = 3000;
        else filter.frequency.value = 2000;
        impulse.triggerAttackRelease(0.1, time, 0.9);
    }
    metIndex = (metIndex + 1) % 4;
}, "4n");

var loopAccel = false;
var accelStartTime = 60 / 70.0;
function accelerando(time) {
    if (loopAccel) {
        publishAnimation(INVADER);
        var next = "+" + accelStartTime;
        accelStartTime *= 0.9;
        if (accelStartTime < 0.05) {
            accelStop();
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
}

function draw() {
    if (start) requestAnimationFrame(draw);

    // document.getElementsByTagName("p")[0].innerHTML = "audio context: " + Tone.now().toFixed(3);
    // document.querySelector('p').textContent = Tone.now().toFixed(3);


    // document.querySelector('span').textContent = "bars: " + Tone.Time(transport).toBarsBeatsSixteenths();

    var transport = Tone.Transport.seconds.toFixed(3);
    var time = Tone.Time(transport).toBarsBeatsSixteenths();
    var index1 = time.indexOf(':');
    var index2 = time.indexOf(':', index1 + 1);
    bars = time.slice(0, index1);
    var beat = time.slice(index1 + 1, index2);
    // console.log("beat: " + beat);

    var b = parseInt(bars);
    // document.getElementById("timer").innerHTML = ++b;
    document.getElementById("timer").innerHTML = b;
    // if (b < 100) {
    //     if (b < 10) {
    //         document.getElementById("timer").innerHTML = "00" + bars + beat;
    //     } else {
    //         document.getElementById("timer").innerHTML = "0" + bars + beat;
    //     }
    // } else {
    //     document.getElementById("timer").innerHTML = "" + bars + beat;
    // }

    var beats = document.getElementsByClassName("beat");
    for (var i = 0; i < beats.length; i++) {
        beats[i].style.opacity = 0;
    }
    // for (var b in beats) {
    //     // b.style.opacity = 0;
    //     // console.log("b: " + b);
    // }
    document.getElementById(beat).style.opacity = 1;
}

function buttonAction() {
    // wrapper.remove();
    wrapper.style.display = "none";
    document.getElementById("timer").style.display = "inline";
    document.getElementById("resetButton").style.display = "inline";

    noSleep.enable();

    // Tone.Transport.start(Tone.now(), mm_offset);
    start = true;
    publishIt(0+mm_offset);
    draw();
    conductor();
    metronome.start();
}

function init() {
    // create button
    startButton = document.createElement("button");
    startButton.onclick = buttonAction;
    text = document.createTextNode("Start");
    startButton.appendChild(text);
    startButton.className = "splash";
    startButton.id = "startButton";
    wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    // wrapper.id = "container";
    wrapper.appendChild(startButton);
    document.body.appendChild(wrapper);

    StartAudioContext(Tone.context);
    Tone.Transport.bpm.value = 70;

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
        withPresence: false
    });
}

function reset() {
    start = false;
    publishIt(0);
    metronome.stop();
    metIndex = 0;
    Tone.Transport.stop();
    Tone.Transport.bpm.value = 70;
    document.getElementById("resetButton").style.display = "none";
    wrapper.style.display = "inline";
    setTimeout(function () {
        document.getElementById("timer").innerHTML = "0";
        var beats = document.getElementsByClassName("beat");
        for (var i = 0; i < beats.length; i++) {
            beats[i].style.opacity = 0;
        }
    }, 100);
}

function conductor() {
    Tone.Transport.scheduleOnce(function (time) {
        // publishIt(Tone.TransportTime().toBarsBeatsSixteenths());
        var transport = Tone.Transport.seconds;
        var mm = Tone.Time(transport).toBarsBeatsSixteenths();
        console.log("measure 1: " + mm);
        console.log("measure 1 seconds: " + Tone.Transport.seconds);
        // publishIt(mm);
        // publishIt(mm);
        // visualization = LINES;

        publishAnimation()
        publishIt(Tone.Transport.seconds);
    }, "0m");

    Tone.Transport.scheduleOnce(function (time) {
        // publishIt(Tone.TransportTime().toBarsBeatsSixteenths());
        // visualization = LINES;
        publishAnimation(LEFT);
        publishIt(Tone.Transport.seconds);
        
        // var transport = Tone.Transport.seconds;
        // var mm = Tone.Time(transport).toBarsBeatsSixteenths();
        // publishIt(mm);
    }, "1m");
    // Tone.Transport.schedule(function (time) {
    //     // publishIt(Tone.TransportTime().toBarsBeatsSixteenths());
    //     var transport = Tone.Transport.seconds;
    //     var mm = Tone.Time(transport).toBarsBeatsSixteenths();
    //     console.log("measure 2: " + mm);
    //     publishIt(mm);
    // }, "2m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "13m");
    Tone.Transport.schedule(function (time) {
        publishIt(Tone.Transport.seconds);
        // publishIt(Tone.TransportTime().toBarsBeatsSixteenths());
    }, "13:3:2"); // measure 13, 4th beat, 8th note
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LEFT);
    }, "15:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "25m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LEFT);
    }, "26:3");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "28:3");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LEFT);
    }, "30:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LINES);
    }, "32:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(WHITE);
    }, "33:1");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LINES);
    }, "34:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "36:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(SQUARES);
    }, "40m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "52m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(SQUARES);
    }, "53:1");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "55m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LEFT);
    }, "56m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(RIGHT);
    }, "57:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(LEFT);
    }, "58:1");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(SQUARES);
    }, "59:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(WHITE);
        publishIt(Tone.Transport.seconds);
    }, "64m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(BLACK);
    }, "67m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(TRAVELING_PARTICLES);
    }, "71m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(ATTRACTORS);
    }, "86m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(BARCODE);
        publishIt(Tone.Transport.seconds);
    }, "103m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(BARCODE);
    }, "109:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(INVADER);
    }, "114m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(INVADER);
    }, "114:1");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(INVADER);
    }, "114:2");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(VARIABLE_BARCODES);
    }, "114:3");
    Tone.Transport.scheduleRepeat(function (time) {
        publishAnimation(INVADER);
    }, "8n", "118m", "2n");

    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(VARIABLE_BARCODES);
    }, "118:2");
    Tone.Transport.scheduleRepeat(function (time) {
        publishAnimation(INVADER);
    }, "8n", "121m", "2n+4n");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(MULTIPLE_BARCODES);
    }, "121:3");
    Tone.Transport.scheduleRepeat(function (time) {
        publishAnimation(INVADER);
    }, "8n", "125m", "2n+4n");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(INVADER_GRID);
    }, "125:3");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(MULTIPLE_BARCODES);
    }, "129m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(INVADER_GRID);
    }, "136m");
    Tone.Transport.scheduleOnce(function (time) {
        publishIt(Tone.Transport.seconds);
    }, "144m");
    Tone.Transport.scheduleOnce(function (time) {
        accelStart(time);
    }, "145m");
    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(GREY_FLOCKING);
    }, "148m");

    Tone.Transport.scheduleOnce(function (time) {
        publishAnimation(FADEOUT);
    }, "166m");
    Tone.Transport.scheduleOnce(function (time) {
        console.log("STOP!!");
        start = false;
        Tone.Transport.stop();
        publishIt(0);
    }, "167m");
}

function inputChanged() {
    var v = document.getElementsByName("mm_num")[0].value;
    if (v == "") v = '0';
    mm_offset = Tone.Time(v+"m").toSeconds();
    console.log("seconds: " + mm_offset);
    document.getElementById("timer").innerHTML = v;
}

function toggleClick() {
    clickOn = document.getElementById("beatClick").checked;
}

function publishIt(time) {

    // time test
    pubnub.time(function (status, response) {
        if (status.error) {
            // handle error if something went wrong based on the status object
        } else {
            console.log(response.timetoken);
        }
    });

    pubnub.publish({
        message: {
            // "number" : Math.floor(Math.random() * 360)
            "start": start,
            "time": time,
        },
        channel: 'JeremyMuller_Blackwater',
        storeInHistory: false
        },
        function (status, response) {
            if (status.error) {
                // handle error
                console.log(status)
            } else {
                // console.log("message published w/ server response: ", response);
                // console.log("message Published w/ timetoken", response.timetoken);
                console.log(response.timetoken);
            }
    });

    // pubnub.hereNow({
    //     channels: ['JeremyMuller_Blackwater'],
    //     includeUUIDs: true
    // },
    // function(status, response) {
    //     console.log(response);
    // });
}

function publishAnimation(anim) {
    pubnub.publish({
        message: {
            // "number" : Math.floor(Math.random() * 360)
            "animation": anim
        },
        channel: 'JeremyMuller_Blackwater_animation',
        storeInHistory: false
    },
        function (status, response) {
            if (status.error) {
                // handle error
                console.log(status)
            } else {
                // console.log("message published w/ server response: ", response);
                // console.log("message Published w/ timetoken", response.timetoken);
                console.log(response.timetoken);
            }
        });
}

function handleMessage(m) {
    // TODO
    if (m.message['start'] == false) {
        Tone.Transport.stop();
    } else {
        console.log("time: " + m.message['time']);
        var mm = m.message['time'];
        // Tone.Transport.start(Tone.now(), mm);
    
        if (Tone.Transport.state == "stopped") {
            Tone.Transport.start(Tone.now(), mm);
        } else {
            Tone.Transport.pause();
            Tone.Transport.start("+0.1", mm + 0.1);
            console.log("transport was paused and restarted");
        }
    }

}

window.addEventListener("load", init);
