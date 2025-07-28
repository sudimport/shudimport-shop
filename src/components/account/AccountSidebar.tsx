'use client';
import Link from 'next/link';
import {
  FaKey, FaBoxOpen, FaFileInvoice, FaExclamationTriangle,
  FaHome, FaCheckSquare, FaHeart, FaShoppingCart, FaMoneyBill
} from 'react-icons/fa';

type Page =
  | 'password' | 'bestellungen' | 'dokumente' | 'anomalien'
  | 'adresse'  | 'zugang'
  | 'wunschliste' | 'einkaufliste'
  | 'preise';

interface Props {
  active: Page;
  hasCustomer?: boolean;
}

const items: {section: string; pages: {id: Page; href: string; label: string; icon: JSX.Element}[]}[] = [
  {
    section: 'Profil',
    pages: [
      { id: 'password',      href: '/password',       label: 'Passwort ändern',      icon: <FaKey/> },
      { id: 'bestellungen',  href: '/bestellungen',   label: 'Bestellungen',         icon: <FaBoxOpen/> },
      { id: 'dokumente',     href: '/dokumente',      label: 'Dokumente',            icon: <FaFileInvoice/> },
      { id: 'anomalien',     href: '/anomalien',      label: 'Anomalien',            icon: <FaExclamationTriangle/> },
      { id: 'adresse',       href: '/adresse',        label: 'Adresse',              icon: <FaHome/> },
    ],
  },
  {
    section: 'Listen',
    pages: [
      { id: 'wunschliste',   href: '/wunschliste',    label: 'Wunschliste',          icon: <FaHeart/> },
      { id: 'einkaufliste',  href: '/einkaufliste',   label: 'Einkaufliste',         icon: <FaShoppingCart/> },
    ],
  },
  {
    section: 'Kunde',
    pages: [
      { id: 'preise',        href: '/preise',         label: 'Meine Preise',         icon: <FaMoneyBill/> },
    ],
  },
];

export default function AccountSidebar({ active, hasCustomer }: Props) {
  return (
    <aside className="w-full md:w-64 bg-gray-100 p-5 border-r border-gray-200">
      {items.map(({section, pages}) => (
        (section !== 'Kunde' || hasCustomer) && (
          <div key={section} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{section}</h3>
            <ul className="space-y-2 text-sm">
              {pages.map(p => (
                (section !== 'Kunde' || hasCustomer) && (
                  <li key={p.id}>
                    <Link
                      href={p.href}
                      className={`flex items-center gap-2 hover:underline
                        ${active === p.id ? 'text-green-700 font-medium' : 'text-gray-700'}`}
                    >
                      {p.icon}
                      {p.label}
                    </Link>
                  </li>
                )
              ))}
            </ul>
            {section !== 'Kunde' && <hr className="mt-4 border-gray-300" />}
          </div>
        )
      ))}
    </aside>
  );
}
