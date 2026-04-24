import { BrowserRouter, Routes, Route, Navigate, NavLink, Link } from "react-router-dom";
import BicyclesPage from "./pages/BicyclesPage";
import BicycleDetailPage from "./pages/BicycleDetailPage";
import RentalsPage from "./pages/RentalsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🚲</span>
        <span>Bicycle Rental</span>
      </div>
      <nav className="navbar-links">
        {user && (
          <>
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
          </>
        )}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        {user ? (
          <>
            <span className="page-subtitle" style={{ margin: 0 }}>
              {user.name}{user.role === "admin" ? " (admin)" : ""}
            </span>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/bicycles" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/bicycles"
              element={
                <ProtectedRoute>
                  <BicyclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bicycles/:id"
              element={
                <ProtectedRoute>
                  <BicycleDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rentals"
              element={
                <ProtectedRoute>
                  <RentalsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
