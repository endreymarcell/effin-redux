import React from "react";

import { store } from "./demo-app/app";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { Component } from "./Component";

const App: React.FunctionComponent<{ store: ToolkitStore }> = ({ store }) => {
  return (
    <Provider store={store}>
      <Component />
    </Provider>
  );
};

const rootNode = document.getElementById("app");
if (!rootNode) {
  throw new Error(`Failed to render into <div id="app"> as there is no such dif on the page.`);
}

const root = createRoot(rootNode);

root.render(<App store={store} />);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
