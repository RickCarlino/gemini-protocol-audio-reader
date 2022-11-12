// ====== AST / PARSER
// Fork of https://github.com/bctnry/gemtext
export type Renderer<T> = {
  text(content: string): T;
  link(url: string, alt: string): T;
  preformatted(content: string[], alt: string): T;
  heading(level: number, text: string): T;
  unorderedList(content: string[]): T;
  quote(content: string): T;
};

enum GemText {
  Text = 1,
  Link = 2,
  Preformatted = 3,
  Heading = 4,
  List = 5,
  Quote = 6,
}

type ParseResultData =
  | { _: GemText.Text; val: string }
  | { _: GemText.Link; url: string; alt: string }
  | { _: GemText.Preformatted; content: string[]; alt: string }
  | { _: GemText.Heading; level: number; text: string }
  | { _: GemText.List; content: string[] }
  | { _: GemText.Quote; content: string };

class ParseResult {
  constructor(public data: ParseResultData[]) {}
  generate<T>(generator: Renderer<T>) {
    return this.data
      .map((v) => {
        switch (v._) {
          case GemText.Text:
            return generator.text(v.val);
          case GemText.Link:
            return generator.link(v.url, v.alt);
          case GemText.Preformatted:
            return generator.preformatted(v.content, v.alt);
          case GemText.Heading:
            return generator.heading(v.level, v.text);
          case GemText.List:
            return generator.unorderedList(v.content);
          case GemText.Quote:
            return generator.quote(v.content);
        }
      })
      .join("");
  }
}

// TODO: Refactor this code to be more readable, but only after
// there is a test suite.
export function parse(source: string, strict: boolean = false): ParseResult {
  let res: ParseResultData[] = [];
  let preformatting: boolean = false;
  let preformattingAlt: string = "";
  let preformattingBuffer: string[] = [];
  let listStarted: boolean = false;
  let listBuffer: string[] = [];
  source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((v) => {
      if (preformatting) {
        if (v.trim() === "```") {
          res.push({
            _: 3,
            content: preformattingBuffer,
            alt: preformattingAlt,
          });
          preformatting = false;
          preformattingBuffer = [];
          preformattingAlt = "";
          return;
        } else {
          preformattingBuffer.push(v);
          return;
        }
      }
      if (listStarted && !v.startsWith("* ")) {
        res.push({ _: 5, content: listBuffer });
        listStarted = false;
        listBuffer = [];
      }

      if ((strict && v.startsWith("=> ")) || (!strict && v.startsWith("=>"))) {
        let x = v.substring(2).trim();
        let i = 0;
        while (i < x.length && !" \t\r\n\v\b".includes(x[i])) {
          i++;
        }
        let url = x.substring(0, i);
        x = x.substring(i).trim();
        res.push({ _: 2, url, alt: x });
      } else if (
        (strict && v.startsWith("> ")) ||
        (!strict && v.startsWith(">"))
      ) {
        res.push({ _: 6, content: v.substring(1).trim() });
      } else if (v.startsWith("#")) {
        let i = 0;
        while (v[i] == "#") {
          i++;
        }
        let level = i;
        if (strict) {
          if (" \t\r\n\v\b".includes(v[i])) {
            res.push({ _: 4, level, text: v.substring(i).trim() });
          } else {
            res.push({ _: 1, val: v });
          }
        } else {
          res.push({ _: 4, level, text: v.substring(i).trim() });
        }
      } else if (v.startsWith("```")) {
        preformattingAlt = v.substring(3).trim();
        preformatting = true;
      } else if (v.startsWith("* ")) {
        if (!listStarted) {
          listStarted = true;
          listBuffer = [];
        }
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
