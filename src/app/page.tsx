//nano ~/shop/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Offerte from '../components/Offerte';
import AngebotDesMonats from '../components/AngebotDesMonats';
import NuoviArrivi from '@/components/NuoviArrivi';

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

      {/* Nuovi Arrivi */}
      <NuoviArrivi />
      {/* Prodotto del Mese */}
      <AngebotDesMonats />
      {/* Offerte Speciali */}
      <Offerte />
      {/* Altre sezioni future */}
    </div>
  );
}
