const HTTP_REGEX = "^https?:";

const WS_REGEX = "^wss?:";

function matchRegexProtocol(url: string, regex: string) {
  return new RegExp(regex).test(new URL(url).protocol);
}

export function isHttpUrl(url: string) {
  return matchRegexProtocol(url, HTTP_REGEX);
}

export function isWsUrl(url: string) {
  return matchRegexProtocol(url, WS_REGEX);
}

export function isLocalhostUrl(url: string) {
  return new RegExp("wss?://localhost(:d{2,5})?").test(url);
}
