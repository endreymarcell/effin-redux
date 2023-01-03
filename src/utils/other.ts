import _ from "lodash";

export function dieUnlessTest(error: any) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(error);
  }
}

export function cloneDeep(object: any) {
  if ("structuredClone" in global) {
    return structuredClone(object);
  } else {
    return _.cloneDeep(object);
  }
}
