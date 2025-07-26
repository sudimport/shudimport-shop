'use client';

import { FaHeart } from 'react-icons/fa';

export default function FavoritenPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaHeart className="text-red-500" /> Meine Favoriten
      </h1>
      {/* TODO: lista preferiti */}
    </div>
  );
}
