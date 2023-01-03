import _ from "lodash";

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
      return _.cloneDeep(object);
    }
  } catch (error) {
    return undefined;
  }
}
