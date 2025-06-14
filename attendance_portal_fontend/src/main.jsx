import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/Attendance_Tracker">
    <App />
  </BrowserRouter>
);
