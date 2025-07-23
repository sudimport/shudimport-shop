'use client';

import UserLayout from '../user/UserLayout';

export default function ZugangPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">✅ Zugang bestätigen</h1>
      <p className="text-sm text-gray-700">Sie müssen Ihre Registrierung abschließen oder durch den Admin freigegeben werden.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Status: In Prüfung</div>
    </UserLayout>
  );
}
