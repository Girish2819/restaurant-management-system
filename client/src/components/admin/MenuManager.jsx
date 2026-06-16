import { useEffect, useState } from "react";
import api from "../../api/axios";

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchMenu = async () => {
    try {
      const { data } = await api.get("/menu");
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!code || !name || !category || !price) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await api.post("/menu", {
        code,
        name,
        category,
        price: Number(price),
      });
      setCode("");
      setName("");
      setCategory("");
      setPrice("");
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      await api.delete(`/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
    }
  };

  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  const openEdit = (item) => {
    setEditingItem(item);
    setEditPrice(item.price || "");
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      await api.put(`/menu/${editingItem._id}`, { price: Number(editPrice) });
      setEditingItem(null);
      fetchMenu();
    } catch (err) {
      console.error("Failed to update menu item:", err);
    }
  };

  const handleDeleteFromEdit = async () => {
    if (!editingItem) return;
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/menu/${editingItem._id}`);
      setEditingItem(null);
      fetchMenu();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Menu Manager</h2>
          <p className="text-slate-600 text-sm">
            Add menu items once and let waiters search by name, code, or category.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateMenuItem} className="grid gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. ST01"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Category
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Paneer Dishes"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Menu item name"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 220"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateMenuItem}
        disabled={saving}
        className="mb-6 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Menu Item"}
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-5 text-slate-500 text-sm text-center">
                  Loading menu...
                </td>
              </tr>
            ) : menuItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-5 text-slate-500 text-sm text-center">
                  No menu items available.
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item._id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-900">{item.code}</td>
                  <td className="px-4 py-3 text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-right text-slate-900">₹{item.price}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="text-slate-700 hover:text-slate-900 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editingItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditingItem(null)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Edit {editingItem.name}</h3>
            <div className="mb-4">
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Price</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingItem(null)} className="flex-1 py-2.5 rounded-lg border">Cancel</button>
              <button onClick={handleDeleteFromEdit} className="py-2.5 px-4 rounded-lg text-red-600 border border-red-200">Delete</button>
              <button onClick={handleUpdate} className="py-2.5 px-4 rounded-lg bg-slate-900 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
