import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BicyclesPage from "./pages/BicyclesPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="navbar">
          <div className="navbar-brand">
            <span className="navbar-logo">🚲</span>
            <span>Bicycle Rental</span>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/bicycles" replace />} />
            <Route path="/bicycles" element={<BicyclesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
