// src/app/(account)/layout.tsx
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 👉 qui metterai in futuro la Sidebar riusabile */}
      <aside className="w-64 border-r border-gray-200 bg-gray-100 p-4">
        {/* Placeholder temporaneo */}
        <nav className="space-y-2 text-sm">
          <a href="/user">👤 Profil</a><br/>
          <a href="/einkaufliste">🛒 Einkaufliste</a><br/>
          <a href="/wunschliste">❤️ Wunschliste</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
