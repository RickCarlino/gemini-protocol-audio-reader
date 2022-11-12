import { parse, Renderer } from "./gemtext";
import { say } from "./audio";
import { execSync } from "child_process";
import { sanitizeGeminiURL } from "./url";

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

const rawURL = process.argv.find(text => {
  if (text.includes("gemini:")) {
    return text;
  }
});

if (!rawURL) {
  console.error("Expected a URL starting with `gemini://`");
  process.exit(1);
}
const url = sanitizeGeminiURL(rawURL);

const gemText = execSync(`npx gemini-fetch ${url}`, { encoding: 'utf-8' });
const ast = parse(gemText, true);
ast.generate(SpeechRenderer)
