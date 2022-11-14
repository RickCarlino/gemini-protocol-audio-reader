import { execSync } from "child_process";
// ======= CUSTOM AUDIO RENDERER
const PLAY = process.env["PLAY"] || "play -q";
const TTS = process.env["TTS"] || "espeak -s 180 -l60";
const PAUSE = process.env["PAUSE"] || "sleep 0.2";
const SOUNDS = [ // Change the order to custmize output sounds.
  "./wav/beep-brightpop.aif",
  "./wav/beep-hightone.aif",
  "./wav/beep-holdtone.aif",
  "./wav/beep-horn.aif",
  "./wav/beep-piano.aif",
  "./wav/beep-plucked.aif",
  "./wav/beep-roadblock.aif",
  "./wav/beep-scrapy.aif",
  "./wav/beep-sharpstring.aif",
  "./wav/beep-timber.aif",
  "./wav/beep-warmguitar.aif",
  "./wav/beep-xylo.aif",
];

export const play = (num: (typeof SOUNDS.length)) => {
  const file = SOUNDS[num];
  if (file) {
    execSync(`${PLAY} ${file} > /dev/null`);
    execSync(`${PLAY} ${file} > /dev/null`);
    execSync(PAUSE);
  } else {
    console.warn("Audio file not found: " + num);
  }
}

export const say = (beep: number, text: string) => {
  play(beep);
  console.log(text);
  execSync(`${TTS} ${JSON.stringify(text)}`);
  execSync(PAUSE);
}

