import { Product, CartItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Minus } from 'lucide-react';

interface ProductRowProps {
  product: Product;
  cartItem?: CartItem;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function ProductRow({ product, cartItem, onAdd, onIncrease, onDecrease }: ProductRowProps) {
  const quantity = cartItem?.quantity || 0;
  const { t } = useLanguage();

  return (
    <div className="product-row">
      {/* Product Info */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className={`font-medium ${!product.inStock ? 'text-muted-foreground' : 'text-foreground'}`}>
          {product.name}
        </h4>
        <p className="text-primary font-semibold mt-1">
          ₹{product.price}
          {product.unit && <span className="text-muted-foreground font-normal text-sm"> / {product.unit}</span>}
        </p>
        {!product.inStock && (
          <span className="text-destructive text-sm">{t.outOfStock}</span>
        )}
      </div>

      {/* Add/Quantity Controls */}
      <div className="flex-shrink-0">
        {!product.inStock ? (
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
          >
            {t.outOfStock}
          </button>
        ) : quantity === 0 ? (
          <button
            onClick={onAdd}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm active:scale-95 transition-transform touch-manipulation"
          >
            {t.addToCart}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onDecrease}
              className="qty-btn"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
            <button
              onClick={onIncrease}
              className="qty-btn bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
