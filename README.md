# Effin Redux

Extend [redux-toolkit](https://redux-toolkit.js.org/) with effects and more.

Check out the [live demo](https://endreymarcell.github.io/effin-redux/) (ideally using [Redux DevTools](https://github.com/reduxjs/redux-devtools)) and [the code behind it](https://github.com/endreymarcell/effin-redux/blob/master/src/app/app.ts).

## Allow both horizontal and vertical combination of reducers

_This functionality is optional._

`combineReducers` combines reducers horizontally, with each of them getting their own slice of the state.  
`reduceReducers` chains reducers vertically, letting them update the same piece of state, one after the other.

effin-redux combines the two to create a reducer matrix, with multiple layers of combined reducers.
This allows you to create slices that depend on the state returned from other slices.

This is not going against redux-toolkit: the documentation [points out](https://github.com/redux-utilities/reduce-reducers) that its combineReducers is just one possible helper for modularizing the reducer of larger apps.

### Usage

You define the composition of your slices when constructing the store:

```typescript
// app.ts
import { counterSlice, CounterState } from "$app/slices/counter";
import { infoSlice, InfoState } from "$app/slices/info";
import { fizzBuzzSlice, FizzBuzzState } from "$app/slices/fizzBuzz";

export type AppState = {
  counter: CounterState;
  info: InfoState;
  fizzBuzz: FizzBuzzState;
};

const sliceLayers = [[counterSlice, infoSlice], [fizzBuzzSlice]] as const;
const appReducer = buildReducerMatrix<AppState>(sliceLayers);
export const store = configureStore<AppState>({ reducer: appReducer });
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

Of course, this means that the order of the layers in the reducer matrix matters.

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
