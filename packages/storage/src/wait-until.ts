/**
 * Wait until returns true
 */
export function waitUntil(predicate: () => boolean | Promise<boolean>, time = 1): Promise<void> {
  return new Promise((resolve): void => {
    const interval = setInterval(async () => {
      if (await predicate()) {
        clearInterval(interval);
        resolve();
      }
    }, time);
  });
}
