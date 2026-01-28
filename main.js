var audioCtx;
var waveformType = 'sine';

const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
}

var globalGain;

const MAX_VOICES = 8;
const VOICE_GAIN = 1 / MAX_VOICES;

document.addEventListener("DOMContentLoaded", function (event) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        globalGain = audioCtx.createGain();
        globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        globalGain.connect(audioCtx.destination);
});

window.addEventListener('keydown', keyDown, false);
window.addEventListener('keyup', keyUp, false);

const activeOscillators = {}
const activeGainNodes = {}

function playNote(key) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        osc.type = waveformType;

        osc.connect(gainNode);
        gainNode.connect(globalGain);

        const now = audioCtx.currentTime;

        const attack = 0.05;
        const decay = 0.15;
        const sustain = 0.5 * VOICE_GAIN;

        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(0.0001, now);

        gainNode.gain.exponentialRampToValueAtTime(
                VOICE_GAIN,
                now + attack
        );
        gainNode.gain.exponentialRampToValueAtTime(
                sustain,
                now + attack + decay
        );

        osc.start();

        activeOscillators[key] = osc;
        activeGainNodes[key] = gainNode;
}

function stopNote(key) {
        const osc = activeOscillators[key];
        const gainNode = activeGainNodes[key];
        if (!osc || !gainNode) return;

        const now = audioCtx.currentTime;
        const releaseTime = 0.2;

        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setTargetAtTime(0.0001, now, releaseTime);

        osc.stop(now + releaseTime * 5);

        delete activeOscillators[key];
        delete activeGainNodes[key];
}

function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
                playNote(key);
        }
}

function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (!activeOscillators[key]) return;
        stopNote(key);
}

document.getElementById('audio-control').addEventListener('click', function () {
    if (waveformType === 'sine') {
        waveformType = 'sawtooth';
        document.getElementById('waveform-type').textContent = "Waveform: Sawtooth";
    } else {
        waveformType = 'sine';
        document.getElementById('waveform-type').textContent = "Waveform: Sine";
    }
}, false);