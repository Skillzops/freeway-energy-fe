import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "mobx-react";
import rootStore from "./stores/rootStore";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider rootStore={rootStore}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
