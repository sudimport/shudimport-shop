// src/app/api/suche-suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get('term')?.trim();
  if (!term || term.length < 2) {
    return NextResponse.json({ produkte: [], kategorien: [] });
  }

  try {
    // Build LIKE term
    const likeTerm = `%${term}%`;

    // 1) Products search
    const prodUrl = new URL(`${process.env.ERP_URL}/api/resource/Item`);
    prodUrl.searchParams.append('fields', JSON.stringify(["name","item_name","image","item_group","standard_rate"]));
    prodUrl.searchParams.append('filters', JSON.stringify([["item_name","like", likeTerm],["disabled","=",0]]));
    prodUrl.searchParams.append('limit_page_length', '8');
    prodUrl.searchParams.append('order_by', 'item_name');

    const prodRes = await fetch(prodUrl.toString(), {
      headers: { 'Authorization': `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}` },
      cache: 'no-store',
    });
    let produkte: any[] = [];
    if (prodRes.ok) {
      const { data } = await prodRes.json();
      produkte = data.map((item: any) => ({
        name: item.name,
        item_name: item.item_name,
        image: item.image,
        price: item.standard_rate ?? null,
        item_group: item.item_group,
      }));
    }

    // 2) Categories search
    const catUrl = new URL(`${process.env.ERP_URL}/api/resource/Item Group`);
    catUrl.searchParams.append('fields', JSON.stringify(["name"]));
    catUrl.searchParams.append('filters', JSON.stringify([["name","like", likeTerm]]));
    catUrl.searchParams.append('limit_page_length', '5');
    catUrl.searchParams.append('order_by', 'name');

    const catRes = await fetch(catUrl.toString(), {
      headers: { 'Authorization': `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}` },
      cache: 'no-store',
    });
    let kategorien: any[] = [];
    if (catRes.ok) {
      const { data } = await catRes.json();
      kategorien = data.map((c: any) => ({ name: c.name, label: c.name }));
    }

    // 3) Fallback code search if no products
    if (produkte.length === 0) {
      const codeUrl = new URL(`${process.env.ERP_URL}/api/resource/Item`);
      codeUrl.searchParams.append('fields', JSON.stringify(["name","item_name","image","item_group","standard_rate"]));
      codeUrl.searchParams.append('filters', JSON.stringify([["name","like", likeTerm],["disabled","=",0]]));
      codeUrl.searchParams.append('limit_page_length', '8');
      codeUrl.searchParams.append('order_by', 'name');

      const codeRes = await fetch(codeUrl.toString(), {
        headers: { 'Authorization': `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}` },
        cache: 'no-store',
      });
      if (codeRes.ok) {
        const { data } = await codeRes.json();
        const codeResults = data.map((item: any) => ({
          name: item.name,
          item_name: item.item_name,
          image: item.image,
          price: item.standard_rate ?? null,
          item_group: item.item_group,
        }));
        produkte.push(...codeResults);
      }
    }

    return NextResponse.json({ produkte, kategorien });
  } catch (err) {
    console.error('API Error /suche-suggest', err);
    return NextResponse.json({ produkte: [], kategorien: [], error: 'Search failed' });
  }
}
