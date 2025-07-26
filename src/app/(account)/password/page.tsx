'use client';

import UserLayout from '';

export default function PasswordPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">🔑 Passwort ändern</h1>
      <p className="text-sm text-gray-700 mb-2">Hier können Sie Ihr Passwort ändern.</p>
      <form className="space-y-4 max-w-sm">
        <input type="password" placeholder="Altes Passwort" className="w-full border p-2 rounded" />
        <input type="password" placeholder="Neues Passwort" className="w-full border p-2 rounded" />
        <input type="password" placeholder="Neues Passwort wiederholen" className="w-full border p-2 rounded" />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Speichern</button>
      </form>
    </UserLayout>
  );
}
