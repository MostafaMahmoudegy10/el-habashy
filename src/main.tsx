import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fontsource-variable/cairo/wght.css";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>,
);
