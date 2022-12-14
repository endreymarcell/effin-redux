import React from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { counterSlice } from "./demo-app/slices/counter";

export const Component: React.FunctionComponent = () => {
  const count = useAppSelector((state) => state.counter.count);
  const fizzBuzz = useAppSelector((state) => state.fizzBuzz.value);
  const isCounting = useAppSelector((state) => state.counter.isCounting);
  const isWaitingForExternalNumber = useAppSelector((state) => state.counter.isWaitingForExternalNumber);

  const dispatch = useAppDispatch();
  const onStartCountingClicked = () => dispatch(counterSlice.actions.startCountingClicked());
  const onStopCountingClicked = () => dispatch(counterSlice.actions.stopCountingClicked());
  const onIncreaseCountClicked = () => dispatch(counterSlice.actions.increaseCountClicked());
  const onResetClicked = () => dispatch(counterSlice.actions.resetCountClicked());
  const onRequestExternalNumberClicked = () => dispatch(counterSlice.actions.externalNumberRequested());
  const onSpecificNumberRequested = (input: number) =>
    dispatch(counterSlice.actions.specificNumberRequested({ requestedNumber: input }));

  const [inputNumber, setInputNumber] = React.useState(0);

  return (
    <div className="container">
      <article style={{ width: "50%", minWidth: "600px", marginInline: "auto" }}>
        <header style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
          <img alt="effin-redux logo" src="/static/logo-xs.png" style={{ width: "48px", height: "48px" }} />
          <h1 style={{ marginBottom: 0 }}>effin-redux showcase</h1>
        </header>
        <button className="outline" id="current-count" style={{ cursor: "initial" }}>
          Count is {count}
        </button>
        <button className="outline secondary" id="current-fizzbuzz" style={{ cursor: "initial" }}>
          {fizzBuzz ?? "-"}
        </button>
        <div className="grid">
          <button onClick={onStartCountingClicked} disabled={isCounting}>
            Start counting ▶
          </button>
          <button onClick={onStopCountingClicked} disabled={!isCounting}>
            Stop counting ■
          </button>
        </div>
        <div className="grid">
          <button onClick={onIncreaseCountClicked} disabled={isCounting}>
            Increase
          </button>
          <button onClick={onResetClicked} disabled={isCounting || count === 0}>
            Reset
          </button>
        </div>
        <div>
          <button
            onClick={onRequestExternalNumberClicked}
            aria-busy={isWaitingForExternalNumber}
            disabled={isCounting || isWaitingForExternalNumber}
          >
            Request external number
          </button>
        </div>
        <div className="grid">
          <input
            type="number"
            id="input-number"
            value={inputNumber}
            onChange={(event) => setInputNumber(parseInt(event.target.value))}
            style={{ textAlign: "right" }}
            disabled={isCounting}
          />
          <button onClick={() => onSpecificNumberRequested(inputNumber)} disabled={isCounting || inputNumber === 0}>
            Request this number
          </button>
        </div>
        <footer>
          <a
            href="https://github.com/endreymarcell/effin-redux"
            target="_blank"
            style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center" }}
          >
            <svg width="24" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fill="#24292f"
              />
            </svg>
            github.com/endreymarcell/effin-redux
          </a>
        </footer>
      </article>
    </div>
  );
};
