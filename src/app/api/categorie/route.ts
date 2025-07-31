import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`
  }

  try {
    let allGroups: string[] = []
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const url = `${process.env.ERP_URL}/api/resource/Item?fields=["item_group"]&limit_page_length=500&limit_start=${offset}`
      const res = await fetch(url, { headers })
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data : []

      const groupNames = data.map(i => i.item_group).filter(Boolean)
      allGroups = allGroups.concat(groupNames)

      hasMore = data.length === 500
      offset += 500
    }

    // Conta le occorrenze per categoria
    const counts: Record<string, number> = {}
    for (const g of allGroups) {
      counts[g] = (counts[g] || 0) + 1
    }

    // Converte in array ordinato alfabeticamente
    const result = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))  // 🅰️🆚️🅱️ ordinamento alfabetico

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Errore API categorie paginata:', error)
    return NextResponse.json({ error: 'Errore nel recupero categorie' }, { status: 500 })
  }
}
