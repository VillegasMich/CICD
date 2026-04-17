import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import BicyclesPage from "./pages/BicyclesPage";
import BicycleDetailPage from "./pages/BicycleDetailPage";
import RentalsPage from "./pages/RentalsPage";
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
          <nav className="navbar-links">
            <NavLink
              to="/bicycles"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Bicycles
            </NavLink>
            <NavLink
              to="/rentals"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Rentals
            </NavLink>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/bicycles" replace />} />
            <Route path="/bicycles" element={<BicyclesPage />} />
            <Route path="/bicycles/:id" element={<BicycleDetailPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
