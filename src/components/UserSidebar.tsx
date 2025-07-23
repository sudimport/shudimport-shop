// codice sidebar interno...
function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 min-h-screen border-r">
      <nav className="flex flex-col space-y-2">
        <Link href="/user">👤 Mein Profil</Link>
        <Link href="/bestellungen">📦 Bestellungen</Link>
        <Link href="/dokumente">📄 Dokumente</Link>
        {/* ...ecc */}
      </nav>
    </aside>
  )
}
