export function isReactNative(): boolean {
  return (
    typeof document === "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.product === "ReactNative"
  );
}

export function isNodeJs(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.versions !== "undefined" &&
    typeof process.versions.node !== "undefined"
  );
}

export function isBrowser(): boolean {
  return !isReactNative() && !isNodeJs();
}
