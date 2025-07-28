// ~/shop/src/app/api/debug-user/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userEmail = req.headers.get('x-user');
  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Email not valid' }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔍 Debugging user:', userEmail);

    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(userEmail)}`,
      { headers }
    );
    
    if (!userRes.ok) {
      return NextResponse.json({ 
        error: 'User not found',
        email: userEmail,
        status: userRes.status 
      });
    }
    
    const userData = await userRes.json();
    const linkedCustomer = userData.data?.linked_customer;

    let customerData = null;
    if (linkedCustomer) {
      const customerRes = await fetch(
        `${process.env.ERP_URL}/api/resource/Customer/${encodeURIComponent(linkedCustomer)}`,
        { headers }
      );
      if (customerRes.ok) {
        customerData = await customerRes.json();
      }
    }

    return NextResponse.json({
      debug: {
        userEmail,
        userExists: !!userData.data,
        linkedCustomer,
        customerExists: !!customerData?.data,
        userFields: Object.keys(userData.data || {}),
      },
      userData: userData.data,
      customerData: customerData?.data || null,
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
