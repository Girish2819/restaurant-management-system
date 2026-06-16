import { useState } from "react";
import api from "../../api/axios";

const WaiterList = ({ waiters, onRefresh, onAddWaiter }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this waiter? Their login will stop working immediately.")) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/auth/waiters/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete waiter");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
     <div className="flex items-center justify-between mb-5">
  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
    Members
  </h2>

  <button
    type="button"
    onClick={onAddWaiter}
    className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
  >
    + Add Member
  </button>
</div>
      <div className="space-y-3">
        {waiters.map((waiter) => (
          <div
            key={waiter._id}
            className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-slate-900 text-sm font-medium">{waiter.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                @{waiter.username} {waiter.phone ? `· ${waiter.phone}` : ""} {waiter.role ? `· ${waiter.role}` : ""} {waiter.gender ? `· ${waiter.gender}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(waiter._id)}
              disabled={deletingId === waiter._id}
              className="text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded border border-red-200 hover:border-red-300 disabled:opacity-50"
            >
              {deletingId === waiter._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
        {waiters.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">No waiters yet</p>
        )}
      </div>
    </div>
  );
};

export default WaiterList;
