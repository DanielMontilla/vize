import { describe, it, expect } from "vitest";
import { Some, isSome, Maybe, None } from "..";
import { flatmap } from "../scoped";

describe("flatmap [runtime]", () => {
  it("should return Some when input is Some and mapper returns Some", () => {
    const inner = 0;
    const some = Some(inner);
    const mapper = (x: number): Maybe<number> => Some(x);
    const value = flatmap(mapper)(some);

    expect(isSome(value)).toBe(true);
    expect(value).toHaveProperty("value", inner);
  });

  it("should return None when input is None and mapper returns None", () => {
    const none = None();
    const mapper = (_: number): Maybe<number> => None();
    const value = flatmap(mapper)(none);

    expect(isSome(value)).toBe(false);
  });

  it("should return None when input is None and mapper returns Some", () => {
    const none = None();
    const mapper = (x: number): Maybe<number> => Some(x);
    const value = flatmap(mapper)(none);

    expect(isSome(value)).toBe(false);
  });

  it("should return None when input is Some and mapper returns None", () => {
    const inner = 0;
    const some = Some(inner);
    const mapper = (_: number): Maybe<number> => None();
    const value = flatmap(mapper)(some);

    expect(isSome(value)).toBe(false);
  });
});
