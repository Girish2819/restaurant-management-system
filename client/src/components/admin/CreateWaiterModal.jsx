import { useState } from "react";
import api from "../../api/axios";

const CreateWaiterModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("waiter");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/waiters", { name, phone, role, gender });
      setCredentials({
        name: data.name,
        username: data.username,
        password: data.generatedPassword,
      });
      setName("");
      setPhone("");
      setRole("waiter");
      setGender("");
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create waiter");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials(null);
    setName("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
        {credentials ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Member Created</h2>
            <p className="text-slate-600 text-sm mb-5">
              Share these credentials with {credentials.name}. They cannot be recovered.
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Username</p>
                <p className="text-slate-900 font-mono text-sm">{credentials.username}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Password</p>
                <p className="text-emerald-600 font-mono text-sm">{credentials.password}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Add Member</h2>
            <p className="text-slate-600 text-sm mb-5">
              Username and password will be generated automatically
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Phone number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="helper">Helper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="lady">Lady</option>
                  <option value="gents">Gents</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? "Creating..." : "Create Member"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateWaiterModal;
