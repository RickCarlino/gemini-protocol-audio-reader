import { say } from "./audio";
import { Renderer } from "./gemtext";

export const SpeechRenderer: Renderer<void> = {
    text: (content: string) => (content.length && say(0, content)),
    link: (_url: string, alt: string) => say(1, alt),
    preformatted: (_content: string[], alt: string) => say(2, "Block " + alt),
    unorderedList: (content: string[]) => content.map(text => say(3, text)),
    quote: (content: string) => say(4, content),
    heading: (level: number, text: string) => say(5 + level, text),
  }
  