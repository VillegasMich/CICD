import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBicycles, createBicycle, updateBicycle, deleteBicycle } from "../api/bicycles";
import "./BicyclesPage.css";

const EMPTY_FORM = { brand: "", type: "", status: "available" };

export default function BicyclesPage() {
  const [bicycles, setBicycles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const load = () =>
    fetchBicycles()
      .then(setBicycles)
      .catch(() => setError("Failed to load bicycles"));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (b) => {
    setForm({ brand: b.brand, type: b.type, status: b.status });
    setEditingId(b.id);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBicycle(editingId, form);
      } else {
        await createBicycle(form);
      }
      closeForm();
      load();
    } catch {
      setError("Failed to save bicycle");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bicycle?")) return;
    try {
      await deleteBicycle(id);
      load();
    } catch {
      setError("Failed to delete bicycle");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bicycle inventory</h1>
          <p className="page-subtitle">Manage the fleet of available bicycles</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add bicycle
        </button>
      </div>

      {error && !showForm && <div className="alert">{error}</div>}

      <div className="card">
        <table className="bicycle-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bicycles.map((b) => (
              <tr key={b.id}>
                <td className="id-cell">#{b.id}</td>
                <td style={{ fontWeight: 500 }}>{b.brand}</td>
                <td>{b.type}</td>
                <td>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </td>
                <td>
                  <div className="actions" style={{ justifyContent: "flex-end" }}>
                    <Link to={`/bicycles/${b.id}`} className="btn btn-icon">
                      View
                    </Link>
                    <button className="btn btn-icon" onClick={() => openEdit(b)}>
                      Edit
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(b.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bicycles.length === 0 && (
              <tr>
                <td colSpan="5" className="table-empty">
                  No bicycles yet — click "Add bicycle" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2 className="modal-title">{editingId ? "Edit bicycle" : "New bicycle"}</h2>
              </div>
              <div className="modal-body">
                {error && <div className="alert">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Trek"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <input
                    className="form-control"
                    placeholder="e.g. mountain"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
