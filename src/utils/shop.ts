export type Prodotto = {
  name: string
  item_name: string
  image: string | null
  price?: string
  original_price?: string
  discount?: string
}

export async function getItemsWithPrice(
  items: Prodotto[],
  minSconto = 10,
  maxSconto = 70
): Promise<Prodotto[]> {
  return Promise.all(
    items.map(async (item) => {
      try {
        const res = await fetch(`/api/prezzi?item=${encodeURIComponent(item.name)}`)
        if (!res.ok) return item

        const data = await res.json()
        if (!data.price) return item

        const discount = minSconto + Math.random() * (maxSconto - minSconto)
        const original = data.price * (1 + discount / 100)

        return {
          ...item,
          price: data.price.toFixed(2),
          original_price: original.toFixed(2),
          discount: Math.round(discount).toString(),
        }
      } catch (e) {
        console.error(`Errore fetch prezzo per ${item.name}`, e)
        return item
      }
    })
  )
}
