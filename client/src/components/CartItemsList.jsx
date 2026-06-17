import { formatCurrency } from "../utils/format";

const CartItemsList = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  cartTotal,
  onComplete,
  submitting,
  completeLabel = "Complete Order",
  variant = "light",
}) => {
  if (!cartItems.length) return null;

  const isGlass = variant === "glass";

  return (
    <div className="mt-4">
      <div className="space-y-3 mb-4">
        {cartItems.map((item, index) => (
          <div
            key={`${item._id}-${index}`}
            className={`rounded-xl px-4 py-3 ${
              isGlass
                ? "bg-white/15 border border-white/20"
                : "bg-slate-50 border border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isGlass ? "text-white" : "text-slate-900"
                  }`}
                >
                  {item.name}
                </p>
                <p
                  className={`text-xs ${isGlass ? "text-white/60" : "text-slate-500"}`}
                >
                  {item.code}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div
                  className={`flex items-center rounded-lg border ${
                    isGlass ? "border-white/30" : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(index, -1)}
                    className={`px-3 py-2 min-w-[44px] min-h-[44px] text-lg ${
                      isGlass
                        ? "text-white hover:bg-white/10"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className={`px-3 py-2 text-sm font-medium min-w-[2rem] text-center ${
                      isGlass ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(index, 1)}
                    className={`px-3 py-2 min-w-[44px] min-h-[44px] text-lg ${
                      isGlass
                        ? "text-white hover:bg-white/10"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isGlass ? "text-emerald-300" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className={`px-2 py-2 min-w-[44px] min-h-[44px] text-lg ${
                    isGlass
                      ? "text-white/60 hover:text-red-300"
                      : "text-slate-400 hover:text-red-500"
                  }`}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t ${
          isGlass ? "border-white/20" : "border-slate-200"
        }`}
      >
        <div>
          <p
            className={`text-xs mb-1 ${
              isGlass ? "text-white/60" : "text-slate-500"
            }`}
          >
            Total amount
          </p>
          <p
            className={`text-2xl font-bold ${
              isGlass ? "text-white" : "text-slate-900"
            }`}
          >
            {formatCurrency(cartTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={submitting}
          className={`w-full sm:w-auto px-6 py-3 font-medium rounded-xl disabled:opacity-50 transition min-h-[48px] ${
            isGlass
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {submitting ? "Saving..." : completeLabel}
        </button>
      </div>
    </div>
  );
};

export default CartItemsList;
