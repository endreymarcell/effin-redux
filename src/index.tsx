import React from 'react';

import { createAppStore } from "$app";
import { counterSlice } from "$app/slices/counter";
import { createRoot } from "react-dom/client";

const store = createAppStore();
store.dispatch(counterSlice.actions.externalNumberRequested());
setTimeout(() => console.log(store.getState()), 1000);

const App: React.FunctionComponent = () => {
  return <div>hali</div>;
}

const rootNode = document.getElementById('app');
if (!rootNode) {
  throw new Error(`Failed to render into <div id="app"> as there is no such dif on the page.`)
}

const root = createRoot(rootNode)
root.render(<App />)
