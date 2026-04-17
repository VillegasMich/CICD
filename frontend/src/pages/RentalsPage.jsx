import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRentals, completeRental } from "../api/rentals";
import "./BicyclesPage.css";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);

  const load = () =>
    fetchRentals()
      .then(setRentals)
      .catch(() => setError("Failed to load rentals"));

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (id) => {
    if (!window.confirm("Complete this rental?")) return;
    try {
      await completeRental(id);
      load();
    } catch {
      setError("Failed to complete rental");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rentals</h1>
          <p className="page-subtitle">
            Track active and completed bicycle rentals — start a rental from the{" "}
            <Link to="/bicycles">bicycle inventory</Link>.
          </p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="card">
        <table className="bicycle-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Bicycle</th>
              <th>User</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r.id}>
                <td className="id-cell">#{r.id}</td>
                <td>
                  <Link to={`/bicycles/${r.bicycle_id}`}>#{r.bicycle_id}</Link>
                </td>
                <td>#{r.user_id}</td>
                <td>{formatDate(r.start_time)}</td>
                <td>{formatDate(r.end_time)}</td>
                <td>
                  <span className={`badge badge-${r.status === "active" ? "rented" : "available"}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div className="actions" style={{ justifyContent: "flex-end" }}>
                    {r.status === "active" && (
                      <button className="btn btn-icon" onClick={() => handleComplete(r.id)}>
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan="7" className="table-empty">
                  No rentals yet — go to the inventory and rent a bicycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
