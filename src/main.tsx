import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { XprProvider } from "./contexts/XprContext";
import { Buffer } from "buffer";

// Polyfill Buffer for the Proton SDK
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(
  <XprProvider>
    <App />
  </XprProvider>
);