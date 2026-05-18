import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { XprProvider } from "./contexts/XprContext";

createRoot(document.getElementById("root")!).render(
  <XprProvider>
    <App />
  </XprProvider>
);
