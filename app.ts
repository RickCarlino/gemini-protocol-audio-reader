import { execSync } from "child_process";
import { parse } from "./gemtext";
import { SpeechRenderer } from "./speech-renderer";
import { sanitizeGeminiURL } from "./url";

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
