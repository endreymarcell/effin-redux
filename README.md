# Effin Redux

Extend the amazing [redux-toolkit](https://redux-toolkit.js.org/) with the following:

## Allow both horizontal and vertical combination of reducers

`combineReducers` combines reducers horizontally, with each of them getting their own slice of the state.  
`reduceReducers` chains reducers vertically, letting them update the same piece of state, one after the other.  

effin-redux combines the two to create a reducer matrix, with multiple layers of combined reducers.
This allows you to create slices that depend on the state returned from other slices.


## Side effects are returned from the reducer, too

Triggering side effects by dispatching thunks from within the application goes against what redux is trying to achieve.
The application should dispatch the action describing what happened in the application, and the reducer should decide what happens next.

effin-redux adds helpers that let your reducer describe what side effects it wants to trigger, and then triggers them on your behalf.
The effects themselves are described by the same thunks that redux-toolkit provides.


## Recover lost state type in createSlice reducers

When defining slices via `createSlice()`, the type of the `state` argument within the `reducers` object should be correctly inferred.
Unfortunately, this feature broke with a TypeScript change.

effin-redux adds helpers to work around this - you still have to add the type explicitly, but now at least you only have to do it once, not in every case.

Related:
- https://github.com/reduxjs/redux-toolkit/issues/2543
- https://github.com/microsoft/TypeScript/issues/49307
- https://github.com/microsoft/TypeScript/issues/48812
- https://github.com/reduxjs/redux-toolkit/pull/2547
