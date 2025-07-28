import { cookies } from 'next/headers';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug?: string[] };
}) {
  const hasCustomer = !!cookies().get('customer')?.value;
  const active = (params?.slug?.[0] as any) ?? 'user';   // “user” di default

  return (
    <div className="flex min-h-screen">
      <AccountSidebar active={active} hasCustomer={hasCustomer} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
