export function logVerbose(...args: any[]) {
  if (typeof window !== "undefined" && window.verbose) {
    console.log("[BRS Agent]", ...args);
  }
}