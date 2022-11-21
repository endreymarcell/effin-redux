import { describe, test, expect, expectTypeOf } from "vitest";
import { typedObjectEntries, typedObjectFromEntries, typedObjectKeys } from "./objectKeysAndEntries";

describe("typedObjectKeys", () => {
  test("empty object", () => {
    const input = {};
    const result = typedObjectKeys(input);
    expectTypeOf(result).toMatchTypeOf([]);
    expect(result).toEqual(Object.keys(input));
  });

  test("object with a single key", () => {
    const input = { foo: "bar" };
    const result = typedObjectKeys(input);
    expectTypeOf(result).toMatchTypeOf<"foo"[]>();
    expect(result).toEqual(Object.keys(input));
  });

  test("object with multiple keys", () => {
    const input = { name: "Fred", age: 32 };
    const result = typedObjectKeys(input);
    expectTypeOf(result).toMatchTypeOf<("name" | "age")[]>();
    expect(result).toEqual(Object.keys(input));
  });
});

describe("typedObjectEntries", () => {
  test("empty object", () => {
    const input = {};
    const result = typedObjectEntries(input);
    expectTypeOf(result).toMatchTypeOf([]);
    expect(result).toEqual(Object.entries(input));
  });

  test("object with a single key", () => {
    const input = { foo: "bar" };
    const result = typedObjectEntries(input);
    expectTypeOf(result).toMatchTypeOf([["foo", "bar"]]);
    expect(result).toEqual(Object.entries(input));
  });

  test("object with multiple keys", () => {
    const input = { name: "Fred", age: 32 };
    const result = typedObjectEntries(input);
    expectTypeOf(result).toMatchTypeOf([
      ["name", "Fred"],
      ["age", 32],
    ]);
    expect(result).toEqual(Object.entries(input));
  });
});

describe("typedObjectFromEntries", () => {
  describe("with type annotations", () => {
    test("no entries", () => {
      const input: any[] = [];
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf({});
      expect(result).toMatchObject(Object.fromEntries(input));
    });

    test("single entry", () => {
      const input: [["foo", string]] = [["foo", "bar"]];
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf<{ foo: string }>();
      expect(result).toMatchObject(Object.fromEntries(input));
    });

    test("multiple entries", () => {
      const input: [["name", string], ["age", number]] = [
        ["name", "Fred"],
        ["age", 32],
      ];
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf<{ name: string; age: number }>();
      expect(result).toMatchObject(Object.fromEntries(input));
    });
  });

  describe("without type annotations (only with 'as const')", () => {
    test("no entries", () => {
      const input = [] as const;
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf({});
      expect(result).toMatchObject(Object.fromEntries(input));
    });

    test("single entry", () => {
      const input = [["foo", "bar"] as const];
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf<{ foo: string }>();
      expectTypeOf(result.foo).not.toBeAny();
      expectTypeOf(result.foo).toBeString();
      expect(result).toMatchObject(Object.fromEntries(input));
    });

    test("multiple entries", () => {
      const input = [["name", "Fred"] as const, ["age", 32] as const];
      const result = typedObjectFromEntries(input);
      expectTypeOf(result).toMatchTypeOf<{ name: string; age: number }>();
      expectTypeOf(result.name).not.toBeAny();
      expectTypeOf(result.name).toBeString();
      expectTypeOf(result.age).not.toBeAny();
      expectTypeOf(result.age).toBeNumber();
      expect(result).toMatchObject(Object.fromEntries(input));
    });
  });
});
