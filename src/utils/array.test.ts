import { describe, test, expect, expectTypeOf } from "vitest";
import { typedFlatten } from "./arrays";

describe("typedFlatten", () => {
  test("empty array", () => {
    const input = [] as const;
    const result = typedFlatten(input);
    expectTypeOf(result).toMatchTypeOf<[]>();
    expect(result).toEqual([]);
  });

  test("flat array, same type", () => {
    const input = [6, 7, 10, 19] as const;
    const result = typedFlatten(input);
    expectTypeOf(result).toMatchTypeOf<readonly [6, 7, 10, 19]>();
    expect(result).toEqual(input);
  });

  test("flat array, different types", () => {
    const input = [5, "yay", false] as const;
    const result = typedFlatten(input);
    expectTypeOf(result).toMatchTypeOf<readonly [5, "yay", false]>();
    expect(result).toEqual(input);
  });

  test("nested array, same type", () => {
    const input = [5, [6, 7], 8, [9]] as const;
    const result = typedFlatten(input);
    expectTypeOf(result).toMatchTypeOf<readonly [5, 6, 7, 8, 9]>();
    expect(result).toEqual(input.flat());
  });

  test("nested array, different types", () => {
    const input = [5, ["yay", false], 6] as const;
    const result = typedFlatten(input);
    expectTypeOf(result).toMatchTypeOf<readonly [5, "yay", false, 6]>();
    expect(result).toEqual(input.flat());
  });
});
