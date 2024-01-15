import { Mapper, Predicate, EMPTY, Empty, Assertion } from "../..";

export abstract class Result<V = Empty, E = Empty> {
  /**
   * Extracts the `Ok` value directly.
   * @throws if the `Result` is `Err`.
   * @returns the `Ok` value.
   */
  abstract take(): V;

  /**
   * Extracts the `Err` value directly.
   * @throws if the `Result` is `Ok`.
   * @returns the `Err` value.
   */
  abstract takeErr(): E;

  /**
   * Checks if the `Result` is `Ok`.
   * @returns `true` if `Result` is `Ok`, otherwise `false`.
   */
  abstract isOk(): this is Ok<V>;

  /**
   * Checks if the `Result` is `Err`.
   * @returns `true` if `Result` is `Err`, otherwise `false`.
   */
  abstract isErr(): this is Err<E>;

  /**
   * Performs a side effect when `Result` is `Ok`.
   * @param effect The function to execute if `Result` is `Ok`.
   * @returns The original `Result`.
   */
  abstract onOk(effect: (value: V) => any): Result<V, E>;

  /**
   * Performs a side effect when `Result` is `Err`.
   * @param effect The function to execute if `Result` is `Err`.
   * @returns The original `Result`.
   */
  abstract onErr(effect: (error: E) => any): Result<V, E>;

  /**
   * If called on `Ok` instance; transforms inner value with provided mapper function. Otherwise remains `Err`.
   * @template To The type of the resulting `Ok` value after applying the mapper.
   * @param mapper A function that takes the `Ok` inner value and returns a new value.
   * @returns A `Result` with the transformed `Ok` value or the original `Err`.
   * @todo type tests
   */
  abstract map<To>(mapper: (value: V) => To): Result<To, E>;

  /**
   * Transforms the `Ok` value of the `Result` and unfolds the returned `Result`.
   * @template To The type of the `Ok` value in the new `Result`.
   * @template Ex The type of the `Err` value in the new `Result`.
   * @param {function(V): Result<To, Ex>} chain A function that takes the `Ok` value, transforms it, and returns a new `Result`.
   * @returns {Result<To, E | Ex>} If the original `Result` is `Ok`, returns the unfolded `Result` of the function. If the original or the new `Result` is `Err`, returns `Err`.
   * @see {@link Result.unfold}
   * @see {@link Result.map}
   * @todo type tests
   */
  abstract chain<To, Ex>(
    chain: (value: V) => Result<To, Ex>
  ): Result<To, E | Ex>;

  /**
   * Transforms the error in the `Result`. Similar to `.map` for errors
   * @template To The new error type.
   * @param {function(E): To} mapper A function applied to the error if the `Result` is an `Err`.
   * @returns {Result<V, To>} A `Result` with the original value or a transformed error.
   * @see {@link Result.map}
   * @todo type tests
   */
  abstract refine<To>(mapper: (error: E) => To): Result<V, To>;

  /**
   * Checks if the `Ok` value meets a specified condition, but only if the `Result` is `Ok`.
   * @param {function(V): boolean} predicate A function to test the `Ok` value, executed only if the `Result` is `Ok`.
   * @returns {Result<V, E | Empty>} Maintains the original `Result` if the condition is met; if not, or if the `Result` is `Err`, returns an `Err` with an empty error.
   * @todo type tests
   */
  public check(predicate: (value: V) => boolean): Result<V, E | Empty>;

  /**
   * Checks if the `Ok` value meets a specified condition, but only if the `Result` is `Ok`.
   * @template Ex The type of the additional error.
   * @param {Predicate<V>} predicate A function to test the `Ok` value, executed only if the `Result` is `Ok`.
   * @param {Ex} error The error to use in the resulting `Err` if the predicate fails.
   * @returns {Result<V, E | Ex>} Maintains the original `Result` if the condition is met; if not, or if the `Result` is `Err`, returns an `Err` with the specified error.
   * @todo type tests
   */
  public check<Ex>(predicate: Predicate<V>, error: Ex): Result<V, E | Ex>;

  /**
   * @internal
   * Checks if the `Ok` value satisfies a predicate and returns the original `Result` or an `Err` with an optional error.
   * @template Ex The type of the additional error, defaulting to `E`.
   * @param predicate A function that evaluates the `Ok` value.
   * @param error Optional error to use in the resulting `Err` if the predicate fails.
   * @returns The original `Result` if `Ok` value satisfies the predicate or an `Err` with the optional error.
   */
  public check<Ex = E>(
    predicate: Predicate<V>,
    error?: Ex
  ): Result<V, E> | Result<V, E | Ex> | Result<V, E | Empty> {
    if (this.isErr()) return this;
    if (predicate(this.take())) return this;
    return error !== undefined
      ? Result.Err<E | Ex>(error)
      : Result.Err<E | Empty>();
  }

  /**
   * Asserts the `Ok` value of the `Result` matches a type guard and returns a new `Result` with the asserted type.
   * @template To The type to assert the `Ok` value to.
   * @param guard A type guard function to assert the `Ok` value.
   * @returns A `Result<To, E | Empty>` with the asserted `Ok` value or the original `Err`.
   * @todo runtime tests
   * @todo type tests
   */
  public assert<To extends V>(guard: Assertion<V, To>): Result<To, E | Empty>;

  /**
   * Asserts the `Ok` value of the `Result` matches a type guard and returns a new `Result` with the asserted type or a provided error.
   * @template To The type to assert the `Ok` value to.
   * @template Ex The type of the additional error.
   * @param guard A type guard function to assert the `Ok` value.
   * @param error The error to use in the resulting `Err` if the assertion fails.
   * @returns A `Result<To, E | Ex>` with the asserted `Ok` value or the provided error.
   * @todo runtime tests
   * @todo type tests
   */
  public assert<To extends V, Ex>(
    guard: Assertion<V, To>,
    error: Ex
  ): Result<To, E | Ex>;

  /**
   * @internal
   * Asserts the `Ok` value of the `Result` matches a type guard and returns a new `Result` with the asserted type or an optional error.
   * @template To The type to assert the `Ok` value to.
   * @template Ex The type of the additional error, defaulting to `E`.
   * @param guard A type guard function to assert the `Ok` value.
   * @param error Optional error to use in the resulting `Err` if the assertion fails.
   * @returns A `Result<To, E>` or `Result<V, E | Ex>` or `Result<V, E | Empty>` with the asserted `Ok` value or error.
   */
  public assert<To extends V, Ex = E>(
    guard: Assertion<V, To>,
    error?: Ex
  ): Result<To, E> | Result<V, E | Ex> | Result<V, E | Empty> {
    if (this.isErr()) return this;
    if (guard(this.take())) return this as unknown as Result<To, E>;
    return error !== undefined
      ? Result.Err<E | Ex>(error)
      : Result.Err<E | Empty>();
  }

  /**
   * @todo docs
   * @todo runtime tests
   * @todo type tests
   */
  public unfold(): Result.Unfold<V, E> {
    const self = this.toUnion();

    // @ts-expect-error
    if (self.isErr()) return this;

    // @ts-expect-error
    if (!(self.value instanceof Result)) return this;

    // @ts-expect-error
    return self.value;
  }

  /**
   * Returns the original `Result` if it's `Ok`, otherwise returns the provided alternative `Result`.
   * Its recomended to pass in a function that returns a Result to differ said computation until absolutely needed.
   * @template R The type of the alternative `Result`.
   * @param other The alternative `Result` or a function that returns a `Result` based on the original `Err` value.
   * @returns The original `Result` if it's `Ok`, otherwise the alternative `Result`.
   * @todo runtime tests
   * @todo type tests
   */
  public or<R extends Result.Any>(
    other: R | ((error: E) => R)
  ): Result<V, E> | R {
    if (this.isOk()) return this;
    return typeof other === "function" ? other(this.takeErr()) : other;
  }

  /**
   * @todo docs
   * @todo runtime tests
   * @todo type tests
   */
  public orIf<R extends Result.Any>(
    predicate: Predicate<E>,
    other: R | ((error: E) => R)
  ): Result<V, E> | R {
    if (this.isOk()) return this;
    return predicate(this.takeErr())
      ? typeof other === "function"
        ? other(this.takeErr())
        : other
      : this;
  }

  /**
   * @todo docs
   * @todo runtime tests
   * @todo type tests
   */
  public toUnion(): Result.Union<V, E> {
    if (this instanceof Ok || this instanceof Err) return this;
    throw Error(
      "trying to convert to union a object thats not Ok or Err instance"
    );
  }

  /**
   * @todo docs
   * @todo type tests
   */
  public toBase(): Result<V, E> {
    return this;
  }

  /**
   * Creates a new `Ok` result with an empty value.
   * @returns An `Ok` result containing an empty value.
   */
  public static Ok(): Ok<Empty>;

  /**
   * Creates a new `Ok` result with a value.
   * @template V The type of the value.
   * @param value The value to store in the `Ok` result.
   * @returns An `Ok` result containing the value.
   */
  public static Ok<V>(value: V): Ok<V>;

  /**
   * @internal
   * Creates a new `Ok` result, which may contain a value or be empty.
   * @template V The type of the value.
   * @param value The value to store in the `Ok` result, if provided.
   * @returns An `Ok` result containing the value or an empty `Ok` result.
   */
  public static Ok<V>(value?: V): Ok<V> | Ok<Empty> {
    return value !== undefined ? new Ok<V>(value) : new Ok<Empty>(EMPTY);
  }

  /**
   * Creates a new `Err` result that may contain an error or be empty. Specify a type to create an `Err<E | Empty>`.
   * @see {@link Result.Err<E>(error: E): Err<E>} To create a specific `Err<E>` without the `Empty`
   * @template E The type of the error.
   * @returns An `Err<E | Empty>` result that may contain an error or be empty.
   */
  public static Err<E = Empty>(): Err<E | Empty>;

  /**
   * Creates a new `Err` result containing the provided error.
   * @template E The type of the error.
   * @param error The error to store in the `Err` result.
   * @returns An `Err` result containing the error.
   */
  public static Err<E>(error: E): Err<E>;

  /**
   * @internal
   * Creates a new `Err` result, which may contain an error or be empty.
   * @template E The type of the error.
   * @param error The error to store in the `Err` result, if provided.
   * @returns An `Err` result containing the error or an empty `Err` result.
   */
  public static Err<E>(error?: E): Err<E> | Err<E | Empty> {
    return error !== undefined ? new Err<E>(error) : new Err<E | Empty>(EMPTY);
  }

  /**
   * Converts a promise or a promise-returning function into a `Promise<Result<V, unknown>>`.
   * @template V The type of resolved value of the promise.
   * @param promise A promise or a function that returns a promise to convert.
   * @returns A promise that resolves to a `Result` of the value or unknown error.
   */
  public static async FromPromise<V>(
    promise: Promise<V> | (() => Promise<V>)
  ): Promise<Result<V, unknown>>;

  /**
   * Converts a promise or a promise-returning function into a `Promise<Result<V, E>>`, mapping the error using a provided function.
   * @template V The type of resolved value of the promise.
   * @template E The type of the error after being mapped.
   * @param promise A promise or a function that returns a promise to convert.
   * @param mapper A function to map the caught error to type `E`.
   * @returns A promise that resolves to a `Result` of the value or mapped error.
   */
  public static async FromPromise<V, E>(
    promise: Promise<V> | (() => Promise<V>),
    mapper: (error: unknown) => E
  ): Promise<Result<V, E>>;

  /**
   * @internal
   * Converts a promise or a promise-returning function into a `Promise<Result<V, E | unknown>>`, optionally mapping the error.
   * @template V The type of resolved value of the promise.
   * @template E The type of the error after being mapped, if a mapper is provided.
   * @param promise A promise or a function that returns a promise to convert.
   * @param mapper Optional function to map the caught error to type `E`.
   * @returns A promise that resolves to a `Result` of the value or error.
   */
  public static async FromPromise<V, E>(
    promise: Promise<V> | (() => Promise<V>),
    mapper?: (error: unknown) => E
  ): Promise<Result<V, E> | Result<V, unknown>> {
    try {
      return typeof promise === "function"
        ? Result.Ok(await promise())
        : Result.Ok(await promise);
    } catch (e) {
      return mapper ? Result.Err(mapper(e)) : Result.Err(e);
    }
  }

  /**
   * Attempts to execute a function and captures the result or error in a `Result`, with error mapping.
   * @template V The type of the value returned by the function.
   * @template E The type of the error after being mapped.
   * @param fn The function to execute.
   * @param mapper A function to map the caught error to type `E`.
   * @returns A `Result<V, E>` capturing the function's return value or mapped error.
   */
  public static FromTryCatch<V, E>(
    fn: () => V,
    mapper: (error: unknown) => E
  ): Result<V, E>;

  /**
   * Attempts to execute a function and captures the result or error in a `Result`.
   * @template V The type of the value returned by the function.
   * @param fn The function to execute.
   * @returns A `Result<V, unknown>` capturing the function's return value or error.
   */
  public static FromTryCatch<V>(fn: () => V): Result<V, unknown>;

  /**
   * @internal
   * Attempts to execute a function and captures the result or error in a `Result`, optionally with error mapping.
   * @template V The type of the value returned by the function.
   * @template E The type of the error after being mapped, if a mapper is provided.
   * @param fn The function to execute.
   * @param mapper Optional function to map the caught error to type `E`.
   * @returns A `Result<V, unknown>` or `Result<V, E>` capturing the function's return value or error.
   */
  public static FromTryCatch<V, E>(
    fn: () => V,
    mapper?: Mapper<unknown, E>
  ): Result<V, unknown> | Result<V, E> {
    try {
      return Result.Ok(fn());
    } catch (e) {
      return mapper ? Result.Err(mapper(e)) : Result.Err(e);
    }
  }
}

export class Ok<V> extends Result<V, never> {
  get value() {
    return this._value;
  }

  public constructor(private readonly _value: V) {
    super();
  }

  take(): V {
    return this.value;
  }

  takeErr(): never {
    throw Result.ERROR.takeErr;
  }

  isOk(): true {
    return true;
  }

  isErr(): false {
    return false;
  }

  onErr(_: (errors: never) => any): Ok<V> {
    return this;
  }

  onOk(fn: (value: V) => any): Ok<V> {
    fn(this.value);
    return this;
  }

  map<To>(mapper: Mapper<V, To>): Ok<To> {
    return Result.Ok(mapper(this.value));
  }

  refine<To>(_mapper: Mapper<never, To>): Ok<V> {
    return this;
  }

  chain<To, Ex>(chain: Mapper<V, Result<To, Ex>>): Result<To, Ex> {
    return Result.Ok(chain(this.value)).unfold();
  }
}

export class Err<E> extends Result<never, E> {
  constructor(private _error: E) {
    super();
  }

  get error() {
    return this._error;
  }

  take(): never {
    throw Result.ERROR.take;
  }

  takeErr(): E {
    return this.error;
  }

  isOk(): false {
    return false;
  }

  isErr(): true {
    return true;
  }

  onOk(_: (value: never) => any): Err<E> {
    return this;
  }

  onErr(fn: (errors: E) => any): Err<E> {
    fn(this.error);
    return this;
  }

  map<To>(_mapper: Mapper<never, To>): Err<E> {
    return this;
  }

  refine<To>(mapper: Mapper<E, To>): Err<To> {
    return Result.Err(mapper(this.error));
  }

  chain<To, Ex>(_chain: Mapper<never, Result<To, Ex>>): Err<E> {
    return this;
  }
}

export namespace Result {
  /**
   * Represents a union type of Ok or Err, encapsulating a successful value or an error.
   * @template V The type of the value for successful results.
   * @template E The type of the error for failed results.
   */
  export type Union<V = void, E = void> = Ok<V> | Err<E>;

  /** @internal */
  export type Any = Result<any, any>;

  /**
   * Extracts the error type from a `Result` type.
   * @template R The Result type to extract the error from. Must extend `Result`
   */
  export type ExtractErr<R extends Any> = R extends Result<any, infer E>
    ? E
    : never;

  /**
   * Extracts the `Ok`'s value type from a `Result` type.
   * @template R - The Result type to extract the value from. Must extends `Result`
   */
  export type ExtractOk<R extends Any> = R extends Result<infer V, any>
    ? V
    : never;

  export type Unfold<V, E> = V extends Result<infer U, infer F>
    ? Result<U, E | F>
    : Result<V, E>;

  export const ERROR = {
    take: new Error("Trying to take value from `Err` instance"),
    takeErr: new Error("Trying to take error from `Ok` instance"),
  } as const;
}
