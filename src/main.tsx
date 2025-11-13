import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initializePWA } from "./utils/pwa";
import { initializeZoomPrevention } from "./utils/zoomPrevention";

// Initialize PWA features
initializePWA();

// Initialize zoom prevention for mobile devices
initializeZoomPrevention();

// Render app with error boundary
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
