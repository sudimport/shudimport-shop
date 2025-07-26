// src/components/account/AccountSidebar.tsx
'use client';

import Link from 'next/link';
import { FaUser, FaHeart, FaShoppingCart } from 'react-icons/fa';

export type AccountPage =
  | 'user'
  | 'zugang'
  | 'wunschliste'
  | 'einkaufliste';

interface AccountSidebarProps {
  active: AccountPage;
  hasCustomer?: boolean;
}

export default function AccountSidebar({
  active,
  hasCustomer,
}: AccountSidebarProps) {
  const itemClass = (page: AccountPage) =>
    `block px-2 py-1 rounded ${
      active === page
        ? 'text-green-700 font-semibold'
        : 'text-gray-700 hover:underline'
    }`;

  return (
    <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
      <h2 className="text-lg font-semibold text-green-700 mb-4">Profil</h2>

      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/user" className={itemClass('user')}>
            👤 Profil
          </Link>
        </li>
        <li>
          <Link href="/zugang" className={itemClass('zugang')}>
            ✅ Zugang bestätigen
          </Link>
        </li>

        {/* Liste */}
        <div className="border-t pt-3 mt-3">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Listen</h3>
          <li>
            <Link
              href="/wunschliste"
              className={itemClass('wunschliste') + ' flex items-center gap-1'}
            >
              <FaHeart className="text-red-500" />
              Wunschliste
            </Link>
          </li>
          <li>
            <Link
              href="/einkaufliste"
              className={itemClass('einkaufliste') + ' flex items-center gap-1'}
            >
              <FaShoppingCart className="text-blue-500" />
              Einkaufliste
            </Link>
          </li>
        </div>

        {/* Solo se c’è un cliente collegato */}
        {hasCustomer && (
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Kunde</h3>
            <li>
              <Link href="/preise" className="hover:underline">
                💰 Meine Preise
              </Link>
            </li>
          </div>
        )}
      </ul>
    </aside>
  );
}
