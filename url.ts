const GEMINI_ONLY =
  "This application only supports the `gemini:` protocol, not ";

function validateInput(input: URL) {
  const { protocol } = input;

  if (protocol && protocol !== "gemini:") {
    throw new Error(GEMINI_ONLY + protocol);
  }
}

function setDefaults(input: URL) {
  const { pathname, protocol } = input;

  if (!pathname) {
    input.pathname = "/";
  }

  if (!protocol) {
    input.protocol = "gemini:";
  }
}

export function sanitizeGeminiURL(url: string): string {
  const u = new URL(url);
  validateInput(u);
  setDefaults(u);
  return u.toString();
}
