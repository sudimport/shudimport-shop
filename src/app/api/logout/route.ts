export async function POST() {
  try {
    // Logout anche su ERPNext
    const frappeLogout = await fetch('https://gestionale.sudimport.website/api/method/logout', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await frappeLogout.json();

    return new Response(JSON.stringify({ success: true, frappe: result }), {
      status: 200,
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Logout failed' }), {
      status: 500,
    });
  }
}
