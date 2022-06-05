import { execSync } from "child_process";

// ========== CONSTANTS
const PLAY = process.env["PLAY"] || "play -q";
const TTS = process.env["TTS"] || "espeak -s 180 -l60";
const PAUSE = process.env["PAUSE"] || "sleep 0.2";
const PROTOCOL = "gemini://";
const SOUNDS = [ // Change the order to custmize output sounds.
  "./wav/beep-brightpop.aif",
  "./wav/beep-scrapy.aif",
  "./wav/beep-hightone.aif",
  "./wav/beep-shinymetal.aif",
  "./wav/beep-organ.aif",
  "./wav/beep-xylo.aif",
  "./wav/beep-attention.aif",
  "./wav/beep-holdtone.aif",
  "./wav/beep-metallic.aif",
  "./wav/beep-rejected.aif",
  "./wav/beep-warmguitar.aif",
  "./wav/beep-tapped.aif",
  "./wav/beep-piano.aif",
  "./wav/beep-glitchy.aif",
  "./wav/beep-roadblock.aif",
  "./wav/beep-bop.aif",
  "./wav/beep-timber.aif",
  "./wav/beep-reedy.aif",
  "./wav/beep-plucked.aif",
  "./wav/beep-horn.aif",
  "./wav/beep-sharpstring.aif",
  "./wav/beep-scratchy.aif",
];

// ====== AST / PARSER
// Fork of https://github.com/bctnry/gemtext
type Renderer<T> = {
  text(content: string): T,
  link(url: string, alt: string): T,
  preformatted(content: string[], alt: string): T,
  heading(level: number, text: string): T,
  unorderedList(content: string[]): T,
  quote(content: string): T,
}

enum GemText {
  Text = 1,
  Link = 2,
  Preformatted = 3,
  Heading = 4,
  List = 5,
  Quote = 6
}

type ParseResultData =
  | { _: GemText.Text, val: string }
  | { _: GemText.Link, url: string, alt: string }
  | { _: GemText.Preformatted, content: string[], alt: string }
  | { _: GemText.Heading, level: number, text: string }
  | { _: GemText.List, content: string[] }
  | { _: GemText.Quote, content: string };

class ParseResult {
  constructor(public data: ParseResultData[]) { }
  generate<T>(generator: Renderer<T>) {
    return this.data.map((v) => {
      switch (v._) {
        case GemText.Text: return generator.text(v.val);
        case GemText.Link: return generator.link(v.url, v.alt);
        case GemText.Preformatted: return generator.preformatted(v.content, v.alt);
        case GemText.Heading: return generator.heading(v.level, v.text);
        case GemText.List: return generator.unorderedList(v.content);
        case GemText.Quote: return generator.quote(v.content);
      }
    }).join('');
  }
}

// TODO: Refactor this code to be more readable, but only after
// there is a test suite.
function parse(source: string, strict: boolean = false): ParseResult {
  let res: ParseResultData[] = [];
  let preformatting: boolean = false;
  let preformattingAlt: string = '';
  let preformattingBuffer: string[] = [];
  let listStarted: boolean = false;
  let listBuffer: string[] = [];
  source.replace(/\r\n/g, '\n').split('\n').forEach((v) => {
    if (preformatting) {
      if (v.trim() === '```') {
        res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
        preformatting = false;
        preformattingBuffer = [];
        preformattingAlt = '';
        return;
      } else { preformattingBuffer.push(v); return; }
    }
    if (listStarted && !v.startsWith('* ')) {
      res.push({ _: 5, content: listBuffer });
      listStarted = false;
      listBuffer = [];
    }

    if ((strict && v.startsWith('=> ')) || (!strict && v.startsWith('=>'))) {
      let x = v.substring(2).trim();
      let i = 0; while (i < x.length && !' \t\r\n\v\b'.includes(x[i])) { i++; }
      let url = x.substring(0, i); x = x.substring(i).trim();
      res.push({ _: 2, url, alt: x });
    } else if ((strict && v.startsWith('> ')) || (!strict && v.startsWith('>'))) {
      res.push({ _: 6, content: v.substring(1).trim() });
    } else if (v.startsWith('#')) {
      let i = 0; while (v[i] == '#') { i++; }
      let level = i;
      if (strict) {
        if (' \t\r\n\v\b'.includes(v[i])) {
          res.push({ _: 4, level, text: v.substring(i).trim() });
        } else {
          res.push({ _: 1, val: v });
        }
      } else {
        res.push({ _: 4, level, text: v.substring(i).trim() });
      }
    } else if (v.startsWith('```')) {
      preformattingAlt = v.substring(3).trim();
      preformatting = true;
    } else if (v.startsWith('* ')) {
      if (!listStarted) { listStarted = true; listBuffer = []; }
      listBuffer.push(v.substring(2).trim());
    } else {
      res.push({ _: 1, val: v });
    }
  });
  if (preformattingBuffer.length > 0) {
    res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
  }
  if (listBuffer.length > 0) {
    res.push({ _: 5, content: listBuffer });
  }
  return new ParseResult(res);
}

// ======= CUSTOM AUDIO RENDERER

const play = (num: (typeof SOUNDS.length)) => {
  const file = SOUNDS[num];
  if (file) {
    execSync(`${PLAY} ${file} > /dev/null`);
    execSync(`${PLAY} ${file} > /dev/null`);
    execSync(PAUSE);
  } else {
    console.warn("Audio file note found: " + num);
  }
}

const say = (beep: number, text: string) => {
  play(beep);
  console.log(text);
  execSync(`${TTS} ${JSON.stringify(text)}`);
  execSync(PAUSE);
}

const SpeechRenderer: Renderer<void> = {
  text: (content: string): void => {
    // Skip carriage returns
    if (content.length) {
      say(2, content);
    }
  },
  link: (_url: string, alt: string): void => {
    say(3, "Link to " + alt);
  },
  preformatted: (_content: string[], alt: string): void => {
    say(4, "Text block " + alt);
  },
  heading: (level: number, text: string): void => {
    say(4 + level, text);
  },
  unorderedList: (content: string[]): void => {
    content.map(text => {
      say(11, text);
    });
  },
  quote: (content: string): void => {
    say(10, content);
  }
}

// ==== PLAYER / DOWNLOADER:

const url = process.argv.find(text => {
  if (text.startsWith(PROTOCOL)) {
    return text;
  }
});

if (!url) {
  console.error("Expected a URL starting with `gemini://`");
  process.exit(1);
}

const gemText = execSync(`npx gemini-fetch ${url}`, { encoding: 'utf-8' });
const ast = parse(gemText, true);
ast.generate(SpeechRenderer)
