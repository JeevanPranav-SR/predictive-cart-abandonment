import { formatMoney } from "../utils/features.js";

export default function CartItem({ item, onQuantity, onRemove }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4">
      <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-ink/50" data-price="true">
            {formatMoney(item.price)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onQuantity(item.id, item.quantity - 1)} className="h-8 w-8 rounded-full bg-mist">
            −
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onQuantity(item.id, item.quantity + 1)} className="h-8 w-8 rounded-full bg-mist">
            +
          </button>
          <button type="button" onClick={() => onRemove(item.id)} className="ml-auto text-xs text-ink/45">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
