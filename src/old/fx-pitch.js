//@ts-check
///<reference lib="dom"/>

function delay(ms=0){
  return new Promise(r=>{setTimeout(r,ms)});
}

let didInit = false;

// Objects
const audioCtx = new AudioContext();
const out = audioCtx.destination;
const vco = audioCtx.createOscillator();
const vca = audioCtx.createGain();

/*
(vco)=>(vca)=>(out)
*/

function initSound() {
  if (didInit) return;
  didInit = true;
  vca.connect(out);
  vco.connect(vca);
  vco.start(audioCtx.currentTime);
  vco.type = "sine";
  vca.gain.value = 0;
  vco.frequency.value = 220;
}

async function soundOn(){
  initSound();
  vca.gain.value = 0.1;
  for (let x = -127; x < 128; x++) {
    const y = (((x**2)/15)+220);
    vco.frequency.value = y;
    await delay(10);
  }
  soundOff();
}

async function soundOff(){
  vca.gain.value = 0;
}
