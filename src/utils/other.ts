import { cloneDeep as cloneDeepLodash } from "lodash-es";

export function dieUnlessTest(error: any) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(error);
  }
}

export function cloneDeep(object: any) {
  try {
    if ("structuredClone" in globalThis) {
      return structuredClone(object);
    } else {
      return cloneDeepLodash(object);
    }
  } catch (error) {
    return undefined;
  }
}
