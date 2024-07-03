import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { FirebaseContext } from "./Firebase/context";
import firebase from "./Firebase/config";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FirebaseContext.Provider value={{ firebase }}>
    <App />
  </FirebaseContext.Provider>
);
