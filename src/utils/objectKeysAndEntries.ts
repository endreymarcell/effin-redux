/**
 * Type-safe wrappers around Object.keys() and Object.entries()
 *
 * In TypeScript, the return type of `Object.keys(object)` is always `string[]`, and not `keyof typeof object`.
 * Consider this code snippet:
 * ```
 * for (const key of Object.keys(object)) {
 *   console.log(object[key]);
 * }
 * ```
 * You would expect this to work without problems: you acquired `key` via `Object.keys()`, so `object[key]` should be fine.
 * Unfortunately, it isn't, because TS infers the type of `Object.keys()` as `string[]`.
 * Therefore `key` is `string`, so it's not safe to try to grab `object[key]`.
 * Use this helper instead of `Object.key()` to overcome this and get the proper return type.
 *
 * See also: https://github.com/Microsoft/TypeScript/issues/12870
 */

export function typedObjectKeys<Object extends { [key: string | number | symbol]: any } | null>(object: Object) {
  return !!object ? (Object.keys(object) as Array<keyof Object>) : [];
}

export function typedObjectEntries<Object extends { [key: string | number | symbol]: any } | null>(object: Object) {
  return !!object ? (Object.entries(object) as keyof Object extends never ? [] : Array<[keyof Object, any]>) : [];
}

export function typedObjectFromEntries<Entries extends readonly any[]>(entries: Entries) {
  type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
  type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
  type Cast<X, Y> = X extends Y ? X : Y;
  type FromEntries<T> = T extends [infer Key, any][]
    ? { [K in Cast<Key, string>]: Extract<ArrayElement<T>, [K, any]>[1] }
    : { [key in string]: any };
  type FromEntriesWithReadOnly<T> = FromEntries<DeepWriteable<T>>;

  return Object.fromEntries(entries) as FromEntriesWithReadOnly<Entries>;
}
