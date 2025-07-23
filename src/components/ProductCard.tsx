'use client';

import Image from 'next/image';

type Product = {
  name: string;
  item_name: string;
  image: string | null;
  price: number | null;
};

export default function ProductCard({ name, item_name, image, price }: Product) {
  return (
    <div className="border rounded-lg shadow-md p-4 flex flex-col justify-between bg-white">
      <div className="aspect-square bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
        {image ? (
          <Image src={`https://gestionale.sudimport.website${image}`} alt={item_name} width={300} height={300} className="object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>
      <h3 className="text-sm font-semibold mb-2">{item_name}</h3>
      {price !== null ? (
        <p className="text-green-600 font-bold text-sm mb-2">{price.toFixed(2)} €</p>
      ) : (
        <p className="text-gray-400 text-sm mb-2">Prezzo su richiesta</p>
      )}
      <button className="mt-auto bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 text-sm">
        Aggiungi al carrello
      </button>
    </div>
  );
}
