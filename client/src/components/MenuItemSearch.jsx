import { useState, useEffect, useRef } from "react";

const MenuItemSearch = ({
  menuItems,
  onSelect,
  label = "Search & select item",
  labelClassName = "text-slate-600",
  placeholder = "Search by name, code or category...",
  inputClassName = "",
  dropdownClassName = "",
}) => {
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = menuItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    onSelect(item);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`text-xs font-semibold mb-2 block ${labelClassName}`}>
        {label}
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      {showDropdown && (
        <div
          className={`absolute top-full left-0 right-0 z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto overscroll-contain ${dropdownClassName}`}        >
          {filteredItems.length > 0 ? (
            filteredItems.slice(0, 30).map((item) => (
              <button
                key={item._id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-3 min-h-[48px]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {item.code} — {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600 shrink-0">
                  ₹{item.price}
                </p>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-slate-500 text-sm">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuItemSearch;
