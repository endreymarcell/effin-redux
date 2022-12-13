export function dieUnlessTest(error: any) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(`Fatal error:`, error);
  }
}
