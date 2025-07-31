'use client';

import { useCartStore } from '../store/cart';
import { FaShoppingCart } from 'react-icons/fa';

export default function CartIcon() {
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded transition-colors"
    >
      <FaShoppingCart className="w-5 h-5" />
      
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
