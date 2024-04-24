import jlpt from '../src/jlpt.json' assert { type: 'json' }
import fs from 'node:fs'

function RNG(seed) {
    this.m = 0x80000000;
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}

RNG.prototype.nextFloat = function() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
}

function shuffle(array, rng) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor((rng ? rng.nextFloat() : Math.random()) * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function initShuffle(kanji) {
    const rng = new RNG(1);
    shuffle(kanji, rng);
    return kanji
}

initShuffle(jlpt.N5)
initShuffle(jlpt.N4)
initShuffle(jlpt.N3)
initShuffle(jlpt.N2)
fs.writeFileSync("jlpt_shuffle.json", JSON.stringify(jlpt, null, 2))