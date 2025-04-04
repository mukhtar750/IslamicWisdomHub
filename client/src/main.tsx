import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render the minimal app first to ensure basic functionality works
createRoot(document.getElementById("root")!).render(<App />);
