import type { ReactNode } from 'react';
import AccountSidebar from '@/components/AccountSidebar';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* sidebar ri-utilizzabile */}
      <AccountSidebar />

      {/* contenuto della pagina corrente */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
