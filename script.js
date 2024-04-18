/*
Copyright (c) PuruSidDev 2023-2024
SPDX-License-Identifier: AGPL-3.0-or-later
*/

const AudioContext = window.AudioContext || window.webkitAudioContext;
let ac;

let audioBuffers = {};
let audioBufferNodes = {};

let pad;

function play(effect) {
    audioBufferNodes[effect].start(0);
    regenerateBuffer(effect);
}

function loadJSONConfig(json) {
    ac = new AudioContext();
    audioBuffers = {};
    pad = document.querySelector('.pad');
    pad.innerHTML = null;
    let buttonsPerRow = 4;
    if (parseInt(json["buttons-per-row"])) buttonsPerRow = parseInt(json["buttons-per-row"]);
    pad.style.gridTemplateColumns = `${100 / buttonsPerRow}% `.repeat(buttonsPerRow);
    Object.keys(json.audio).forEach(name => {
        fetch(json.audio[name]).then(res => res.arrayBuffer()).then(buffer => ac.decodeAudioData(buffer)).then(buffer => {
            audioBuffers[name] = buffer;
            let src = ac.createBufferSource();
            src.buffer = audioBuffers[name];
            src.connect(ac.destination);
            audioBufferNodes[name] = src;
        });
    });
    Object.keys(json["button-map"]).forEach(name => {
        let btn = document.createElement("button");
        btn.innerHTML = name;
        console.log("ontouchstart");
        if (document.body.ontouchstart) {
            btn.addEventListener("touchstart", () => {
                play(json["button-map"][name]);
            });
        }
        else {
            btn.addEventListener("mousedown", () => {
                play(json["button-map"][name]);
            });
        }
        pad.appendChild(btn);
    });
    document.addEventListener('keydown', e => {
        console.log(e);
        if (json["keyboard-map"][e.code]) play(json["keyboard-map"][e.code]);
    });
}

function regenerateBuffer(effect) {
    let src = ac.createBufferSource();
    src.buffer = audioBuffers[effect];
    src.connect(ac.destination);
    audioBufferNodes[effect] = src;
}

window.addEventListener("error", (err) => alert(err.message));

document.addEventListener('DOMContentLoaded', () => {
    fetch('config.json')
        .then(response => {
            return response.json();
        })
        .then(json => {
            loadJSONConfig(json);
        });
});