# Effin Redux

![effin-redux logo](static/logo-sm.png)

Extend [redux-toolkit](https://redux-toolkit.js.org/) with effects and more.

Check out the [live demo](https://endreymarcell.github.io/effin-redux/) (ideally using [Redux DevTools](https://github.com/reduxjs/redux-devtools)) and [the code behind it](https://github.com/endreymarcell/effin-redux/blob/master/src/app/app.ts).

![Test status](https://github.com/endreymarcell/effin-redux/actions/workflows/tests.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/effin-redux?color=blue)

## Allow both horizontal and vertical combination of reducers

_This functionality is optional._

`combineReducers` combines reducers horizontally, with each of them getting their own slice of the state.  
`reduceReducers` chains reducers vertically, letting them update the same piece of state, one after the other.

effin-redux combines the two. This allows you to create slices that depend on the state returned from other slices.

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
      const currentNumber = readAppState(state).counter.count;
      state.value = calculateFizzBuzz(currentNumber);
    },
  ),
});
```

#### References

- [combineReducers (redux docs)](https://redux.js.org/api/combinereducers)
- [reduceReducers (github)](https://github.com/redux-utilities/reduce-reducers)

## Allow calculating side effects in the reducer

_This functionality is optional._

Triggering side effects by dispatching thunks from within the application goes against what redux is trying to achieve.
The application should dispatch the action describing what happened in the application, and the reducer should decide what happens next.

effin-redux adds helpers that let your reducer describe what side effects it wants to trigger, and then triggers them on your behalf.
The effects themselves are described by the same thunks that redux-toolkit provides.

### Usage

Use the `withEffects()` helper to make your store capable of handling effects:

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

const effects = createEffects(initialState, inputs, forSlice("counter"));
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

#### References

- [How can I represent side effects such as AJAX calls? (redux docs)](https://redux.js.org/faq/actions#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
- [Trying to put side effects in the correct place (redux github issue)](https://github.com/reduxjs/redux/issues/291)

## Recover lost state type in createSlice reducers

_This functionality is optional._

When defining slices via `createSlice()`, the type of the `state` argument within the `reducers` object should be correctly inferred.
Unfortunately, this feature broke with a TypeScript change.

effin-redux adds helpers to work around this - you still have to add the type explicitly, but now at least you only have to do it once, not in every case.

### Usage

Just wrap your slices' reducers and extraReducers with the appropriate helpers:
```typescript
import { createExtraReducers, createReducers } from "$lib";

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
