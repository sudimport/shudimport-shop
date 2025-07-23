import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Shop Sudimport',
  description: 'I migliori prodotti italiani – vendita all’ingrosso e dettaglio',
  // Next.js 13.4+ supporterà direttamente il tag <html lang="de">
  locale: 'de',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Non dichiari più manualmente lang, Next lo inietterà coerentemente
    // aggiungi suppressHydrationWarning per sicurezza su SSR
    <html suppressHydrationWarning>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
