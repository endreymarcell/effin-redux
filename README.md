# Effin Redux

![effin-redux logo](static/logo-sm.png)

Extend [redux-toolkit](https://redux-toolkit.js.org/) with effects and more.

Check out the [live demo](https://endreymarcell.github.io/effin-redux/) (ideally using [Redux DevTools](https://github.com/reduxjs/redux-devtools)) and [the code behind it](https://github.com/endreymarcell/effin-redux/blob/master/src/app/app.ts).

![Test status](https://github.com/endreymarcell/effin-redux/actions/workflows/tests.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/effin-redux?color=blue)

# Features

## Allow both horizontal and vertical combination of reducers

- `combineReducers` combines reducers horizontally, with each of them getting their own slice of the state.
This is great for organizing your state, but it provides no solution for when you need to access the state of a slice from another slice. The Redux FAQ itself has no single recommendation, but mentions writing a custom `combineReducers` implementation as a possible solution.
- `reduceReducers` chains reducers vertically, letting them update the same piece of state, one after the other. This is great for acting on the same piece of state, but provides no help when it comes to modularizing the shape of your state.

effin-redux combines the two. This allows you to create slices that depend on the state returned from other slices.

<details>
<summary>Expand to read more...</summary>

### Usage

When passing your reducers to `configureStore()`, use the custom `combineSlices()` implementation of effin-redux:

```typescript
// app.ts
const slices = [counterSlice, infoSlice, fizzBuzzSlice] as const; // const is mandatory, and the order matters
const appReducer = combineSlices(slices);
export const store = configureStore({ reducer: appReducer });
export type AppState = ReturnType<typeof store.getState>
```

Make sure to also create the `readAppState()` helper:

```typescript
export const { readAppState } = getHelpers<AppState>();
```

In your slices, you can use the `readAppState()` helper to get access to the root state, not just the slice's state:

```typescript
// slices/fizzBuzz.ts
import { readAppState } from "$app";

export const fizzBuzzSlice = createSlice({
  name: "fizzBuzz",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder.addMatcher(
    (action) => action.type.startsWith("counter"),
    (state) => {
      // state only refers to the state of this one slice
      // but with readAppState, you can get access to the state of other slices too:
      const appState = readAppState(state);
      const currentNumber = appState.counter.count;
      state.value = calculateFizzBuzz(currentNumber);
    },
  ),
});
```

#### References

- [combineReducers (redux docs)](https://redux.js.org/api/combinereducers)
- [reduceReducers (github)](https://github.com/redux-utilities/reduce-reducers)
- [Redux FAQ entry about sharing state between reducers](https://redux.js.org/faq/reducers#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)

</details>

## Allow calculating side effects in the reducer

Redux Toolkit, the opinionated redux library includes the Thunk middleware by default and recommends using it for side effects.
However, triggering side effects by dispatching thunks from within the application goes against what redux is trying to achieve!

**The application's logic should live in its reducer.** This is already true for state transitions. But calculating which side effect to trigger and with what arguments is part of the logic too, and it's deeply connected to those state transitions. Why should it be placed in UI components?

effin-redux adds helpers that let your reducer describe what side effects it wants to trigger, and then triggers them on your behalf.
The effects themselves are described by the same thunks that redux-toolkit provides.

<details>
<summary>Expand to read more...</summary>

### Usage

Use the provided `configureStore()` implementation to get side effects:
```typescript
import { configureStore } from "effin-redux";

export const store = configureStore(appReducer);
```

Alternatively, if you need to use the original `configureStore()` function from redux-toolkit, you can patch your reducer manually via effin-redux's `withEffects()` helper:

```typescript
import { withEffects } from "effin-redux";

export const store = configureStore<AppState>({ reducer: withEffects(appReducer) });
```

Define your effects for your slices:

```typescript
import { createEffectInputs, createEffects, forSlice, addEffect } from "effin-redux";

const inputs = createEffectInputs<CounterState>()({
  fetchExternalNumber: () => {
    return fetch("https://www.randomnumberapi.com/api/v1.0/random?count=1")
      .then((response) => response.json())
      .then((parsedResponse: [number]) => {
        return parsedResponse[0];
      });
  },
  setSpecificNumber: async ({ requestedNumber }: { requestedNumber: number }) => {
    return { requestedNumber };
  },
});

const effects = createEffects<CounterState>()(inputs, forSlice("counter"));
```

Then schedule them in your reducer:

```typescript
export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    externalNumberRequested: (state) => {
      addEffect(state, effects.fetchExternalNumber());
      addEffect(state, effects.consoleLog());
    },
    specificNumberRequested: (state, action: PayloadAction<{ requestedNumber: number }>) => {
      addEffect(state, effects.setSpecificNumber({ requestedNumber: action.payload.requestedNumber }));
    },
  }),
```

And handle them like any other async thunk:
```typescript
  extraReducers: (builder) =>
    builder
      .addCase(effects.fetchExternalNumber.pending, (state) => {
        state.isWaitingForExternalNumber = true;
      })
      .addCase(effects.fetchExternalNumber.fulfilled, (state, action) => {
        state.isWaitingForExternalNumber = false;
        state.count = action.payload;
      })
      .addCase(effects.setSpecificNumber.fulfilled, (state, action) => {
        state.count = action.payload.requestedNumber;
      }),
  ),
});
```

Using the Redux Developer Tools, you will be able to inspect what effects has been scheduled by your reducer, and also when it is being executed.

#### References

- [How can I represent side effects such as AJAX calls? (redux docs)](https://redux.js.org/faq/actions#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
- [Trying to put side effects in the correct place (redux github issue)](https://github.com/reduxjs/redux/issues/291)

</details>

## Recover lost state type in createSlice reducers

When defining slices via `createSlice()`, the type of the `state` argument within the `reducers` object should be correctly inferred.
Unfortunately, this feature broke with a TypeScript change.

effin-redux adds helpers to work around this - you still have to add the type explicitly, but now at least you only have to do it once, not in every case.

<details>
<summary>Expand to read more...</summary>

### Usage

Just wrap your slices' reducers and extraReducers with the appropriate helpers:
```typescript
import { createExtraReducers, createReducers } from "effin-redux";

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: createReducers<CounterState>()({
    // ...case reducers
  }),
  extraReducers: createExtraReducers<CounterState>((builder) => {
    // ...extra reducers
  }),
});
```

#### References

- [State argument on createSlice is no longer inferred with typescript beta 4.8 and they do not plan to fix it (redux-toolkit github issue)](https://github.com/reduxjs/redux-toolkit/issues/2543)

</details>

# Installation

```typescript
npm install effin-redux
```

The package is distributed as CJS and comes with TypeScript type definitions included.
