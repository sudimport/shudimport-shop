'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Carousel from '../components/Carousel';
import Offerte from '../components/Offerte';
import AngebotDesMonats from '../components/AngebotDesMonats';

type Prodotto = {
  name: string;
  item_name: string;
  image: string | null;
};

export default function HomePage() {
  const [items, setItems] = useState<Prodotto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/prodotti?page=1&limit=8')
      .then(res => res.json())
      .then(data => setItems(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Banner Carousel */}
      <Carousel />

      {/* Angebot des Monats */}
      <AngebotDesMonats />

      {/* Offerte Speciali */}
      <Offerte />

     {/* Categorie Sudimport */}
    </div>
  );
}
