import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchBicycle } from "../api/bicycles";
import { createRental } from "../api/rentals";
import "./BicyclesPage.css";

export default function BicycleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bicycle, setBicycle] = useState(null);
  const [userId, setUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const load = () =>
    fetchBicycle(id)
      .then(setBicycle)
      .catch(() => setError("Failed to load bicycle"));

  useEffect(() => {
    load();
  }, [id]);

  const openRent = () => {
    setUserId("");
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setError(null);
  };

  const handleRent = async (e) => {
    e.preventDefault();
    try {
      await createRental({
        bicycle_id: Number(id),
        user_id: Number(userId),
      });
      closeForm();
      navigate("/rentals");
    } catch {
      setError("Failed to start rental");
    }
  };

  if (!bicycle && !error) {
    return <p className="page-subtitle">Loading…</p>;
  }

  if (!bicycle) {
    return <div className="alert">{error}</div>;
  }

  const isAvailable = bicycle.status === "available";

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bicycle #{bicycle.id}</h1>
          <p className="page-subtitle">
            <Link to="/bicycles" className="nav-link" style={{ padding: 0 }}>
              ← Back to inventory
            </Link>
          </p>
        </div>
        {isAvailable && (
          <button className="btn btn-primary" onClick={openRent}>
            Rent this bicycle
          </button>
        )}
      </div>

      {error && !showForm && <div className="alert">{error}</div>}

      <div className="card">
        <table className="bicycle-table">
          <tbody>
            <tr>
              <th style={{ textAlign: "left", padding: "14px 20px" }}>ID</th>
              <td className="id-cell">#{bicycle.id}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "14px 20px" }}>Brand</th>
              <td style={{ fontWeight: 500 }}>{bicycle.brand}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "14px 20px" }}>Type</th>
              <td>{bicycle.type}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "14px 20px" }}>Status</th>
              <td>
                <span className={`badge badge-${bicycle.status}`}>{bicycle.status}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRent}>
              <div className="modal-header">
                <h2 className="modal-title">Rent bicycle #{bicycle.id}</h2>
              </div>
              <div className="modal-body">
                {error && <div className="alert">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Bicycle</label>
                  <input
                    className="form-control"
                    value={`#${bicycle.id} — ${bicycle.brand} (${bicycle.type})`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">User ID</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
